// src/tools/analyzeComponents.ts
import { z } from "zod";
import { parse } from "@babel/parser";
import fg from "fast-glob";
import { readFileSync } from "fs";
import { relative, resolve } from "path";
import { Tool } from "../types.js";
import { ComponentSchema, ComponentAnalysisSchema } from "../schemas/component.js";
import { zodToJsonSchema } from "../utils/validation.js";
import { getLogger } from "../utils/logger.js";

// Input schema for the tool - updated for SuperComponents
const inputSchema = z.object({
  paths: z.array(z.string()).optional().default(['./.supercomponents/src/components/library'])
    .describe("Paths to search for components (default: SuperComponents library directory)"),
  extensions: z.array(z.string()).optional().default(['.js', '.jsx', '.ts', '.tsx'])
    .describe("File extensions to analyze"),
  includePatterns: z.array(z.string()).optional().default([
    '**/*.{js,jsx,ts,tsx}',
    '!**/node_modules/**',
    '!**/build/**',
    '!**/dist/**',
    '!**/*.test.{js,jsx,ts,tsx}',
    '!**/*.spec.{js,jsx,ts,tsx}'
  ]).describe("Glob patterns for files to include"),
  excludePatterns: z.array(z.string()).optional().default([
    '**/node_modules/**',
    '**/build/**',
    '**/dist/**',
    '**/*.test.*',
    '**/*.spec.*'
  ]).describe("Glob patterns for files to exclude"),
  maxFiles: z.number().optional().default(1000)
    .describe("Maximum number of files to analyze"),
  includeProps: z.boolean().optional().default(true)
    .describe("Whether to extract prop type information"),
  analyzePatterns: z.boolean().optional().default(true)
    .describe("Whether to analyze naming patterns and conventions"),
  random_string: z.string().optional().describe("Dummy parameter for MCP compatibility")
});

// Helper types
interface ComponentInfo {
  name: string;
  type: 'function' | 'class' | 'arrow' | 'forwardRef' | 'memo';
  props: Record<string, any>;
  propTypes: Array<{
    name: string;
    type: string;
    required: boolean;
    defaultValue?: any;
    description?: string;
  }>;
  path: string;
  line: number;
  column: number;
  description?: string;
  exports: string[];
  dependencies: string[];
}

interface ParsedFile {
  path: string;
  components: ComponentInfo[];
  errors: string[];
  imports: string[];
  exports: string[];
}

/**
 * Discover component files using fast-glob
 */
async function discoverFiles(
  paths: string[],
  includePatterns: string[],
  excludePatterns: string[],
  maxFiles: number
): Promise<string[]> {
  const logger = getLogger();
  
  try {
    // Convert paths to absolute paths
    const resolvedPaths = paths.map(p => resolve(p));
    
    // Build patterns for each path
    const patterns: string[] = [];
    for (const basePath of resolvedPaths) {
      for (const pattern of includePatterns) {
        patterns.push(`${basePath}/${pattern}`);
      }
    }
    
    // Find files using fast-glob
    const files = await fg(patterns, {
      ignore: excludePatterns,
      absolute: true,
      onlyFiles: true,
      followSymbolicLinks: false,
      suppressErrors: true
    });
    
    // Limit the number of files
    const limitedFiles = files.slice(0, maxFiles);
    
    getLogger().debug(`🔍 Discovered ${limitedFiles.length} files (${files.length} total found)`);
    
    return limitedFiles;
  } catch (error) {
    getLogger().error(`❌ Error discovering files: ${error instanceof Error ? error.message : String(error)}`);
    throw new Error(`File discovery failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Parse a single file and extract component information
 */
function parseFile(filePath: string): ParsedFile {
  const logger = getLogger();
  const result: ParsedFile = {
    path: filePath,
    components: [],
    errors: [],
    imports: [],
    exports: []
  };
  
  try {
    // Read file content
    const content = readFileSync(filePath, 'utf8');
    
    // Parse with Babel
    const ast = parse(content, {
      sourceType: 'module',
      plugins: [
        'jsx',
        'typescript',
        'decorators-legacy',
        'classProperties',
        'objectRestSpread',
        'asyncGenerators',
        'functionBind',
        'exportDefaultFrom',
        'exportNamespaceFrom',
        'dynamicImport',
        'nullishCoalescingOperator',
        'optionalChaining',
        'optionalCatchBinding',
        'throwExpressions',
        'topLevelAwait'
      ],
      allowImportExportEverywhere: true,
      allowReturnOutsideFunction: true,
      ranges: true,
      tokens: false
    });
    
    // Extract imports, exports, and components
    extractFromAST(ast, result, filePath);
    
    getLogger().debug(`✅ Parsed ${filePath}: ${result.components.length} components found`);
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    result.errors.push(`Parse error in ${filePath}: ${errorMessage}`);
    getLogger().warn(`⚠️  Parse error in ${filePath}: ${errorMessage}`);
  }
  
  return result;
}

/**
 * Extract information from AST
 */
function extractFromAST(ast: any, result: ParsedFile, filePath: string): void {
  const logger = getLogger();
  
  // Walk through the AST
  function walk(node: any, parent: any = null): void {
    if (!node || typeof node !== 'object') return;
    
    try {
      // Extract imports
      if (node.type === 'ImportDeclaration') {
        result.imports.push(node.source.value);
      }
      
      // Extract exports
      if (node.type === 'ExportNamedDeclaration' || node.type === 'ExportDefaultDeclaration') {
        if (node.declaration) {
          if (node.declaration.id) {
            result.exports.push(node.declaration.id.name);
          }
        }
        if (node.specifiers) {
          node.specifiers.forEach((spec: any) => {
            if (spec.exported) {
              result.exports.push(spec.exported.name);
            }
          });
        }
      }
      
      // Extract React components
      const component = extractComponent(node, parent, filePath);
      if (component) {
        result.components.push(component);
      }
      
      // Recursively walk child nodes
      for (const key in node) {
        if (key !== 'parent' && key !== 'leadingComments' && key !== 'trailingComments') {
          const value = node[key];
          if (Array.isArray(value)) {
            value.forEach(child => walk(child, node));
          } else if (value && typeof value === 'object') {
            walk(value, node);
          }
        }
      }
    } catch (error) {
      getLogger().warn(`⚠️  Error walking AST node: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  walk(ast);
}

/**
 * Extract component information from AST node
 */
function extractComponent(node: any, parent: any, filePath: string): ComponentInfo | null {
  const logger = getLogger();
  
  try {
    // Function declarations: function MyComponent() {}
    if (node.type === 'FunctionDeclaration' && isReactComponent(node.id?.name)) {
      return {
        name: node.id.name,
        type: 'function',
        props: extractProps(node.params),
        propTypes: extractPropTypes(node),
        path: filePath,
        line: node.loc?.start?.line || 0,
        column: node.loc?.start?.column || 0,
        description: extractDescription(node),
        exports: [],
        dependencies: []
      };
    }
    
    // Variable declarations: const MyComponent = () => {}
    if (node.type === 'VariableDeclarator' && node.id?.name && isReactComponent(node.id.name)) {
      const componentType = getComponentType(node.init);
      if (componentType) {
        return {
          name: node.id.name,
          type: componentType,
          props: extractProps(node.init?.params || []),
          propTypes: extractPropTypes(node),
          path: filePath,
          line: node.loc?.start?.line || 0,
          column: node.loc?.start?.column || 0,
          description: extractDescription(node),
          exports: [],
          dependencies: []
        };
      }
    }
    
    // Class declarations: class MyComponent extends React.Component {}
    if (node.type === 'ClassDeclaration' && isReactComponent(node.id?.name)) {
      return {
        name: node.id.name,
        type: 'class',
        props: extractClassProps(node),
        propTypes: extractPropTypes(node),
        path: filePath,
        line: node.loc?.start?.line || 0,
        column: node.loc?.start?.column || 0,
        description: extractDescription(node),
        exports: [],
        dependencies: []
      };
    }
    
    // Call expressions: React.forwardRef(), React.memo()
    if (node.type === 'CallExpression') {
      const componentType = getWrapperComponentType(node);
      if (componentType && parent?.type === 'VariableDeclarator' && parent.id?.name) {
        return {
          name: parent.id.name,
          type: componentType,
          props: extractProps(node.arguments?.[0]?.params || []),
          propTypes: extractPropTypes(node),
          path: filePath,
          line: node.loc?.start?.line || 0,
          column: node.loc?.start?.column || 0,
          description: extractDescription(node),
          exports: [],
          dependencies: []
        };
      }
    }
    
  } catch (error) {
    getLogger().warn(`⚠️  Error extracting component: ${error instanceof Error ? error.message : String(error)}`);
  }
  
  return null;
}

/**
 * Check if a name looks like a React component
 */
function isReactComponent(name: string): boolean {
  if (!name) return false;
  // React components start with uppercase
  return /^[A-Z]/.test(name);
}

/**
 * Get component type from initializer
 */
function getComponentType(init: any): ComponentInfo['type'] | null {
  if (!init) return null;
  
  switch (init.type) {
    case 'FunctionExpression':
      return 'function';
    case 'ArrowFunctionExpression':
      return 'arrow';
    case 'CallExpression':
      return getWrapperComponentType(init);
    default:
      return null;
  }
}

/**
 * Get component type from wrapper calls (forwardRef, memo, etc.)
 */
function getWrapperComponentType(node: any): ComponentInfo['type'] | null {
  if (node.type !== 'CallExpression') return null;
  
  const callee = node.callee;
  
  // React.forwardRef
  if (callee.type === 'MemberExpression' && 
      callee.object?.name === 'React' && 
      callee.property?.name === 'forwardRef') {
    return 'forwardRef';
  }
  
  // React.memo
  if (callee.type === 'MemberExpression' && 
      callee.object?.name === 'React' && 
      callee.property?.name === 'memo') {
    return 'memo';
  }
  
  // forwardRef (direct import)
  if (callee.type === 'Identifier' && callee.name === 'forwardRef') {
    return 'forwardRef';
  }
  
  // memo (direct import)
  if (callee.type === 'Identifier' && callee.name === 'memo') {
    return 'memo';
  }
  
  return null;
}

/**
 * Extract props from function parameters
 */
function extractProps(params: any[]): Record<string, any> {
  const props: Record<string, any> = {};
  
  if (!params || params.length === 0) return props;
  
  const firstParam = params[0];
  if (firstParam?.type === 'ObjectPattern') {
    firstParam.properties?.forEach((prop: any) => {
      if (prop.type === 'ObjectProperty' && prop.key?.name) {
        props[prop.key.name] = {
          type: 'unknown',
          required: prop.value?.type !== 'AssignmentPattern',
          defaultValue: prop.value?.type === 'AssignmentPattern' ? extractValue(prop.value.right) : undefined
        };
      }
    });
  } else if (firstParam?.name) {
    props[firstParam.name] = {
      type: 'object',
      required: true
    };
  }
  
  return props;
}

/**
 * Extract props from class component
 */
function extractClassProps(node: any): Record<string, any> {
  const props: Record<string, any> = {};
  
  // Look for static propTypes
  const propTypesProperty = node.body?.body?.find((member: any) => 
    member.type === 'ClassProperty' && 
    member.key?.name === 'propTypes' &&
    member.static
  );
  
  if (propTypesProperty && propTypesProperty.value?.type === 'ObjectExpression') {
    propTypesProperty.value.properties?.forEach((prop: any) => {
      if (prop.type === 'ObjectProperty' && prop.key?.name) {
        props[prop.key.name] = {
          type: extractPropType(prop.value),
          required: !prop.value?.property?.name?.includes('isRequired')
        };
      }
    });
  }
  
  return props;
}

/**
 * Extract prop types from TypeScript interfaces or PropTypes
 */
function extractPropTypes(node: any): Array<{
  name: string;
  type: string;
  required: boolean;
  defaultValue?: any;
  description?: string;
}> {
  const propTypes: Array<{
    name: string;
    type: string;
    required: boolean;
    defaultValue?: any;
    description?: string;
  }> = [];
  
  // TODO: Implement TypeScript interface extraction
  // TODO: Implement PropTypes extraction
  
  return propTypes;
}

/**
 * Extract description from comments
 */
function extractDescription(node: any): string | undefined {
  if (node.leadingComments && node.leadingComments.length > 0) {
    const comment = node.leadingComments[node.leadingComments.length - 1];
    if (comment.type === 'CommentBlock') {
      return comment.value.trim().replace(/^\*\s?/gm, '');
    }
  }
  return undefined;
}

/**
 * Extract prop type from PropTypes expression
 */
function extractPropType(node: any): string {
  if (node.type === 'MemberExpression') {
    if (node.object?.name === 'PropTypes') {
      return node.property?.name || 'unknown';
    }
  }
  return 'unknown';
}

/**
 * Extract value from literal nodes
 */
function extractValue(node: any): any {
  switch (node.type) {
    case 'Literal':
      return node.value;
    case 'StringLiteral':
      return node.value;
    case 'NumericLiteral':
      return node.value;
    case 'BooleanLiteral':
      return node.value;
    case 'NullLiteral':
      return null;
    default:
      return undefined;
  }
}

/**
 * Analyze naming patterns and conventions
 */
function analyzePatterns(components: ComponentInfo[]): string[] {
  const patterns: string[] = [];
  
  // Analyze naming patterns
  const names = components.map(c => c.name);
  const prefixes = new Set<string>();
  const suffixes = new Set<string>();
  
  names.forEach(name => {
    // Extract common prefixes/suffixes
    const matches = name.match(/^([A-Z][a-z]+)(.*)$/);
    if (matches) {
      const prefix = matches[1];
      const suffix = matches[2];
      if (prefix && prefix.length > 1) prefixes.add(prefix);
      if (suffix && suffix.length > 1) suffixes.add(suffix);
    }
  });
  
  if (prefixes.size > 0) {
    patterns.push(`Common prefixes: ${Array.from(prefixes).join(', ')}`);
  }
  if (suffixes.size > 0) {
    patterns.push(`Common suffixes: ${Array.from(suffixes).join(', ')}`);
  }
  
  // Analyze component types
  const types = components.reduce((acc, c) => {
    acc[c.type] = (acc[c.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  if (Object.keys(types).length > 0) {
    const typeEntries = Object.entries(types);
    if (typeEntries.length > 0) {
      const dominantType = typeEntries.reduce((a, b) => a[1] > b[1] ? a : b)[0];
      patterns.push(`Dominant component type: ${dominantType}`);
    }
  }
  
  // Analyze prop patterns
  const allProps = components.flatMap(c => Object.keys(c.props));
  const propCounts = allProps.reduce((acc, prop) => {
    acc[prop] = (acc[prop] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const commonProps = Object.entries(propCounts)
    .filter(([_, count]) => count > 1)
    .map(([prop, _]) => prop);
  
  if (commonProps.length > 0) {
    patterns.push(`Common props: ${commonProps.join(', ')}`);
  }
  
  return patterns;
}

/**
 * Main handler for the analyzeComponents tool - updated for SuperComponents
 */
export const analyzeComponentsTool: Tool = {
  definition: {
    name: "analyze_components",
    description: "Analyze component structure and patterns in a codebase, optimized for SuperComponents scaffolding with shadcn/ui library",
    inputSchema: zodToJsonSchema(inputSchema)
  },
  handler: async (args) => {
    const logger = getLogger();
    
    try {
      // Handle dummy parameter case (when called via MCP with random_string)
      const processedArgs = typeof args === 'object' && 'random_string' in args ? 
        { ...args, random_string: undefined } : args;
      
      // Parse and validate input
      const input = inputSchema.parse(processedArgs || {});
      
      // Remove random_string from input if present
      const { random_string, ...cleanInput } = input;
      
      getLogger().info(`🔍 Starting SuperComponents analysis for paths: ${cleanInput.paths.join(', ')}`);

      // Discover files
      const files = await discoverFiles(
        cleanInput.paths,
        cleanInput.includePatterns,
        cleanInput.excludePatterns,
        cleanInput.maxFiles
      );
      
      if (files.length === 0) {
        getLogger().warn('⚠️  No component files found matching the criteria');
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              components: [],
              patterns: [],
              recommendations: [
                'No component files found in the specified paths',
                'If using SuperComponents, ensure .supercomponents/src/components/library/ exists',
                'Run initializeProject if you haven\'t set up SuperComponents yet'
              ],
              errors: []
            }, null, 2)
          }]
        };
      }
      
      // Parse files and extract components
      const parsedFiles: ParsedFile[] = [];
      let totalComponents = 0;
      const allErrors: string[] = [];
      
      for (const file of files) {
        const parsed = parseFile(file);
        parsedFiles.push(parsed);
        totalComponents += parsed.components.length;
        allErrors.push(...parsed.errors);
      }
      
      // Aggregate all components
      const allComponents = parsedFiles.flatMap(f => f.components);
      
      // Convert to schema format
      const schemaComponents = allComponents.map(comp => ({
        name: comp.name,
        props: comp.props,
        path: relative(process.cwd(), comp.path),
        description: comp.description,
        propTypes: comp.propTypes,
        exports: comp.exports,
        dependencies: comp.dependencies
      }));
      
             // Analyze patterns if requested
       let patterns = undefined;
       if (cleanInput.analyzePatterns) {
         patterns = analyzePatterns(allComponents);
       }
      
      // Generate recommendations for SuperComponents
      const recommendations: string[] = [];
      if (totalComponents === 0) {
        recommendations.push('No React components found. Check if paths contain React code.');
        recommendations.push('For SuperComponents, ensure the library directory exists at .supercomponents/src/components/library/');
      } else {
        recommendations.push(`✅ Found ${totalComponents} components across ${files.length} files`);
        
        if (allErrors.length > 0) {
          recommendations.push(`⚠️  ${allErrors.length} files had parsing errors and were skipped`);
        }
        
        const componentTypes = allComponents.reduce((acc, c) => {
          acc[c.type] = (acc[c.type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        
        const typesSummary = Object.entries(componentTypes)
          .map(([type, count]) => `${count} ${type}`)
          .join(', ');
        recommendations.push(`📊 Component types: ${typesSummary}`);
        
        // SuperComponents-specific recommendations
        const componentNames = allComponents.map(c => c.name);
        const hasButton = componentNames.some(name => name.toLowerCase().includes('button'));
        const hasCard = componentNames.some(name => name.toLowerCase().includes('card'));
        const hasInput = componentNames.some(name => name.toLowerCase().includes('input'));
        
        if (hasButton && hasCard && hasInput) {
          recommendations.push('🎨 Rich component library detected - suitable for complex UI development');
        }
        
        recommendations.push('🔄 Next steps: Use generateInstruction to create custom components based on these library components');
      }
      
      // Create result
      const result = {
        components: schemaComponents,
        patterns,
        recommendations,
        errors: allErrors,
        supercomponents: {
          totalComponents,
          analyzedFiles: files.length,
          libraryComponents: schemaComponents.filter(c => c.path.includes('/library/')),
          customComponents: schemaComponents.filter(c => c.path.includes('/custom/')),
          message: `📚 SuperComponents analysis complete!\n\n✅ Found ${totalComponents} components\n📁 Analyzed ${files.length} files\n\n🔄 Next steps:\n  - Use these components with generateInstruction\n  - Create custom components in src/components/custom/\n  - Generate stories in .storybook/stories/03-review/`
        }
      };
      
      // Validate result against schema
      const validatedResult = ComponentAnalysisSchema.parse(result);
      
      getLogger().info(`✅ SuperComponents analysis complete: ${totalComponents} components found`);
      
      return {
        content: [{
          type: "text",
          text: JSON.stringify(validatedResult, null, 2)
        }]
      };
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      getLogger().error(`❌ SuperComponents analysis failed: ${errorMessage}`);
      
              return {
          content: [{
            type: "text",
            text: JSON.stringify({
              components: [],
              patterns: [],
              recommendations: [
                `❌ Analysis failed: ${errorMessage}`,
                '🔧 Troubleshooting:',
                '  - Ensure .supercomponents directory exists',
                '  - Run initializeProject if not set up',
                '  - Check component library path: .supercomponents/src/components/library/',
                '  - Verify file permissions and accessibility'
              ],
              errors: [errorMessage]
            }, null, 2)
        }]
      };
    }
  }
}; 