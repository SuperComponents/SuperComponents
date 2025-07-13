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
  outputDir: z.string().optional().default("./.supercomponents").describe("Directory to save generated files (defaults to ./.supercomponents)"),
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

// Generate CSS variables in shadcn/ui format
function generateCSSVariables(tokens: TokenStructure): string {
  let css = `:root {\n`;
  
  // Add core shadcn/ui color variables
  if (tokens.colors) {
    // Map core colors to shadcn/ui naming convention
    const colorMapping: Record<string, string> = {
      // Core semantic colors
      'surface': '--background',
      'surfaceAlt': '--card', 
      'textPrimary': '--foreground',
      'textInverse': '--card-foreground',
      'brand': '--primary',
      'brandAccent': '--primary-foreground',
      'textSecondary': '--secondary',
      'muted': '--muted',
      'danger': '--destructive',
      'white': '--popover',
      
      // Fallback mappings for common names
      'background': '--background',
      'primary': '--primary',
      'secondary': '--secondary',
      'accent': '--accent',
      'destructive': '--destructive',
      'border': '--border',
      'input': '--input',
      'ring': '--ring'
    };
    
    // Generate base color variables
    Object.entries(tokens.colors).forEach(([key, value]) => {
      if (typeof value === "string") {
        const cssVarName = colorMapping[key] || `--${key}`;
        
        // Convert hex colors to HSL format for shadcn/ui compatibility
        const hslValue = hexToHsl(value);
        css += `  ${cssVarName}: ${hslValue};\n`;
        
        // Add foreground variants for key colors
        if (['primary', 'secondary', 'accent', 'muted', 'destructive'].includes(key)) {
          const foregroundColor = getContrastColor(value);
          const foregroundHsl = hexToHsl(foregroundColor);
          css += `  ${cssVarName}-foreground: ${foregroundHsl};\n`;
        }
      }
    });
    
    // Add standard shadcn/ui variables if not present
    const standardVars = [
      { name: '--background', fallback: 'hsl(0 0% 100%)' },
      { name: '--foreground', fallback: 'hsl(240 10% 3.9%)' },
      { name: '--card', fallback: 'hsl(0 0% 100%)' },
      { name: '--card-foreground', fallback: 'hsl(240 10% 3.9%)' },
      { name: '--popover', fallback: 'hsl(0 0% 100%)' },
      { name: '--popover-foreground', fallback: 'hsl(240 10% 3.9%)' },
      { name: '--primary', fallback: 'hsl(240 5.9% 10%)' },
      { name: '--primary-foreground', fallback: 'hsl(0 0% 98%)' },
      { name: '--secondary', fallback: 'hsl(240 4.8% 95.9%)' },
      { name: '--secondary-foreground', fallback: 'hsl(240 5.9% 10%)' },
      { name: '--muted', fallback: 'hsl(240 4.8% 95.9%)' },
      { name: '--muted-foreground', fallback: 'hsl(240 3.8% 46.1%)' },
      { name: '--accent', fallback: 'hsl(240 4.8% 95.9%)' },
      { name: '--accent-foreground', fallback: 'hsl(240 5.9% 10%)' },
      { name: '--destructive', fallback: 'hsl(0 84.2% 60.2%)' },
      { name: '--destructive-foreground', fallback: 'hsl(0 0% 98%)' },
      { name: '--border', fallback: 'hsl(240 5.9% 90%)' },
      { name: '--input', fallback: 'hsl(240 5.9% 90%)' },
      { name: '--ring', fallback: 'hsl(240 5.9% 10%)' }
    ];
    
    standardVars.forEach(({ name, fallback }) => {
      if (!css.includes(name + ':')) {
        css += `  ${name}: ${fallback};\n`;
      }
    });
  }
  
  // Add standard variables that should always be present
  const alwaysInclude = [
    '--chart-1: hsl(12 76% 61%);',
    '--chart-2: hsl(173 58% 39%);', 
    '--chart-3: hsl(197 37% 24%);',
    '--chart-4: hsl(43 74% 66%);',
    '--chart-5: hsl(27 87% 67%);',
    '--sidebar: hsl(0 0% 98%);',
    '--sidebar-foreground: hsl(240 5.3% 26.1%);',
    '--sidebar-primary: hsl(240 5.9% 10%);',
    '--sidebar-primary-foreground: hsl(0 0% 98%);',
    '--sidebar-accent: hsl(240 4.8% 95.9%);',
    '--sidebar-accent-foreground: hsl(240 5.9% 10%);',
    '--sidebar-border: hsl(220 13% 91%);',
    '--sidebar-ring: hsl(217.2 91.2% 59.8%);'
  ];
  
  alwaysInclude.forEach(varDef => {
    css += `  ${varDef}\n`;
  });
  
  // Add border radius (shadcn/ui uses --radius as base)
  if (tokens.radius) {
    const radiusBase = tokens.radius.md || tokens.radius.default || 6;
    css += `  --radius: ${radiusBase}px;\n`;
  } else {
    css += `  --radius: 0.5rem;\n`;
  }
  
  css += `}\n`;
  
  return css;
}

// Generate dark mode CSS variables
function generateDarkModeCSS(): string {
  let css = `\n.dark {\n`;
  css += `  --background: hsl(240 10% 3.9%);\n`;
  css += `  --foreground: hsl(0 0% 98%);\n`;
  css += `  --card: hsl(240 10% 3.9%);\n`;
  css += `  --card-foreground: hsl(0 0% 98%);\n`;
  css += `  --popover: hsl(240 10% 3.9%);\n`;
  css += `  --popover-foreground: hsl(0 0% 98%);\n`;
  css += `  --primary: hsl(0 0% 98%);\n`;
  css += `  --primary-foreground: hsl(240 5.9% 10%);\n`;
  css += `  --secondary: hsl(240 3.7% 15.9%);\n`;
  css += `  --secondary-foreground: hsl(0 0% 98%);\n`;
  css += `  --muted: hsl(240 3.7% 15.9%);\n`;
  css += `  --muted-foreground: hsl(240 5% 64.9%);\n`;
  css += `  --accent: hsl(240 3.7% 15.9%);\n`;
  css += `  --accent-foreground: hsl(0 0% 98%);\n`;
  css += `  --destructive: hsl(0 62.8% 30.6%);\n`;
  css += `  --destructive-foreground: hsl(0 0% 98%);\n`;
  css += `  --border: hsl(240 3.7% 15.9%);\n`;
  css += `  --input: hsl(240 3.7% 15.9%);\n`;
  css += `  --ring: hsl(240 4.9% 83.9%);\n`;
  css += `  --chart-1: hsl(220 70% 50%);\n`;
  css += `  --chart-2: hsl(160 60% 45%);\n`;
  css += `  --chart-3: hsl(30 80% 55%);\n`;
  css += `  --chart-4: hsl(280 65% 60%);\n`;
  css += `  --chart-5: hsl(340 75% 55%);\n`;
  css += `  --sidebar: hsl(240 5.9% 10%);\n`;
  css += `  --sidebar-foreground: hsl(240 4.8% 95.9%);\n`;
  css += `  --sidebar-primary: hsl(224.3 76.3% 48%);\n`;
  css += `  --sidebar-primary-foreground: hsl(0 0% 100%);\n`;
  css += `  --sidebar-accent: hsl(240 3.7% 15.9%);\n`;
  css += `  --sidebar-accent-foreground: hsl(240 4.8% 95.9%);\n`;
  css += `  --sidebar-border: hsl(240 3.7% 15.9%);\n`;
  css += `  --sidebar-ring: hsl(217.2 91.2% 59.8%);\n`;
  css += `}\n`;
  
  return css;
}

// Update existing index.css file with new tokens
function updateIndexCSS(tokens: TokenStructure, indexCssPath: string): void {
  let content = '';
  
  // Check if index.css exists
  if (existsSync(indexCssPath)) {
    content = readFileSync(indexCssPath, 'utf-8');
  } else {
    // Create basic structure if file doesn't exist
    content = '@import "tailwindcss";\n@import "tw-animate-css";\n\n@custom-variant dark (&:is(.dark *));\n\n';
  }
  
  // Generate new CSS variables
  const newRootCSS = generateCSSVariables(tokens);
  const newDarkCSS = generateDarkModeCSS();
  
  // Replace existing :root section
  content = content.replace(
    /:root\s*\{[^}]*\}/s,
    newRootCSS.trim()
  );
  
  // Replace existing .dark section
  content = content.replace(
    /\.dark\s*\{[^}]*\}/s,
    newDarkCSS.trim()
  );
  
  // If :root section wasn't found, add it after the imports
  if (!content.includes(':root')) {
    const importRegex = /(@import[^;]*;[\s\S]*?)(\n\n|$)/;
    if (importRegex.test(content)) {
      content = content.replace(importRegex, `$1\n\n${newRootCSS}\n${newDarkCSS}\n`);
    } else {
      content = `${newRootCSS}\n${newDarkCSS}\n${content}`;
    }
  }
  
  // Write updated content back
  writeFileSync(indexCssPath, content);
}

// Helper function to convert hex to HSL
function hexToHsl(hex: string): string {
  // Remove # if present
  hex = hex.replace('#', '');
  
  // Convert to RGB
  const r = parseInt(hex.substr(0, 2), 16) / 255;
  const g = parseInt(hex.substr(2, 2), 16) / 255;
  const b = parseInt(hex.substr(4, 2), 16) / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  
  h = Math.round(h * 360);
  s = Math.round(s * 100);
  l = Math.round(l * 100);
  
  return `hsl(${h} ${s}% ${l}%)`;
}

// Helper function to get contrasting color
function getContrastColor(hex: string): string {
  // Remove # if present
  hex = hex.replace('#', '');
  
  // Convert to RGB
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Return white for dark colors, black for light colors
  return luminance > 0.5 ? '#000000' : '#ffffff';
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
      
      // Update the main index.css file with new tokens instead of creating separate file
      if (includeCSS) {
        const indexCssPath = join(outputDir, "src/index.css");
        updateIndexCSS(analysisResult.tokens, indexCssPath);
        outputFiles.push(indexCssPath);
      }
      
      return {
        success: true,
        design: validatedDesign,
        tokens: analysisResult.tokens,
        files: outputFiles,
        message: `✅ Generated design system with ${designTokens.length} tokens and updated ${outputFiles.length} files:\n${outputFiles.map(f => `  - ${f}`).join('\n')}\n\n💡 Your Storybook should now display the color and shadow tokens correctly!\n\n🔄 Next steps:\n  - Restart Storybook to see the updated design tokens\n  - Use 'createTokenStories' to generate additional token stories\n  - Use 'analyzeComponents' to analyze existing components`
      };
      
    } catch (error) {
      console.error("Error in parseDesignAndGenerateTokens:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        error: errorMessage,
        message: `❌ Failed to parse design and generate tokens: ${errorMessage}\n\n🔧 Troubleshooting:\n  - Ensure you provide a design description or file path\n  - Check that the input is a valid text description or readable file\n  - Try running 'initializeProject' first to set up the project structure\n  - Example: "Create a modern dashboard with blue primary colors"`
      };
    }
  }
}; 