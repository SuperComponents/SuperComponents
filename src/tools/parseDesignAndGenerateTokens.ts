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

// shadcn/ui defaults extracted from token stories
const SHADCN_DEFAULTS = {
  spacing: {
    "0": 0, "1": 4, "2": 8, "3": 12, "4": 16, "5": 20, "6": 24, "7": 28, "8": 32,
    "9": 36, "10": 40, "11": 44, "12": 48, "14": 56, "16": 64, "20": 80,
    "xs": 4, "sm": 8, "md": 16, "lg": 24, "xl": 32, "2xl": 48
  },
  radius: {
    "xs": "calc(var(--radius) - 4px)",
    "sm": "calc(var(--radius) - 2px)", 
    "md": "var(--radius)",
    "lg": "calc(var(--radius) + 2px)",
    "xl": "calc(var(--radius) + 4px)",
    "2xl": "calc(var(--radius) + 8px)"
  },
  colors: {
    // Functional colors
    background: "hsl(var(--background))",
    foreground: "hsl(var(--foreground))",
    primary: "hsl(var(--primary))",
    "primary-foreground": "hsl(var(--primary-foreground))",
    secondary: "hsl(var(--secondary))",
    "secondary-foreground": "hsl(var(--secondary-foreground))",
    accent: "hsl(var(--accent))",
    "accent-foreground": "hsl(var(--accent-foreground))",
    muted: "hsl(var(--muted))",
    "muted-foreground": "hsl(var(--muted-foreground))",
    destructive: "hsl(var(--destructive))",
    "destructive-foreground": "hsl(var(--destructive-foreground))",
    // Component colors
    border: "hsl(var(--border))",
    input: "hsl(var(--input))",
    ring: "hsl(var(--ring))",
    card: "hsl(var(--card))",
    "card-foreground": "hsl(var(--card-foreground))",
    popover: "hsl(var(--popover))",
    "popover-foreground": "hsl(var(--popover-foreground))",
    // Chart colors
    "chart-1": "hsl(var(--chart-1))",
    "chart-2": "hsl(var(--chart-2))",
    "chart-3": "hsl(var(--chart-3))",
    "chart-4": "hsl(var(--chart-4))",
    "chart-5": "hsl(var(--chart-5))",
    // Sidebar colors
    sidebar: "hsl(var(--sidebar))",
    "sidebar-foreground": "hsl(var(--sidebar-foreground))",
    "sidebar-primary": "hsl(var(--sidebar-primary))",
    "sidebar-primary-foreground": "hsl(var(--sidebar-primary-foreground))",
    "sidebar-accent": "hsl(var(--sidebar-accent))",
    "sidebar-accent-foreground": "hsl(var(--sidebar-accent-foreground))",
    "sidebar-border": "hsl(var(--sidebar-border))",
    "sidebar-ring": "hsl(var(--sidebar-ring))"
  },
  typography: {
    sizes: {
      "xs": "0.75rem",      // 12px
      "sm": "0.875rem",     // 14px
      "base": "1rem",       // 16px
      "lg": "1.125rem",     // 18px
      "xl": "1.25rem",      // 20px
      "2xl": "1.5rem",      // 24px
      "3xl": "1.875rem",    // 30px
      "4xl": "2.25rem",     // 36px
      "5xl": "3rem",        // 48px
      "6xl": "3.75rem"      // 60px
    },
    weights: {
      "thin": "100",
      "extralight": "200", 
      "light": "300",
      "normal": "400",
      "medium": "500",
      "semibold": "600",
      "bold": "700",
      "extrabold": "800",
      "black": "900"
    },
    lineHeights: {
      "xs": "1rem",
      "sm": "1.25rem",
      "base": "1.5rem", 
      "lg": "1.75rem",
      "xl": "1.75rem",
      "2xl": "2rem",
      "3xl": "2.25rem",
      "4xl": "2.5rem",
      "5xl": "1",
      "6xl": "1"
    },
    letterSpacing: {
      "tighter": "-0.05em",
      "tight": "-0.025em",
      "normal": "0em",
      "wide": "0.025em",
      "wider": "0.05em",
      "widest": "0.1em"
    }
  },
  elevation: {
    "2xs": "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    "xs": "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
    "sm": "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
    "md": "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
    "lg": "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
    "xl": "0 25px 50px -12px rgb(0 0 0 / 0.25)",
    "2xl": "0 25px 50px -12px rgb(0 0 0 / 0.25)"
  },
  opacity: {
    "0": 0, "5": 0.05, "10": 0.1, "20": 0.2, "25": 0.25, "30": 0.3, "40": 0.4,
    "50": 0.5, "60": 0.6, "70": 0.7, "75": 0.75, "80": 0.8, "90": 0.9, "95": 0.95, "100": 1
  },
  durations: {
    "75": "75ms",
    "100": "100ms", 
    "150": "150ms",
    "200": "200ms",
    "300": "300ms",
    "500": "500ms",
    "700": "700ms",
    "1000": "1000ms"
  },
  zIndex: {
    "0": 0, "10": 10, "20": 20, "30": 30, "40": 40, "50": 50,
    "auto": "auto"
  },
  easing: {
    "linear": "linear",
    "in": "cubic-bezier(0.4, 0, 1, 1)",
    "out": "cubic-bezier(0, 0, 0.2, 1)",
    "in-out": "cubic-bezier(0.4, 0, 0.2, 1)"
  }
};

// Updated schema with proper default path for SuperComponents
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
});

const DESIGN_ANALYSIS_PROMPT = `# Intelligent Design Token Extraction

You are a senior UI/UX designer analyzing a design to extract design tokens and create a structured design system specification.

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
Extract design tokens by **carefully analyzing the design input**. Follow these guidelines:

#### **Token Categories to Extract:**

**COLORS** - Extract actual colors mentioned/described in the design:
- Look for specific color names, hex codes, or descriptions
- If colors are mentioned, create a primary palette with 50-900 scale
- If no specific colors mentioned, return empty object {}

**SPACING** - Extract spatial relationships:
- Look for specific measurements, padding, margins, gaps
- If spacing is mentioned, create appropriate scale
- If no spacing mentioned, return empty object {}

**TYPOGRAPHY** - Extract text styling:
- Look for font sizes, weights, line heights mentioned
- If typography is mentioned, extract sizes, weights, lineHeights
- If no typography mentioned, return empty object {}

**RADIUS** - Extract border radius:
- Look for rounded corners, border radius mentions
- If radius is mentioned, create appropriate scale
- If no radius mentioned, return empty object {}

**ELEVATION** - Extract shadows/depth:
- Look for shadow descriptions, depth mentions
- If elevation is mentioned, create shadow scale
- If no elevation mentioned, return empty object {}

**OTHER TOKENS** - Only include if explicitly mentioned:
- opacity: if transparency is mentioned
- durations: if animation timing is mentioned
- zIndex: if layering is mentioned
- easing: if animation curves are mentioned

#### **Important Rules:**
1. **ONLY extract tokens that are explicitly mentioned or clearly derivable from the design input**
2. **Return empty objects {} for token categories not mentioned in the design**
3. **Do not invent or assume tokens that aren't in the design**
4. **Focus on what's actually described in the input**

#### **Example Token Extraction:**

For input: "Create a modern dashboard with blue primary colors and rounded corners"
\`\`\`json
{
  "colors": {
    "primary": {
      "50": "#eff6ff", "100": "#dbeafe", "200": "#bfdbfe",
      "300": "#93c5fd", "400": "#60a5fa", "500": "#3b82f6",
      "600": "#2563eb", "700": "#1d4ed8", "800": "#1e40af", "900": "#1e3a8a"
    }
  },
  "radius": {
    "sm": "4px", "md": "8px", "lg": "12px"
  }
}
\`\`\`

For input: "Simple white background with black text"
\`\`\`json
{
  "colors": {
    "background": "#ffffff",
    "foreground": "#000000"
  }
}
\`\`\`

For input: "Add a login form"
\`\`\`json
{}
\`\`\`

## Output Format
Return ONLY valid JSON with the exact structure shown above. Extract tokens intelligently based on what's actually described in the design input.`;

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
}

// Merge extracted tokens with shadcn defaults
function mergeWithDefaults(extractedTokens: TokenStructure): TokenStructure {
  const merged: TokenStructure = {};
  
  // For each token category, use extracted tokens if available, otherwise use defaults
  const tokenCategories = ['spacing', 'colors', 'typography', 'radius', 'elevation', 'opacity', 'durations', 'zIndex', 'easing'];
  
  tokenCategories.forEach(category => {
    if (extractedTokens[category] && Object.keys(extractedTokens[category]).length > 0) {
      // Use extracted tokens if they exist and are not empty
      merged[category] = extractedTokens[category];
    } else if (SHADCN_DEFAULTS[category as keyof typeof SHADCN_DEFAULTS]) {
      // Use shadcn defaults as fallback
      merged[category] = SHADCN_DEFAULTS[category as keyof typeof SHADCN_DEFAULTS];
    }
  });
  
  return merged;
}

// Convert nested token structure to flat DesignSchema token array with enhanced mapping
function convertTokensToDesignSchema(tokens: TokenStructure): any[] {
  const designTokens: any[] = [];
  
  // Convert spacing - normalize to pixel values and add semantic names
  if (tokens.spacing) {
    Object.entries(tokens.spacing).forEach(([key, value]) => {
      // Convert rem to px if needed, ensure consistency
      let pixelValue = value;
      if (typeof value === "string" && value.includes("rem")) {
        pixelValue = parseFloat(value) * 16; // Convert rem to px
      }
      
      // Map common spacing patterns to semantic names
      const semanticMapping: Record<string, string> = {
        'form': 'form-padding',
        'padding': 'form-padding', 
        'gap': 'form-gap',
        'element': 'form-elementSpacing',
        'elementSpacing': 'form-elementSpacing'
      };
      
      const semanticName = semanticMapping[key] || key;
      
      designTokens.push({
        name: `spacing-${semanticName}`,
        value: pixelValue,
        type: "spacing",
        category: "spacing"
      });
    });
  }
  
  // Convert colors - ensure proper semantic naming for createTokenStories mapping
  if (tokens.colors) {
    Object.entries(tokens.colors).forEach(([key, value]) => {
      if (typeof value === "string") {
        // Map colors to semantic names that align with CSS variables
        const colorSemanticMapping: Record<string, string> = {
          'brand': 'primary',
          'brandAccent': 'primary',
          'surface': 'background',
          'surfaceAlt': 'background-card',
          'textPrimary': 'text-primary',
          'textSecondary': 'text-secondary',
          'textInverse': 'text-muted',
          'white': 'background',
          'danger': 'destructive'
        };
        
        const semanticName = colorSemanticMapping[key] || key;
        
        designTokens.push({
          name: `color-${semanticName}`,
          value: value, // Keep original hex value, CSS generation will convert to HSL
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
  
  // Convert typography - ensure rem values and proper semantic naming
  if (tokens.typography) {
    Object.entries(tokens.typography).forEach(([category, values]) => {
      if (values && typeof values === "object") {
        Object.entries(values).forEach(([key, value]) => {
          let processedValue = value;
          
          // Convert px to rem for font sizes
          if (category === "sizes" && typeof value === "string" && value.includes("px")) {
            const pxValue = parseFloat(value);
            processedValue = `${pxValue / 16}rem`; // Convert px to rem
          }
          
          // Ensure proper semantic naming for typography
          const typographySemanticMapping: Record<string, string> = {
            'heading': '2xl',
            'subheading': 'base', 
            'body': 'base',
            'small': 'xs',
            'regular': 'normal'
          };
          
          const semanticName = typographySemanticMapping[key] || key;
          
          designTokens.push({
            name: `typography-${category}-${semanticName}`,
            value: processedValue,
            type: "typography",
            category: "typography"
          });
        });
      }
    });
  }
  
  // Convert radius - ensure proper rem/px values
  if (tokens.radius) {
    Object.entries(tokens.radius).forEach(([key, value]) => {
      let processedValue = value;
      
      // Convert to rem if it's a pixel value
      if (typeof value === "number") {
        processedValue = `${value / 16}rem`;
      } else if (typeof value === "string" && value.includes("px")) {
        const pxValue = parseFloat(value);
        processedValue = `${pxValue / 16}rem`;
      }
      
      designTokens.push({
        name: `radius-${key}`,
        value: processedValue,
        type: "radius",
        category: "radius"
      });
    });
  }
  
  // Convert elevation - ensure proper shadow format
  if (tokens.elevation) {
    Object.entries(tokens.elevation).forEach(([key, value]) => {
      designTokens.push({
        name: `elevation-${key}`,
        value: value,
        type: "elevation",
        category: "elevation"
      });
    });
  }
  
  // Convert other token types
  const otherTokenTypes = ["opacity", "durations", "zIndex", "easing"] as const;
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
// Generate CSS variables in shadcn/ui format
function generateCSSVariables(tokens: TokenStructure): string {
  let css = `:root {\n`;
  
  // Add core shadcn/ui color variables
  if (tokens.colors) {
    // Enhanced color mapping to shadcn/ui naming convention with createTokenStories alignment
    const colorMapping: Record<string, string> = {
      // Core semantic colors
      'surface': '--background',
      'surfaceAlt': '--card', 
      'textPrimary': '--foreground',
      'textInverse': '--card-foreground',
      'brand': '--primary',
      'brandAccent': '--primary-foreground',
      'textSecondary': '--muted-foreground',
      'muted': '--muted',
      'danger': '--destructive',
      'white': '--background',
      
      // Enhanced mappings for design.json output alignment
      'primary': '--primary',
      'background': '--background',
      'background-page': '--background',
      'background-card': '--card',
      'background-input': '--input',
      'text-primary': '--foreground',
      'text-secondary': '--muted-foreground',
      'text-muted': '--muted-foreground',
      'border-input': '--border',
      'secondary': '--secondary',
      'accent': '--accent',
      'destructive': '--destructive',
      'border': '--border',
      'input': '--input',
      'ring': '--ring',
      'card': '--card',
      'popover': '--popover'
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
    if (!css.includes(varDef)) {
      css += `  ${varDef}\n`;
    }
  });
  
  // Add border radius (shadcn/ui uses --radius as base)
  if (tokens.radius) {
    const radiusBase = tokens.radius.md || tokens.radius.default || "0.5rem";
    css += `  --radius: ${radiusBase};\n`;
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

// Update index.css file with new tokens
function updateIndexCSS(tokens: TokenStructure, indexCssPath: string): void {
  let content = '';
  
  // Check if index.css exists
  if (existsSync(indexCssPath)) {
    content = readFileSync(indexCssPath, 'utf-8');
  } else {
    // Create basic structure if file doesn't exist
    content = '@import "tailwindcss";\n@source "../.storybook/stories/**/*.{ts,tsx,js,jsx,mdx}";\n@import "tw-animate-css";\n\n@custom-variant dark (&:is(.dark *));\n\n';
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
    description: "Parse design input and generate both structured Design JSON and complete token system (Tailwind config + CSS variables). Intelligently extracts design tokens from input and uses shadcn/ui defaults as fallbacks.",
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
      const { input: designInput, outputDir, includeCSS } = validatedInput;
      
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
      
      // Step 3: Merge extracted tokens with shadcn defaults
      const finalTokens = mergeWithDefaults(analysisResult.tokens || {});
      
      // Step 4: Convert to DesignSchema format
      const designTokens = convertTokensToDesignSchema(finalTokens);
      
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
      
      // Step 5: Validate against DesignSchema
      const validatedDesign = DesignSchema.parse(designData);
      
      // Step 6: Generate output files
      const outputFiles: string[] = [];
      
      // Write design.json to the root of .supercomponents
      const designJsonPath = join(outputDir, "design.json");
      writeFileSync(designJsonPath, JSON.stringify(validatedDesign, null, 2));
      outputFiles.push(designJsonPath);
      
      // Note: Tailwind v4 doesn't use config files - all styling is done via CSS variables in index.css
      
      // Update the main index.css file with new tokens
      if (includeCSS) {
        const indexCssPath = join(outputDir, "src/index.css");
        updateIndexCSS(finalTokens, indexCssPath);
        outputFiles.push(indexCssPath);
      }
      
      // Generate summary of what was extracted vs what used defaults
      const extractedCategories = Object.keys(analysisResult.tokens || {}).filter(k => 
        analysisResult.tokens[k] && Object.keys(analysisResult.tokens[k]).length > 0
      );
      const defaultCategories = Object.keys(finalTokens).filter(k => 
        !extractedCategories.includes(k)
      );
      
      let summary = `✅ Generated design system with ${designTokens.length} tokens`;
      if (extractedCategories.length > 0) {
        summary += `\n\n🎨 Extracted from design: ${extractedCategories.join(', ')}`;
      }
      if (defaultCategories.length > 0) {
        summary += `\n📋 Used shadcn/ui defaults: ${defaultCategories.join(', ')}`;
      }
      
      return {
        success: true,
        design: validatedDesign,
        tokens: finalTokens,
        extractedTokens: analysisResult.tokens,
        files: outputFiles,
        message: `${summary}\n\nUpdated ${outputFiles.length} files:\n${outputFiles.map(f => `  - ${f}`).join('\n')}\n\n💡 Your Storybook should now display the design tokens correctly!\n\n🔄 Next steps:\n  - Restart Storybook to see the updated design tokens\n  - Use 'createTokenStories' to generate additional token stories\n  - Use 'analyzeComponents' to analyze existing components\n  - Use 'generateInstruction' to create implementation guidance`
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