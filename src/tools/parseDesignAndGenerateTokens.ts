// src/tools/parseDesignAndGenerateTokens.ts
import { z } from "zod";
import { Tool } from "../types.js";
import { zodToJsonSchema } from "../utils/validation.js";
import { complete } from "../llm/index.js";
import { DesignSchema } from "../schemas/design.js";
import { writeFileSync, mkdirSync, existsSync, readFileSync } from "fs";
import { join } from "path";

const COMPONENT_TYPES = [
  "Accordion", "Alert", "Alert Dialog", "Aspect Ratio", "Avatar", "Badge",
  "Breadcrumb", "Button", "Calendar", "Card", "Carousel", "Chart", "Checkbox",
  "Collapsible", "Combobox", "Command", "Context Menu", "Data Table", "Date Picker",
  "Dialog", "Drawer", "Dropdown Menu", "React Hook Form", "Hover Card", "Input",
  "Input OTP", "Label", "Menubar", "Navigation Menu", "Pagination", "Popover",
  "Progress", "Radio Group", "Resizable", "Scroll-area", "Select", "Separator",
  "Sheet", "Sidebar", "Skeleton", "Slider", "Sonner", "Switch", "Table", "Tabs",
  "Textarea", "Toast", "Toggle", "Toggle Group", "Tooltip", "Typography"
];

// Updated schema with better descriptions for MCP and image support
const inputSchema = z.object({
  input: z.union([
    z.string().describe("Design description, markdown content, file path, or text input to analyze. Can be a description like 'Create a modern dashboard with blue primary colors' or a file path like './designs/mockup.md'"),
    z.object({
      type: z.literal("image"),
      data: z.string().describe("Base64-encoded image data"),
      mimeType: z.string().describe("MIME type of the image (e.g., image/jpeg, image/png)")
    }).describe("Image input for visual design analysis")
  ]).describe("Design input - either text/description or image data for analysis"),
  outputDir: z.string().optional().default("./supercomponents").describe("Directory to save generated files (defaults to ./supercomponents)"),
  includeCSS: z.boolean().optional().default(true).describe("Generate CSS variables file"),
  includeTailwind: z.boolean().optional().default(true).describe("Generate Tailwind config file"),
});

const DESIGN_ANALYSIS_PROMPT = `# Parse Design Prompt

You are a senior UI/UX designer analyzing a design to create a structured design system specification.

## Task
Analyze the provided design input and generate a JSON specification with the following structure:

{
  "description": "Detailed design analysis...",
  "components": ["Button", "Card", "Input"],
  "tokens": { ... }
}

### 1. Description
A detailed design brief as if explaining to a developer, including:
- Overall visual style and mood
- Component hierarchy and layout
- Interactive states and behaviors
- Accessibility considerations
- Implementation recommendations

### 2. Components
Identify any UI components from this list that appear in the design:
${COMPONENT_TYPES.join(", ")}

### 3. Tokens
Extract design tokens matching this EXACT structure:

\`\`\`json
{
  "spacing": {
    "0": 0, "1": 4, "2": 8, "3": 12, "4": 16, "5": 24, "6": 32,
    "xs": 4, "sm": 8, "md": 16, "lg": 24, "xl": 32, "2xl": 48
  },
  "radius": {
    "none": 0, "sm": 2, "md": 4, "lg": 8, "full": 9999
  },
  "colors": {
    "brand": "#hexcolor",
    "brandAccent": "#hexcolor",
    "surface": "#hexcolor",
    "surfaceAlt": "#hexcolor",
    "overlay": "rgba(0, 0, 0, 0.8)",
    "success": "#hexcolor",
    "danger": "#hexcolor",
    "warning": "#hexcolor",
    "textPrimary": "#hexcolor",
    "textSecondary": "#hexcolor",
    "textInverse": "#hexcolor",
    "white": "#FFFFFF",
    "primary": {
      "50": "#hexcolor", "100": "#hexcolor", "200": "#hexcolor",
      "300": "#hexcolor", "400": "#hexcolor", "500": "#hexcolor",
      "600": "#hexcolor", "700": "#hexcolor", "800": "#hexcolor",
      "900": "#hexcolor"
    },
    "neutral": {
      "50": "#hexcolor", "100": "#hexcolor", "200": "#hexcolor",
      "300": "#hexcolor", "400": "#hexcolor", "500": "#hexcolor",
      "600": "#hexcolor", "700": "#hexcolor", "800": "#hexcolor",
      "900": "#hexcolor"
    }
  },
  "typography": {
    "sizes": {
      "xs": 12, "sm": 14, "md": 16, "lg": 18, "xl": 24, "2xl": 32
    },
    "weights": {
      "regular": "400", "medium": "500", "bold": "700"
    },
    "lineHeights": {
      "xs": 16, "sm": 20, "md": 24, "lg": 28, "xl": 32, "2xl": 40
    }
  },
  "elevation": {
    "none": {
      "shadowColor": "transparent",
      "shadowOffset": {"width": 0, "height": 0},
      "shadowOpacity": 0,
      "shadowRadius": 0,
      "elevation": 0
    },
    "xs": {
      "shadowColor": "#000",
      "shadowOffset": {"width": 0, "height": 1},
      "shadowOpacity": 0.05,
      "shadowRadius": 1,
      "elevation": 1
    },
    "sm": {
      "shadowColor": "#000",
      "shadowOffset": {"width": 0, "height": 2},
      "shadowOpacity": 0.1,
      "shadowRadius": 2,
      "elevation": 2
    },
    "md": {
      "shadowColor": "#000",
      "shadowOffset": {"width": 0, "height": 4},
      "shadowOpacity": 0.15,
      "shadowRadius": 4,
      "elevation": 4
    },
    "lg": {
      "shadowColor": "#000",
      "shadowOffset": {"width": 0, "height": 8},
      "shadowOpacity": 0.2,
      "shadowRadius": 8,
      "elevation": 8
    }
  },
  "opacity": {
    "0": 0, "10": 0.1, "20": 0.2, "30": 0.3, "40": 0.4,
    "50": 0.5, "60": 0.6, "70": 0.7, "80": 0.8, "90": 0.9, "100": 1
  },
  "durations": {
    "fast": 150, "normal": 300, "slow": 500
  },
  "zIndex": {
    "base": 0, "overlay": 100, "modal": 200, "toast": 300, "tooltip": 400
  },
  "easing": {
    "default": "cubic-bezier(0.4, 0, 0.2, 1)"
  }
}
\`\`\`

## Instructions
1. Extract ACTUAL colors from the design - generate a cohesive palette based on what you see
2. For primary/neutral scales, create a proper color ramp from the base colors
3. Infer spacing from element relationships
4. Detect typography from text elements
5. Identify elevation from shadows/depth
6. Keep ALL token keys even if using defaults

## Output Format
Return ONLY valid JSON with the exact structure shown above.`;

// Function to process input (can be text, file path, or image data)
function processInput(input: string | { type: "image"; data: string; mimeType: string }): string | any[] {
  // Handle image input
  if (typeof input === 'object' && input.type === 'image') {
    return [
      {
        type: "text",
        text: "Analyze this design image and extract design tokens:"
      },
      {
        type: "image",
        source: {
          type: "base64",
          media_type: input.mimeType,
          data: input.data
        }
      }
    ];
  }
  
  // Handle text input
  if (typeof input === 'string') {
    // Check if input looks like a file path
    if (input.includes('/') || input.includes('\\')) {
      try {
        // Try to read as file
        if (existsSync(input)) {
          const content = readFileSync(input, 'utf-8');
          return `File: ${input}\n\nContent:\n${content}`;
        }
      } catch (error) {
        // If file reading fails, treat as text
        console.warn(`Could not read file ${input}, treating as text input`);
      }
    }
    
    // Return as-is if it's text content
    return input;
  }
  
  throw new Error('Invalid input type');
}

// Interface for token structure
interface TokenStructure {
  [key: string]: any;
  spacing?: Record<string, number>;
  colors?: Record<string, string | Record<string, string>>;
  typography?: Record<string, Record<string, any>>;
  radius?: Record<string, number>;
  elevation?: Record<string, any>;
  opacity?: Record<string, number>;
  durations?: Record<string, number>;
  zIndex?: Record<string, number>;
  easing?: Record<string, string>;
}

// Convert nested token structure to flat DesignSchema token array
function convertTokensToDesignSchema(tokens: TokenStructure): any[] {
  const designTokens: any[] = [];
  
  // Convert spacing
  if (tokens.spacing) {
    Object.entries(tokens.spacing).forEach(([key, value]) => {
      designTokens.push({
        name: `spacing-${key}`,
        value: value,
        type: "spacing",
        category: "spacing"
      });
    });
  }
  
  // Convert colors
  if (tokens.colors) {
    Object.entries(tokens.colors).forEach(([key, value]) => {
      if (typeof value === "string") {
        designTokens.push({
          name: `color-${key}`,
          value: value,
          type: "color",
          category: "colors"
        });
      } else if (typeof value === "object" && value !== null) {
        // Handle color scales like primary.50, primary.100, etc.
        Object.entries(value).forEach(([subKey, subValue]) => {
          designTokens.push({
            name: `color-${key}-${subKey}`,
            value: subValue,
            type: "color",
            category: "colors"
          });
        });
      }
    });
  }
  
  // Convert typography
  if (tokens.typography) {
    Object.entries(tokens.typography).forEach(([category, values]) => {
      if (values && typeof values === "object") {
        Object.entries(values).forEach(([key, value]) => {
          designTokens.push({
            name: `typography-${category}-${key}`,
            value: value,
            type: "typography",
            category: "typography"
          });
        });
      }
    });
  }
  
  // Convert other token types
  const otherTokenTypes = ["radius", "elevation", "opacity", "durations", "zIndex", "easing"] as const;
  otherTokenTypes.forEach(tokenType => {
    if (tokens[tokenType]) {
      Object.entries(tokens[tokenType]).forEach(([key, value]) => {
        designTokens.push({
          name: `${tokenType}-${key}`,
          value: value,
          type: tokenType,
          category: tokenType
        });
      });
    }
  });
  
  return designTokens;
}

// Interface for shadow/elevation values
interface ShadowValue {
  shadowColor?: string;
  shadowOffset?: { width?: number; height?: number };
  shadowRadius?: number;
  shadowOpacity?: number;
  elevation?: number;
}

// Generate Tailwind config from tokens
function generateTailwindConfig(tokens: TokenStructure): string {
  const config = {
    theme: {
      extend: {
        colors: {} as Record<string, any>,
        spacing: {} as Record<string, string>,
        borderRadius: {} as Record<string, string>,
        fontSize: {} as Record<string, string>,
        fontWeight: {} as Record<string, string>,
        lineHeight: {} as Record<string, string>,
        boxShadow: {} as Record<string, string>,
        opacity: {} as Record<string, number>,
        transitionDuration: {} as Record<string, string>,
        zIndex: {} as Record<string, number>,
        transitionTimingFunction: {} as Record<string, string>
      }
    }
  };
  
  // Map spacing
  if (tokens.spacing) {
    Object.entries(tokens.spacing).forEach(([key, value]) => {
      config.theme.extend.spacing[key] = `${value}px`;
    });
  }
  
  // Map colors
  config.theme.extend.colors = tokens.colors || {};
  
  // Map border radius
  if (tokens.radius) {
    Object.entries(tokens.radius).forEach(([key, value]) => {
      config.theme.extend.borderRadius[key] = value === 9999 ? "9999px" : `${value}px`;
    });
  }
  
  // Map typography
  if (tokens.typography) {
    if (tokens.typography.sizes) {
      Object.entries(tokens.typography.sizes).forEach(([key, value]) => {
        config.theme.extend.fontSize[key] = `${value}px`;
      });
    }
    
    if (tokens.typography.weights) {
      config.theme.extend.fontWeight = tokens.typography.weights;
    }
    
    if (tokens.typography.lineHeights) {
      Object.entries(tokens.typography.lineHeights).forEach(([key, value]) => {
        config.theme.extend.lineHeight[key] = `${value}px`;
      });
    }
  }
  
  // Map elevation to box shadows
  if (tokens.elevation) {
    Object.entries(tokens.elevation).forEach(([key, value]) => {
      if (typeof value === "object" && value !== null) {
        const shadow = value as ShadowValue;
        if (shadow.shadowColor === "transparent") {
          config.theme.extend.boxShadow[key] = "none";
        } else if (shadow.shadowColor) {
          config.theme.extend.boxShadow[key] = 
            `${shadow.shadowOffset?.width || 0}px ${shadow.shadowOffset?.height || 0}px ${shadow.shadowRadius || 0}px ${shadow.shadowColor}`;
        }
      }
    });
  }
  
  // Map other properties
  if (tokens.opacity) {
    config.theme.extend.opacity = tokens.opacity;
  }
  if (tokens.durations) {
    Object.entries(tokens.durations).forEach(([key, value]) => {
      config.theme.extend.transitionDuration[key] = `${value}ms`;
    });
  }
  if (tokens.zIndex) {
    config.theme.extend.zIndex = tokens.zIndex;
  }
  if (tokens.easing) {
    config.theme.extend.transitionTimingFunction = tokens.easing;
  }
  
  return `/** @type {import('tailwindcss').Config} */
module.exports = ${JSON.stringify(config, null, 2)};`;
}

// Generate CSS variables
function generateCSSVariables(tokens: TokenStructure): string {
  let css = `:root {\n`;
  
  // Add spacing variables
  if (tokens.spacing) {
    Object.entries(tokens.spacing).forEach(([key, value]) => {
      css += `  --spacing-${key}: ${value}px;\n`;
    });
  }
  
  // Add color variables
  if (tokens.colors) {
    Object.entries(tokens.colors).forEach(([key, value]) => {
      if (typeof value === "string") {
        css += `  --color-${key}: ${value};\n`;
      } else if (typeof value === "object" && value !== null) {
        Object.entries(value).forEach(([subKey, subValue]) => {
          css += `  --color-${key}-${subKey}: ${subValue};\n`;
        });
      }
    });
  }
  
  // Add other variables
  if (tokens.radius) {
    Object.entries(tokens.radius).forEach(([key, value]) => {
      css += `  --radius-${key}: ${value === 9999 ? "9999px" : `${value}px`};\n`;
    });
  }
  
  if (tokens.typography) {
    if (tokens.typography.sizes) {
      Object.entries(tokens.typography.sizes).forEach(([key, value]) => {
        css += `  --font-size-${key}: ${value}px;\n`;
      });
    }
    
    if (tokens.typography.weights) {
      Object.entries(tokens.typography.weights).forEach(([key, value]) => {
        css += `  --font-weight-${key}: ${value};\n`;
      });
    }
    
    if (tokens.typography.lineHeights) {
      Object.entries(tokens.typography.lineHeights).forEach(([key, value]) => {
        css += `  --line-height-${key}: ${value}px;\n`;
      });
    }
  }
  
  if (tokens.opacity) {
    Object.entries(tokens.opacity).forEach(([key, value]) => {
      css += `  --opacity-${key}: ${value};\n`;
    });
  }
  
  if (tokens.durations) {
    Object.entries(tokens.durations).forEach(([key, value]) => {
      css += `  --duration-${key}: ${value}ms;\n`;
    });
  }
  
  if (tokens.zIndex) {
    Object.entries(tokens.zIndex).forEach(([key, value]) => {
      css += `  --z-index-${key}: ${value};\n`;
    });
  }
  
  if (tokens.easing) {
    Object.entries(tokens.easing).forEach(([key, value]) => {
      css += `  --easing-${key}: ${value};\n`;
    });
  }
  
  css += `}\n`;
  return css;
}

export const parseDesignAndGenerateTokensTool: Tool = {
  definition: {
    name: "parseDesignAndGenerateTokens",
    description: "Parse design input and generate both structured Design JSON and complete token system (Tailwind config + CSS variables). Use this tool to analyze design descriptions, mockups, or component files and generate design tokens.",
    inputSchema: zodToJsonSchema(inputSchema)
  },
  
  async handler(input) {
    try {
      // Better error handling for parameter extraction
      console.log("Raw input received:", JSON.stringify(input, null, 2));
      
      // Handle case where input might be wrapped differently by MCP
      let parsedInput;
      if (typeof input === 'string') {
        // If input is a string, treat it as the design input
        parsedInput = { input: input };
      } else if (input && typeof input === 'object') {
        parsedInput = input;
      } else {
        throw new Error('Invalid input format. Expected string or object with input property.');
      }
      
      console.log("Parsed input:", JSON.stringify(parsedInput, null, 2));
      
      // Validate and extract parameters
      const validatedInput = inputSchema.parse(parsedInput);
      const { input: designInput, outputDir, includeCSS, includeTailwind } = validatedInput;
      
      console.log("Design input to process:", designInput);
      
      // Check if supercomponents directory exists, if not suggest initialization
      if (!existsSync(outputDir)) {
        console.log(`Creating output directory: ${outputDir}`);
        mkdirSync(outputDir, { recursive: true });
        
        // Create a note about initialization
        const initNote = `
📋 **Note**: This appears to be your first time using SuperComponents tools.
   For best results, consider running the 'initializeProject' tool first to set up 
   the complete project structure with Storybook and Tailwind CSS.
`;
        console.log(initNote);
      }
      
      // Step 1: Analyze design with LLM
      const processedInput = processInput(designInput);
      console.log("Processed input type:", typeof processedInput);
      
      let response: string;
      if (Array.isArray(processedInput)) {
        // Handle multi-modal input (image + text)
        response = await complete(processedInput, {
          temperature: 0.1,
          max_tokens: 4000
        });
      } else {
        // Handle text input
        const prompt = `${DESIGN_ANALYSIS_PROMPT}\n\n## Design Input:\n${processedInput}`;
        response = await complete(prompt, {
          temperature: 0.1,
          max_tokens: 4000
        });
      }
      
      console.log("LLM response received, length:", response.length);
      
      // Step 2: Parse LLM response
      let analysisResult;
      try {
        analysisResult = JSON.parse(response);
      } catch (parseError) {
        const errorMessage = parseError instanceof Error ? parseError.message : String(parseError);
        throw new Error(`Failed to parse LLM response as JSON: ${errorMessage}\n\nResponse: ${response.substring(0, 500)}...`);
      }
      
      // Step 3: Convert to DesignSchema format
      const designTokens = convertTokensToDesignSchema(analysisResult.tokens);
      
      const designData = {
        id: `design-${Date.now()}`,
        tokens: designTokens,
        components: (analysisResult.components || []).map((name: string, index: number) => ({
          id: `comp-${index}`,
          name,
          type: name.toLowerCase().replace(/\s+/g, '-'),
          props: {},
          tokens: []
        })),
        metadata: {
          description: analysisResult.description,
          createdAt: new Date().toISOString(),
          version: "1.0.0"
        }
      };
      
      // Step 4: Validate against DesignSchema
      const validatedDesign = DesignSchema.parse(designData);
      
      // Step 5: Generate output files
      const outputFiles: string[] = [];
      
      // Write design.json
      const designJsonPath = join(outputDir, "design.json");
      writeFileSync(designJsonPath, JSON.stringify(validatedDesign, null, 2));
      outputFiles.push(designJsonPath);
      
      // Generate and write Tailwind config
      if (includeTailwind) {
        const tailwindConfig = generateTailwindConfig(analysisResult.tokens);
        const tailwindPath = join(outputDir, "tailwind.config.js");
        writeFileSync(tailwindPath, tailwindConfig);
        outputFiles.push(tailwindPath);
      }
      
      // Generate and write CSS variables
      if (includeCSS) {
        const cssVariables = generateCSSVariables(analysisResult.tokens);
        const cssPath = join(outputDir, "tokens.css");
        writeFileSync(cssPath, cssVariables);
        outputFiles.push(cssPath);
      }
      
      return {
        success: true,
        design: validatedDesign,
        tokens: analysisResult.tokens,
        files: outputFiles,
        message: `✅ Generated design system with ${designTokens.length} tokens and ${outputFiles.length} files:\n${outputFiles.map(f => `  - ${f}`).join('\n')}\n\n💡 Next steps:\n  - Run 'initializeProject' if you haven't already\n  - Use 'createTokenStories' to generate Storybook stories\n  - Use 'analyzeComponents' to analyze existing components`
      };
      
    } catch (error) {
      console.error("Error in parseDesignAndGenerateTokens:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        error: errorMessage,
        message: `❌ Failed to parse design and generate tokens: ${errorMessage}\n\n🔧 Troubleshooting:\n  - Ensure you provide a design description or file path\n  - Check that the input is a valid text description or readable file\n  - Try running 'initializeProject' first to set up the project structure\n  - Example: "Create a modern dashboard with blue primary colors and card-based layout"`
      };
    }
  }
}; 