// src/tools/generateInstruction.ts
import { z } from "zod";
import { Tool } from "../types.js";
import { zodToJsonSchema } from "../utils/validation.js";
import { complete } from "../llm/index.js";
import { InstructionSchema, InstructionContextSchema } from "../schemas/instruction.js";
import { DesignSchema } from "../schemas/design.js";
import { ComponentSchema } from "../schemas/component.js";
import { getLogger } from "../utils/logger.js";
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from "fs";
import { join, resolve } from "path";

// Input schema for the generateInstruction tool - updated for SuperComponents
const inputSchema = z.object({
  projectPath: z.string().default(".").describe("Root directory of the SuperComponents project").optional(),
  design: DesignSchema.optional().describe("Design data from parseDesignAndGenerateTokens tool"),
  components: z.array(ComponentSchema).optional().describe("Component data from analyzeComponents tool"),
  componentLibraryPath: z.string().default("./.supercomponents/src/components/library").describe("Path to the component library").optional(),
  outputDir: z.string().default("./.supercomponents/.storybook/stories/03-review").describe("Output directory for generated stories").optional(),
  options: z.object({
    framework: z.string().optional().default("react").describe("Target framework (react, vue, angular, etc.)"),
    styleSystem: z.string().optional().default("tailwind").describe("Styling approach (tailwind, styled-components, css, etc.)"),
    testFramework: z.string().optional().describe("Testing framework (jest, vitest, cypress, etc.)"),
    buildTool: z.string().optional().describe("Build tool (vite, webpack, next, etc.)"),
    packageManager: z.string().optional().default("npm").describe("Package manager (npm, yarn, pnpm)"),
    typescript: z.boolean().optional().default(true).describe("Use TypeScript"),
    targetDirectory: z.string().optional().default("./src/components/library").describe("Target directory for components"),
    generateTests: z.boolean().optional().default(true).describe("Generate test files"),
    generateStories: z.boolean().optional().default(true).describe("Generate Storybook stories"),
    customInstructions: z.string().optional().describe("Additional custom instructions")
  }).optional().default({})
});

// Helper function to read design.json from SuperComponents structure
async function readDesignData(projectPath: string): Promise<any | null> {
  const designPath = join(projectPath, '.supercomponents', 'design.json');
  
  if (existsSync(designPath)) {
    try {
      const content = readFileSync(designPath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      const logger = getLogger();
      logger.warn(`Failed to read design.json: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  return null;
}

// Helper function to scan available components in the library
async function scanComponentLibrary(libraryPath: string): Promise<string[]> {
  const components: string[] = [];
  
  if (existsSync(libraryPath)) {
    try {
      const files = readdirSync(libraryPath);
      components.push(...files.filter(file => 
        file.endsWith('.tsx') || file.endsWith('.jsx')
      ).map(file => file.replace(/\.(tsx|jsx)$/, '')));
    } catch (error) {
      const logger = getLogger();
      logger.warn(`Failed to scan component library: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  return components;
}

// Enhanced instruction generation prompt template for SuperComponents
const INSTRUCTION_GENERATION_PROMPT = `# SuperComponents Implementation Instructions Generator

You are a senior software engineer creating detailed implementation instructions for building React components using the SuperComponents scaffolding system with shadcn/ui components.

## Context
- **Project Structure**: SuperComponents scaffolding with Storybook and Tailwind CSS
- **Component Library**: Uses shadcn/ui components from .supercomponents/src/components/library/
- **Design System**: CSS variables and Tailwind config already configured
- **Target**: Create new components that extend or compose existing library components

## Input Context
**Design Data:** {design}
**Available Components:** {availableComponents}
**Component Analysis:** {components}
**Project Path:** {projectPath}
**Options:** {options}

## Task
Generate comprehensive step-by-step implementation instructions that:
1. Leverage existing shadcn/ui components from the library
2. Create new composite components based on design requirements
3. Generate Storybook stories with auto-docs in the 03-review directory
4. Follow SuperComponents patterns and conventions

## Instructions Requirements

### 1. Steps Array
Create detailed implementation steps with:
- Clear, actionable descriptions
- Proper ordering and dependencies
- Specific file paths within SuperComponents structure
- Type annotations for create/modify/delete operations
- References to existing library components

### 2. Files Object
Include files to be created in the SuperComponents structure:
- New component files in src/components/custom/
- Storybook stories in .storybook/stories/03-review/
- Component exports and index files
- Type definitions if needed

### 3. Context Object
Provide SuperComponents-specific context:
- Available shadcn/ui components from library
- Design tokens and CSS variables
- Storybook configuration
- File structure conventions

## Available shadcn/ui Components
The following components are available in the library:
{availableComponents}

## Available Icon Libraries
**@icons-pack/react-simple-icons**: 3300+ brand icons as React components (Apple, Google, GitHub, etc.)
- Import: \`import { SiApple, SiGoogle, SiGithub } from '@icons-pack/react-simple-icons'\`
- Usage: \`<SiApple size={24} color="#000000" />\`
- Brand colors: \`<SiGoogle color="default" size={24} />\` (uses official brand color)
- Hex constants: \`<SiApple color={SiAppleHex} size={24} />\` (using hex constant)
- Theming: \`<SiGithub size={20} color="currentColor" />\` (inherits text color)

## SuperComponents Structure
\`\`\`
.supercomponents/
  src/
    components/
      library/          # shadcn/ui components (read-only)
      custom/           # your custom components
    index.css            # design tokens and CSS variables
  .storybook/
    stories/
      01-tokens/       # design token stories
      02-components/   # library component stories
      03-review/       # generated component stories
  design.json             # design system specification
\`\`\`

## Styling Examples (Tailwind v4 + CSS Variables)
✅ **CORRECT** - Use semantic CSS variable classes:
- Primary button: \`className="bg-primary text-primary-foreground"\`
- Secondary button: \`className="bg-secondary text-secondary-foreground"\`
- Card background: \`className="bg-card text-card-foreground"\`
- Input field: \`className="bg-input border-border"\`

❌ **WRONG** - Don't use color scales:
- \`className="bg-primary-500"\` (doesn't exist)
- \`className="text-gray-900"\` (use semantic variables instead)
- \`className="bg-orange-600"\` (use design system variables)

## Icon Usage Examples
✅ **Social login with brand icons**:
\`\`\`tsx
import { SiGoogle, SiApple, SiGithub } from '@icons-pack/react-simple-icons';

// Simple usage with brand colors
<Button variant="outline" className="w-full">
  <SiGoogle size={20} color="default" className="mr-2" />
  Continue with Google
</Button>

// Using theme colors
<Button variant="outline" className="w-full">
  <SiApple size={20} color="currentColor" className="mr-2" />
  Continue with Apple
</Button>

// Custom colors
<Button variant="outline" className="w-full">
  <SiGithub size={20} color="#333" className="mr-2" />
  Continue with GitHub
</Button>
\`\`\`

## Output Format
Return ONLY a raw JSON object with implementation instructions (no markdown formatting, no backticks).

**IMPORTANT**: The difficulty field must be exactly one of: "easy", "medium", or "hard" (not "intermediate" or any other value):

{
  "steps": [
    {
      "description": "Create custom component using library components",
      "type": "create",
      "order": 1,
      "dependencies": [],
      "files": ["src/components/custom/NewComponent.tsx"]
    },
    {
      "description": "Generate Storybook story with auto-docs",
      "type": "create",
      "order": 2,
      "dependencies": ["1"]
    }
  ],
  "files": {
    "src/components/custom/NewComponent.tsx": "// Implementation using library components...",
    ".storybook/stories/03-review/NewComponent.stories.tsx": "// Storybook story with auto-docs..."
  },
  "metadata": {
    "title": "SuperComponents Implementation",
    "description": "Build components using shadcn/ui library",
    "difficulty": "medium",
    "estimatedTime": "1-2 hours"
  },
  "context": {
    "framework": "react",
    "styleSystem": "tailwind",
    "componentLibrary": "shadcn/ui",
    "designTokens": "CSS variables",
    "storybook": "with auto-docs"
  }
}

## Key Principles
1. **Reuse Library Components**: Always prefer existing shadcn/ui components
2. **Composition Over Creation**: Build new components by composing existing ones
3. **Design Token Usage**: Use CSS variables and design tokens
4. **Tailwind v4 Styling**: Use semantic class names like 'bg-primary', 'text-primary', 'border-primary' (NOT color scales like 'bg-primary-500')
4. **Auto-Documentation**: Generate stories with proper auto-docs configuration
5. **Type Safety**: Use TypeScript with proper interfaces
6. **Testing**: Include test considerations for custom components

## Example Implementation Pattern
\`\`\`tsx
// src/components/custom/DashboardCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from '../library/card';
import { Badge } from '../library/badge';
import { Button } from '../library/Button';

export interface DashboardCardProps {
  title: string;
  value: string;
  change: number;
  // ... other props
}

export const DashboardCard: React.FC<DashboardCardProps> = ({ title, value, change }) => {
  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Badge variant={change > 0 ? "default" : "destructive"}>
          {change > 0 ? '+' : ''}{change}%
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
};
\`\`\`

Generate production-ready implementation instructions that a developer can follow to build components using the SuperComponents system.

CRITICAL: Return ONLY valid JSON. No markdown formatting, no backticks, no explanation text - just the raw JSON object.`;

// Helper function to prepare context for the prompt
function prepareContext(design: any, components: any[], options: Record<string, any>, projectPath: string, availableComponents: string[]): string {
  const context = {
    design: design ? {
      tokens: design.tokens?.length || 0,
      components: design.components?.length || 0,
      hasColors: design.tokens?.some((t: any) => t.type === 'color'),
      hasSpacing: design.tokens?.some((t: any) => t.type === 'spacing'),
      hasTypography: design.tokens?.some((t: any) => t.type === 'typography'),
      description: design.metadata?.description
    } : null,
    availableComponents: availableComponents.length ? availableComponents : [],
    components: components?.length ? {
      count: components.length,
      names: components.map(c => c.name),
      commonProps: extractCommonProps(components),
      patterns: extractPatterns(components)
    } : null,
    projectPath,
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

// Helper function to generate example story file
function generateExampleStory(componentName: string, componentPath: string): string {
  return `import type { Meta, StoryObj } from '@storybook/react';
import { ${componentName} } from '../../src/components/custom/${componentName}';

const meta: Meta<typeof ${componentName}> = {
  title: '03-Review/${componentName}',
  component: ${componentName},
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Custom component built using SuperComponents library components.'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    // Add argTypes here based on component props
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    // Add default args here
  },
};

export const Example: Story = {
  args: {
    // Add example args here
  },
};
`;
}

// Main tool export - updated for SuperComponents
export const generateInstructionTool: Tool = {
  definition: {
    name: "generateInstruction",
    description: "Generate component implementation instructions by combining design data and component analysis to create actionable step-by-step guidance for developers using SuperComponents and shadcn/ui",
    inputSchema: zodToJsonSchema(inputSchema)
  },
  
  async handler(input) {
    const logger = getLogger();
    
    try {
      // Handle dummy parameter case (when called via MCP with random_string)
      const processedInput = typeof input === 'object' && 'random_string' in input ? {} : input;
      
      // Validate input
      const validatedInput = inputSchema.parse(processedInput || {});
      const { 
        projectPath = ".", 
        design, 
        components = [], 
        componentLibraryPath = "./.supercomponents/src/components/library",
        outputDir = "./.supercomponents/.storybook/stories/03-review",
        options = {} 
      } = validatedInput;
      
      logger.info('🔄 Generating SuperComponents implementation instructions...');
      
      // Read design data if not provided
      let designData = design;
      if (!designData) {
        designData = await readDesignData(projectPath);
        if (designData) {
          logger.info('📖 Loaded design data from .supercomponents/design.json');
        }
      }
      
      // Scan available components in the library
      const availableComponents = await scanComponentLibrary(resolve(projectPath, componentLibraryPath));
      logger.info(`📚 Found ${availableComponents.length} components in library: ${availableComponents.join(', ')}`);
      
      // Check if we have any input data
      if (!designData && (!components || components.length === 0)) {
        throw new Error('At least one of design data or components must be available. Run parseDesignAndGenerateTokens first or provide component analysis.');
      }
      
      // Prepare context for the prompt
      const contextString = prepareContext(designData, components, options as Record<string, any>, projectPath, availableComponents);
      
      // Generate the prompt
      const prompt = INSTRUCTION_GENERATION_PROMPT
        .replace('{design}', designData ? JSON.stringify(designData, null, 2) : 'null')
        .replace('{availableComponents}', availableComponents.join(', ') || 'None found')
        .replace('{components}', components.length ? JSON.stringify(components, null, 2) : 'null')
        .replace('{projectPath}', projectPath)
        .replace('{options}', JSON.stringify(options, null, 2));
      
      logger.debug('📝 Sending prompt to LLM...');
      
      // Call LLM
      const response = await complete(prompt, {
        temperature: 0.2,
        max_tokens: 8000
      }) as string;
      
      // Validate and parse response
      const instructions = validateInstructionOutput(response);
      
      // Ensure output directory exists
      const fullOutputDir = resolve(projectPath, outputDir);
      if (!existsSync(fullOutputDir)) {
        mkdirSync(fullOutputDir, { recursive: true });
        logger.info(`📁 Created output directory: ${fullOutputDir}`);
      }
      
      logger.info('✅ Successfully generated SuperComponents implementation instructions');
      logger.debug(`📊 Generated ${instructions.steps?.length || 0} steps and ${Object.keys(instructions.files || {}).length} files`);
      
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            ...instructions,
            supercomponents: {
              availableComponents,
              outputDirectory: fullOutputDir,
              designTokensAvailable: !!designData,
              projectPath,
              message: `✅ SuperComponents implementation instructions generated!\n\n📁 Output directory: ${fullOutputDir}\n📚 Available components: ${availableComponents.length}\n🎨 Design tokens: ${designData ? 'Available' : 'Not found'}\n\n🔄 Next steps:\n  - Follow the implementation steps\n  - Create custom components in src/components/custom/\n  - Generate stories in .storybook/stories/03-review/\n  - Test components with existing design tokens`
            }
          }, null, 2)
        }],
        metadata: {
          stepsCount: instructions.steps?.length || 0,
          filesCount: Object.keys(instructions.files || {}).length,
          difficulty: instructions.metadata?.difficulty || 'medium',
          estimatedTime: instructions.metadata?.estimatedTime || 'Unknown',
          availableComponents: availableComponents.length,
          hasDesignTokens: !!designData
        }
      };
      
    } catch (error) {
      logger.error('❌ Error generating SuperComponents instructions', undefined, error instanceof Error ? error : new Error(String(error)));
      
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: error instanceof Error ? error.message : String(error),
            message: `❌ Failed to generate SuperComponents instructions: ${error instanceof Error ? error.message : String(error)}\n\n🔧 Troubleshooting:\n  - Ensure SuperComponents is initialized (.supercomponents directory exists)\n  - Run 'parseDesignAndGenerateTokens' to create design.json\n  - Check that component library exists at src/components/library/\n  - Verify Storybook structure in .storybook/stories/`
          }, null, 2)
        }],
        isError: true
      };
    }
  }
}; 