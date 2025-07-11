// src/tools/generateInstruction.ts
import { z } from "zod";
import { Tool } from "../types.js";
import { zodToJsonSchema } from "../utils/validation.js";
import { complete } from "../llm/index.js";
import { InstructionSchema, InstructionContextSchema } from "../schemas/instruction.js";
import { DesignSchema } from "../schemas/design.js";
import { ComponentSchema } from "../schemas/component.js";
import { getLogger } from "../utils/logger.js";

// Input schema for the generateInstruction tool
const inputSchema = z.object({
  design: DesignSchema.optional().describe("Design data from parseDesignAndGenerateTokens tool"),
  components: z.array(ComponentSchema).optional().describe("Component data from analyzeComponents tool"),
  options: z.object({
    framework: z.string().optional().default("react").describe("Target framework (react, vue, angular, etc.)"),
    styleSystem: z.string().optional().default("tailwind").describe("Styling approach (tailwind, styled-components, css, etc.)"),
    testFramework: z.string().optional().describe("Testing framework (jest, vitest, cypress, etc.)"),
    buildTool: z.string().optional().describe("Build tool (vite, webpack, next, etc.)"),
    packageManager: z.string().optional().default("npm").describe("Package manager (npm, yarn, pnpm)"),
    typescript: z.boolean().optional().default(true).describe("Use TypeScript"),
    targetDirectory: z.string().optional().default("./src/components").describe("Target directory for components"),
    generateTests: z.boolean().optional().default(true).describe("Generate test files"),
    generateStories: z.boolean().optional().default(true).describe("Generate Storybook stories"),
    customInstructions: z.string().optional().describe("Additional custom instructions")
  }).optional().default({})
});

// Instruction generation prompt template
const INSTRUCTION_GENERATION_PROMPT = `# Component Implementation Instructions Generator

You are a senior software engineer creating detailed implementation instructions for building React components based on design specifications and existing component patterns.

## Task
Generate comprehensive step-by-step implementation instructions that follow the InstructionSchema format.

## Input Context
**Design Data:** {design}
**Component Analysis:** {components}
**Options:** {options}

## Instructions Requirements

### 1. Steps Array
Create detailed implementation steps with:
- Clear, actionable descriptions
- Proper ordering and dependencies
- Specific file paths and operations
- Type annotations for create/modify/delete operations

### 2. Files Object
Include all files to be created/modified:
- Component files (.tsx/.jsx)
- Style files (.css/.scss)
- Test files (.test.tsx)
- Story files (.stories.tsx)
- Type definition files (.d.ts)
- Configuration files

### 3. Context Object
Provide implementation context:
- Framework and styling preferences
- File structure and naming conventions
- Dependencies and imports
- Testing approach

## Output Format
Return a JSON object matching this exact structure:

\`\`\`json
{
  "steps": [
    {
      "description": "Install required dependencies",
      "type": "install",
      "order": 1,
      "dependencies": []
    },
    {
      "description": "Create component directory structure",
      "type": "create", 
      "order": 2,
      "dependencies": ["1"]
    }
  ],
  "files": {
    "src/components/Button/index.tsx": "export { Button } from './Button';",
    "src/components/Button/Button.tsx": "// Component implementation..."
  },
  "metadata": {
    "title": "Implementation Instructions",
    "description": "Step-by-step guide for implementing components",
    "difficulty": "medium",
    "estimatedTime": "2-3 hours"
  },
  "context": {
    "framework": "react",
    "styleSystem": "tailwind",
    "typescript": true,
    "targetDirectory": "./src/components"
  }
}
\`\`\`

## Key Principles
1. **Actionable Steps**: Each step should be concrete and executable
2. **Proper Dependencies**: Steps should reference prerequisites by ID
3. **Complete File Content**: Provide full, working file implementations
4. **Best Practices**: Follow modern React/TypeScript patterns
5. **Testing**: Include comprehensive test coverage
6. **Documentation**: Include inline comments and documentation

## Framework-Specific Considerations
- **React**: Use functional components with hooks
- **TypeScript**: Proper type definitions and interfaces
- **Tailwind**: Utility-first CSS classes
- **Testing**: Jest/Testing Library patterns
- **Storybook**: Proper story structure with controls

Generate detailed, production-ready implementation instructions that a developer can follow to build the components successfully.`;

// Helper function to prepare context for the prompt
function prepareContext(design: any, components: any[], options: Record<string, any>): string {
  const context = {
    design: design ? {
      tokens: design.tokens?.length || 0,
      components: design.components?.length || 0,
      hasColors: design.tokens?.some((t: any) => t.type === 'color'),
      hasSpacing: design.tokens?.some((t: any) => t.type === 'spacing'),
      hasTypography: design.tokens?.some((t: any) => t.type === 'typography'),
      description: design.metadata?.description
    } : null,
    components: components?.length ? {
      count: components.length,
      names: components.map(c => c.name),
      commonProps: extractCommonProps(components),
      patterns: extractPatterns(components)
    } : null,
    options
  };
  
  return JSON.stringify(context, null, 2);
}

// Helper function to extract common prop patterns
function extractCommonProps(components: any[]): string[] {
  const propCounts = new Map<string, number>();
  
  components.forEach(comp => {
    if (comp.propTypes) {
      comp.propTypes.forEach((prop: any) => {
        propCounts.set(prop.name, (propCounts.get(prop.name) || 0) + 1);
      });
    }
  });
  
  // Return props used by at least 30% of components
  const threshold = Math.max(1, Math.floor(components.length * 0.3));
  return Array.from(propCounts.entries())
    .filter(([, count]) => count >= threshold)
    .map(([name]) => name);
}

// Helper function to extract naming patterns
function extractPatterns(components: any[]): string[] {
  const patterns: string[] = [];
  
  // Check for naming patterns
  const hasIndex = components.some(c => c.name.includes('Index'));
  const hasButton = components.some(c => c.name.includes('Button'));
  const hasCard = components.some(c => c.name.includes('Card'));
  const hasModal = components.some(c => c.name.includes('Modal'));
  
  if (hasIndex) patterns.push('Uses index files for exports');
  if (hasButton) patterns.push('Button components present');
  if (hasCard) patterns.push('Card components present');
  if (hasModal) patterns.push('Modal components present');
  
  return patterns;
}

// Helper function to validate instruction output
function validateInstructionOutput(output: string): any {
  const logger = getLogger();
  
  try {
    // Try to parse as JSON
    const parsed = JSON.parse(output);
    
    // Validate against schema
    const result = InstructionSchema.safeParse(parsed);
    
    if (!result.success) {
      logger.error('❌ Instruction validation failed:', result.error.format());
      throw new Error(`Invalid instruction format: ${result.error.message}`);
    }
    
    return result.data;
  } catch (error) {
    logger.error('❌ Failed to parse instruction output', undefined, error instanceof Error ? error : new Error(String(error)));
    throw new Error(`Invalid JSON output: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Main tool export
export const generateInstructionTool: Tool = {
  definition: {
    name: "generateInstruction",
    description: "Generate component implementation instructions by combining design data and component analysis to create actionable step-by-step guidance for developers",
    inputSchema: zodToJsonSchema(inputSchema)
  },
  
  async handler(input) {
    const logger = getLogger();
    
    try {
      // Validate input
      const validatedInput = inputSchema.parse(input);
      const { design, components = [], options = {} } = validatedInput;
      
      logger.info('🔄 Generating implementation instructions...');
      
      // Check if we have any input data
      if (!design && (!components || components.length === 0)) {
        throw new Error('At least one of design or components data must be provided');
      }
      
      // Prepare context for the prompt
      const contextString = prepareContext(design, components, options as Record<string, any>);
      
      // Generate the prompt
      const prompt = INSTRUCTION_GENERATION_PROMPT
        .replace('{design}', design ? JSON.stringify(design, null, 2) : 'null')
        .replace('{components}', components.length ? JSON.stringify(components, null, 2) : 'null')
        .replace('{options}', JSON.stringify(options, null, 2));
      
      logger.debug('📝 Sending prompt to LLM...');
      
      // Call LLM
      const response = await complete(prompt, {
        temperature: 0.2,
        max_tokens: 6000
      }) as string;
      
      // Validate and parse response
      const instructions = validateInstructionOutput(response);
      
      logger.info('✅ Successfully generated implementation instructions');
      logger.debug(`📊 Generated ${instructions.steps?.length || 0} steps and ${Object.keys(instructions.files || {}).length} files`);
      
      return {
        content: [{
          type: "text",
          text: JSON.stringify(instructions, null, 2)
        }],
        metadata: {
          stepsCount: instructions.steps?.length || 0,
          filesCount: Object.keys(instructions.files || {}).length,
          difficulty: instructions.metadata?.difficulty || 'medium',
          estimatedTime: instructions.metadata?.estimatedTime || 'Unknown'
        }
      };
      
    } catch (error) {
      logger.error('❌ Error generating instructions', undefined, error instanceof Error ? error : new Error(String(error)));
      
      return {
        content: [{
          type: "text",
          text: `Error generating instructions: ${error instanceof Error ? error.message : String(error)}`
        }],
        isError: true
      };
    }
  }
}; 