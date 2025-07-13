import { z } from "zod";
import { Tool } from "../types.js";
import { zodToJsonSchema } from "../utils/validation.js";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join, resolve } from "path";
import { getLogger } from "../utils/logger.js";

// Utility function to convert hex to HSL
function hexToHsl(hex: string): string {
  // Remove hash if present
  hex = hex.replace('#', '');
  
  // Convert to RGB
  const r = parseInt(hex.substr(0, 2), 16) / 255;
  const g = parseInt(hex.substr(2, 2), 16) / 255;
  const b = parseInt(hex.substr(4, 2), 16) / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  
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
  
  return `hsl(${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%)`;
}

const logger = getLogger();

// Function to update CSS variables in index.css
function updateCSSVariables(tokens: DesignToken[], projectPath: string): void {
  const cssFilePath = join(projectPath, '.supercomponents', 'src', 'index.css');
  
  if (!existsSync(cssFilePath)) {
    logger.warn(`CSS file not found: ${cssFilePath}`);
    return;
  }
  
  let cssContent = readFileSync(cssFilePath, 'utf-8');
  
  // Create a mapping from design tokens to CSS variables
  const tokenToCSSMap: Record<string, string> = {
    'color-primary': '--primary',
    'color-primary-500': '--primary',
    'color-secondary': '--secondary',
    'color-secondary-500': '--secondary',
    'color-background': '--background',
    'color-surface': '--background',
    'color-card': '--card',
    'color-foreground': '--foreground',
    'color-text-primary': '--foreground',
    'color-text-secondary': '--muted-foreground',
    'color-text-muted': '--muted-foreground',
    'color-border': '--border',
    'color-input': '--input',
    'color-ring': '--ring',
    'color-accent': '--accent',
    'color-destructive': '--destructive',
    'color-danger': '--destructive',
    'color-muted': '--muted',
  };
  
  // Process each token
  for (const token of tokens) {
    const cssVariable = tokenToCSSMap[token.name];
    
    if (cssVariable && token.type === 'color') {
      let colorValue = token.value as string;
      
      // Convert hex to HSL if needed
      if (colorValue.startsWith('#')) {
        colorValue = hexToHsl(colorValue);
      }
      
      // Update the CSS variable in both light and dark mode
      const lightModeRegex = new RegExp(`(\\s*${cssVariable}:\\s*)[^;]+;`, 'g');
      const darkModeRegex = new RegExp(`(\\.dark\\s*{[^}]*\\s*${cssVariable}:\\s*)[^;]+;`, 'g');
      
      cssContent = cssContent.replace(lightModeRegex, `$1${colorValue};`);
      
      logger.info(`Updated CSS variable ${cssVariable} to ${colorValue}`);
    }
  }
  
  // Write the updated CSS file
  writeFileSync(cssFilePath, cssContent, 'utf-8');
  logger.info(`Updated CSS variables in ${cssFilePath}`);
}

// Input schema for the createTokenStories tool - updated for token value updating
const inputSchema = z.object({
  projectPath: z.string().default(".").describe("Root directory to search for design files").optional(),
  designFile: z.string().optional().describe("Explicit path to design.json file (optional, auto-discovery used if not provided)"),
  storybookDir: z.string().default("./.supercomponents/.storybook").describe("Storybook directory path").optional(),
  outputDir: z.string().default("stories/01-tokens").describe("Directory containing existing token stories").optional(),
});

// Design token interface from design.json
interface DesignToken {
  name: string;
  value: string | number | object;
  type: string;
  category?: string;
}

// Design file structure
interface DesignFile {
  id?: string;
  tokens: DesignToken[];
  metadata?: Record<string, any>;
}

// Token mapping interfaces
interface ColorMapping {
  cssVariable: string;
  category: 'functional' | 'component';
  subcategory?: string;
}

interface TypographyMapping {
  cssVariable: string;
  category: 'fontSize' | 'fontWeight' | 'letterSpacing';
}

interface SpacingMapping {
  name: string;
  multiplier: number;
}

interface RadiusMapping {
  cssVariable: string;
}

interface ShadowMapping {
  cssVariable: string;
}

/**
 * Enhanced file discovery system for design tokens
 */
async function findDesignFile(projectPath: string, designFile?: string): Promise<string | null> {
  const resolvedProjectPath = resolve(projectPath);
  
  // Priority 1: Explicit designFile parameter
  if (designFile) {
    const explicitPath = resolve(resolvedProjectPath, designFile);
    if (existsSync(explicitPath)) {
      return explicitPath;
    }
  }

  // Priority 2: .supercomponents/design.json
  const supercomponentsDesignPath = join(resolvedProjectPath, '.supercomponents', 'design.json');
  if (existsSync(supercomponentsDesignPath)) {
    return supercomponentsDesignPath;
  }

  // Priority 3: ./design.json
  const currentDesignPath = join(resolvedProjectPath, 'design.json');
  if (existsSync(currentDesignPath)) {
    return currentDesignPath;
  }

  return null;
}

/**
 * Parse design.json file and extract tokens by type
 */
function parseDesignTokens(filePath: string): Record<string, Record<string, any>> {
  try {
    const content = readFileSync(filePath, 'utf8');
    const designData: DesignFile = JSON.parse(content);
    
    if (!designData.tokens || !Array.isArray(designData.tokens)) {
      throw new Error('Invalid design.json format: missing or invalid tokens array');
    }

    const tokensByType: Record<string, Record<string, any>> = {};

    // Group tokens by type
    designData.tokens.forEach(token => {
      const { type, name, value } = token;
      
      if (!tokensByType[type]) {
        tokensByType[type] = {};
      }

      // Clean token name (remove type prefix if present)
      const cleanName = name.startsWith(`${type}-`) ? name.substring(type.length + 1) : name;
      tokensByType[type][cleanName] = value;
    });
    
    return tokensByType;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to parse design.json: ${errorMessage}`);
  }
}

/**
 * Comprehensive token mapping system
 */
class TokenMapper {
  // Color mapping from design.json tokens to CSS variables
  private colorMappings: Record<string, ColorMapping> = {
    // Primary functional colors
    'primary': { cssVariable: '--primary', category: 'functional' },
    'background': { cssVariable: '--background', category: 'functional' },
    'background-page': { cssVariable: '--background', category: 'functional' },
    'background-card': { cssVariable: '--card', category: 'functional' },
    'background-input': { cssVariable: '--input', category: 'component' },
    'foreground': { cssVariable: '--foreground', category: 'functional' },
    'text-primary': { cssVariable: '--foreground', category: 'functional' },
    'text-secondary': { cssVariable: '--muted-foreground', category: 'functional' },
    'text-muted': { cssVariable: '--muted-foreground', category: 'functional' },
    'border-input': { cssVariable: '--border', category: 'component' },
    'ring': { cssVariable: '--ring', category: 'component' },
    
    // Secondary colors
    'secondary': { cssVariable: '--secondary', category: 'functional' },
    'accent': { cssVariable: '--accent', category: 'functional' },
    'muted': { cssVariable: '--muted', category: 'functional' },
    'destructive': { cssVariable: '--destructive', category: 'functional' },
    
    // Component colors
    'card': { cssVariable: '--card', category: 'component' },
    'popover': { cssVariable: '--popover', category: 'component' },
    'input': { cssVariable: '--input', category: 'component' },
    'border': { cssVariable: '--border', category: 'component' },
  };

  // Typography mapping
  private typographyMappings: Record<string, TypographyMapping> = {
    // Font sizes (convert px to rem-based CSS variables)
    'sizes-xs': { cssVariable: '--text-xs', category: 'fontSize' },
    'sizes-sm': { cssVariable: '--text-sm', category: 'fontSize' },
    'sizes-base': { cssVariable: '--text-base', category: 'fontSize' },
    'sizes-body': { cssVariable: '--text-base', category: 'fontSize' },
    'sizes-lg': { cssVariable: '--text-lg', category: 'fontSize' },
    'sizes-xl': { cssVariable: '--text-xl', category: 'fontSize' },
    'sizes-2xl': { cssVariable: '--text-2xl', category: 'fontSize' },
    'sizes-heading': { cssVariable: '--text-2xl', category: 'fontSize' },
    'sizes-subheading': { cssVariable: '--text-base', category: 'fontSize' },
    'sizes-small': { cssVariable: '--text-xs', category: 'fontSize' },
    
    // Font weights
    'weights-thin': { cssVariable: '--font-weight-thin', category: 'fontWeight' },
    'weights-extralight': { cssVariable: '--font-weight-extralight', category: 'fontWeight' },
    'weights-light': { cssVariable: '--font-weight-light', category: 'fontWeight' },
    'weights-normal': { cssVariable: '--font-weight-normal', category: 'fontWeight' },
    'weights-regular': { cssVariable: '--font-weight-normal', category: 'fontWeight' },
    'weights-medium': { cssVariable: '--font-weight-medium', category: 'fontWeight' },
    'weights-semibold': { cssVariable: '--font-weight-semibold', category: 'fontWeight' },
    'weights-bold': { cssVariable: '--font-weight-bold', category: 'fontWeight' },
    'weights-extrabold': { cssVariable: '--font-weight-extrabold', category: 'fontWeight' },
    'weights-black': { cssVariable: '--font-weight-black', category: 'fontWeight' },
    
    // Letter spacing
    'letterSpacing-tighter': { cssVariable: '--tracking-tighter', category: 'letterSpacing' },
    'letterSpacing-tight': { cssVariable: '--tracking-tight', category: 'letterSpacing' },
    'letterSpacing-normal': { cssVariable: '--tracking-normal', category: 'letterSpacing' },
    'letterSpacing-wide': { cssVariable: '--tracking-wide', category: 'letterSpacing' },
    'letterSpacing-wider': { cssVariable: '--tracking-wider', category: 'letterSpacing' },
    'letterSpacing-widest': { cssVariable: '--tracking-widest', category: 'letterSpacing' },
  };

  // Spacing mapping (convert to multiplier system)
  private spacingMappings: Record<string, SpacingMapping> = {
    'form-padding': { name: 'x-8', multiplier: 8 }, // 32px / 4 = 8
    'form-gap': { name: 'x-4', multiplier: 4 }, // 16px / 4 = 4
    'form-elementSpacing': { name: 'x-6', multiplier: 6 }, // 24px / 4 = 6
  };

  // Radius mapping
  private radiusMappings: Record<string, RadiusMapping> = {
    'input': { cssVariable: '--radius-sm' },
    'button': { cssVariable: '--radius-md' },
    'card': { cssVariable: '--radius-lg' },
    'sm': { cssVariable: '--radius-xs' },
    'md': { cssVariable: '--radius-md' },
    'lg': { cssVariable: '--radius-lg' },
  };

  // Shadow mapping
  private shadowMappings: Record<string, ShadowMapping> = {
    'card': { cssVariable: '--shadow-md' },
    'sm': { cssVariable: '--shadow-sm' },
    'md': { cssVariable: '--shadow-md' },
    'lg': { cssVariable: '--shadow-lg' },
    'xl': { cssVariable: '--shadow-xl' },
  };

  /**
   * Map color tokens to story arguments
   */
  mapColorTokens(colorTokens: Record<string, any>): { 
    functional: Array<{ name: string; colors: Record<string, string> }>;
    component: Array<{ name: string; colors: Record<string, string> }>;
    unmapped: string[];
  } {
    const functional: Array<{ name: string; colors: Record<string, string> }> = [];
    const component: Array<{ name: string; colors: Record<string, string> }> = [];
    const unmapped: string[] = [];

    // Group existing functional categories
    const functionalGroups: Record<string, Record<string, string>> = {
      'Background': {},
      'Primary': {},
      'Secondary': {},
      'Accent': {},
      'Muted': {},
      'Destructive': {},
    };

    // Group existing component categories
    const componentGroups: Record<string, Record<string, string>> = {
      'Border': {},
      'Card': {},
      'Input': {},
      'Popover': {},
      'Chart': {},
      'Sidebar': {},
    };

    // Process each color token
    Object.entries(colorTokens).forEach(([tokenName, value]) => {
      const mapping = this.colorMappings[tokenName];
      
      if (mapping) {
        const cssVar = mapping.cssVariable;
        
        if (mapping.category === 'functional') {
          // Determine which functional group this belongs to
          if (cssVar.includes('background') || cssVar.includes('card')) {
            functionalGroups.Background[cssVar.replace('--', '')] = cssVar;
            if (cssVar === '--card') {
              functionalGroups.Background[`${cssVar.replace('--', '')}-foreground`] = `${cssVar}-foreground`;
            }
          } else if (cssVar.includes('primary')) {
            functionalGroups.Primary[cssVar.replace('--', '')] = cssVar;
            functionalGroups.Primary[`${cssVar.replace('--', '')}-foreground`] = `${cssVar}-foreground`;
          } else if (cssVar.includes('secondary')) {
            functionalGroups.Secondary[cssVar.replace('--', '')] = cssVar;
            functionalGroups.Secondary[`${cssVar.replace('--', '')}-foreground`] = `${cssVar}-foreground`;
          } else if (cssVar.includes('accent')) {
            functionalGroups.Accent[cssVar.replace('--', '')] = cssVar;
            functionalGroups.Accent[`${cssVar.replace('--', '')}-foreground`] = `${cssVar}-foreground`;
          } else if (cssVar.includes('muted')) {
            functionalGroups.Muted[cssVar.replace('--', '')] = cssVar;
            functionalGroups.Muted[`${cssVar.replace('--', '')}-foreground`] = `${cssVar}-foreground`;
          } else if (cssVar.includes('destructive')) {
            functionalGroups.Destructive[cssVar.replace('--', '')] = cssVar;
          } else if (cssVar.includes('foreground')) {
            functionalGroups.Background['foreground'] = cssVar;
          }
        } else if (mapping.category === 'component') {
          // Determine which component group this belongs to
          if (cssVar.includes('border') || cssVar.includes('ring')) {
            componentGroups.Border[cssVar.replace('--', '')] = cssVar;
          } else if (cssVar.includes('input')) {
            componentGroups.Input[cssVar.replace('--', '')] = cssVar;
          } else if (cssVar.includes('popover')) {
            componentGroups.Popover[cssVar.replace('--', '')] = cssVar;
            componentGroups.Popover[`${cssVar.replace('--', '')}-foreground`] = `${cssVar}-foreground`;
          }
        }
      } else {
        unmapped.push(tokenName);
      }
    });

    // Convert groups to story format
    Object.entries(functionalGroups).forEach(([groupName, colors]) => {
      if (Object.keys(colors).length > 0) {
        functional.push({ name: groupName, colors });
      }
    });

    Object.entries(componentGroups).forEach(([groupName, colors]) => {
      if (Object.keys(colors).length > 0) {
        component.push({ name: groupName, colors });
      }
    });

    // Add default chart and sidebar if not present
    if (!component.some(group => group.name === 'Chart')) {
      component.push({
        name: 'Chart',
        colors: {
          '1': '--chart-1',
          '2': '--chart-2',
          '3': '--chart-3',
          '4': '--chart-4',
          '5': '--chart-5',
        }
      });
    }

    if (!component.some(group => group.name === 'Sidebar')) {
      component.push({
        name: 'Sidebar',
        colors: {
          'background': '--sidebar',
          'foreground': '--sidebar-foreground',
          'primary': '--sidebar-primary',
          'primary-foreground': '--sidebar-primary-foreground',
          'accent': '--sidebar-accent',
          'accent-foreground': '--sidebar-accent-foreground',
          'border': '--sidebar-border',
          'ring': '--sidebar-ring',
        }
      });
    }

    return { functional, component, unmapped };
  }

  /**
   * Map typography tokens to story arguments
   */
  mapTypographyTokens(typographyTokens: Record<string, any>): {
    fontFamily: Array<{ name: string; value: string }>;
    fontSize: Array<{ name: string; value: string }>;
    fontWeight: Array<{ name: string; value: string }>;
    letterSpacing: Array<{ name: string; value: string }>;
    unmapped: string[];
  } {
    const fontFamily: Array<{ name: string; value: string }> = [
      { name: 'sans', value: '--font-sans' },
      { name: 'serif', value: '--font-serif' },
      { name: 'mono', value: '--font-mono' },
    ];

    const fontSize: Array<{ name: string; value: string }> = [];
    const fontWeight: Array<{ name: string; value: string }> = [];
    const letterSpacing: Array<{ name: string; value: string }> = [];
    const unmapped: string[] = [];

    // Process typography tokens
    Object.entries(typographyTokens).forEach(([tokenName, value]) => {
      const mapping = this.typographyMappings[tokenName];
      
      if (mapping) {
        const cssVar = mapping.cssVariable;
        const cleanName = cssVar.replace('--text-', '').replace('--font-weight-', '').replace('--tracking-', '');
        
        switch (mapping.category) {
          case 'fontSize':
            fontSize.push({ name: cleanName, value: cssVar });
            break;
          case 'fontWeight':
            fontWeight.push({ name: cleanName, value: cssVar });
            break;
          case 'letterSpacing':
            letterSpacing.push({ name: cleanName, value: cssVar });
            break;
        }
      } else {
        unmapped.push(tokenName);
      }
    });

    // Add defaults if empty
    if (fontSize.length === 0) {
      fontSize.push(
        { name: 'xs', value: '--text-xs' },
        { name: 'sm', value: '--text-sm' },
        { name: 'base', value: '--text-base' },
        { name: 'lg', value: '--text-lg' },
        { name: 'xl', value: '--text-xl' },
        { name: '2xl', value: '--text-2xl' },
        { name: '3xl', value: '--text-3xl' },
        { name: '4xl', value: '--text-4xl' },
        { name: '5xl', value: '--text-5xl' },
        { name: '6xl', value: '--text-6xl' },
      );
    }

    if (fontWeight.length === 0) {
      fontWeight.push(
        { name: 'thin', value: '--font-weight-thin' },
        { name: 'extralight', value: '--font-weight-extralight' },
        { name: 'light', value: '--font-weight-light' },
        { name: 'normal', value: '--font-weight-normal' },
        { name: 'medium', value: '--font-weight-medium' },
        { name: 'semibold', value: '--font-weight-semibold' },
        { name: 'bold', value: '--font-weight-bold' },
        { name: 'extrabold', value: '--font-weight-extrabold' },
        { name: 'black', value: '--font-weight-black' },
      );
    }

    if (letterSpacing.length === 0) {
      letterSpacing.push(
        { name: 'tighter', value: '--tracking-tighter' },
        { name: 'tight', value: '--tracking-tight' },
        { name: 'normal', value: '--tracking-normal' },
        { name: 'wide', value: '--tracking-wide' },
        { name: 'wider', value: '--tracking-wider' },
        { name: 'widest', value: '--tracking-widest' },
      );
    }

    return { fontFamily, fontSize, fontWeight, letterSpacing, unmapped };
  }

  /**
   * Map spacing tokens to story arguments (convert to multiplier system)
   */
  mapSpacingTokens(spacingTokens: Record<string, any>): {
    scale: Array<{ name: string; value: number }>;
    unmapped: string[];
  } {
    const scale: Array<{ name: string; value: number }> = [];
    const unmapped: string[] = [];

    // Process spacing tokens
    Object.entries(spacingTokens).forEach(([tokenName, value]) => {
      const mapping = this.spacingMappings[tokenName];
      
      if (mapping) {
        scale.push({ name: mapping.name, value: mapping.multiplier });
      } else {
        // Try to infer multiplier from value
        if (typeof value === 'number' && value % 4 === 0) {
          const multiplier = value / 4;
          scale.push({ name: `x-${multiplier}`, value: multiplier });
        } else {
          unmapped.push(tokenName);
        }
      }
    });

    // Add default scale if empty
    if (scale.length === 0) {
      scale.push(
        { name: 'x-1', value: 1 },
        { name: 'x-4', value: 4 },
        { name: 'x-8', value: 8 },
        { name: 'x-12', value: 12 },
        { name: 'x-16', value: 16 },
        { name: 'x-20', value: 20 },
        { name: 'x-24', value: 24 },
        { name: 'x-28', value: 28 },
        { name: 'x-32', value: 32 },
        { name: 'x-36', value: 36 },
        { name: 'x-40', value: 40 },
        { name: 'x-44', value: 44 },
        { name: 'x-48', value: 48 },
        { name: 'x-52', value: 52 },
        { name: 'x-56', value: 56 },
        { name: 'x-60', value: 60 },
        { name: 'x-64', value: 64 },
        { name: 'x-68', value: 68 },
        { name: 'x-72', value: 72 },
        { name: 'x-76', value: 76 },
        { name: 'x-80', value: 80 },
      );
    }

    // Sort by value
    scale.sort((a, b) => a.value - b.value);

    return { scale, unmapped };
  }

  /**
   * Map radius tokens to story arguments
   */
  mapRadiusTokens(radiusTokens: Record<string, any>): {
    radius: Array<{ name: string; value: string }>;
    unmapped: string[];
  } {
    const radius: Array<{ name: string; value: string }> = [];
    const unmapped: string[] = [];

    // Process radius tokens
    Object.entries(radiusTokens).forEach(([tokenName, value]) => {
      const mapping = this.radiusMappings[tokenName];
      
      if (mapping) {
        const cssVar = mapping.cssVariable;
        const cleanName = cssVar.replace('--radius-', '');
        radius.push({ name: cleanName, value: cssVar });
      } else {
        unmapped.push(tokenName);
      }
    });

    // Add defaults if empty
    if (radius.length === 0) {
      radius.push(
        { name: 'xs', value: '--radius-xs' },
        { name: 'sm', value: '--radius-sm' },
        { name: 'md', value: '--radius-md' },
        { name: 'lg', value: '--radius-lg' },
      );
    }

    return { radius, unmapped };
  }

  /**
   * Map shadow/elevation tokens to story arguments
   */
  mapShadowTokens(elevationTokens: Record<string, any>): {
    shadow: Array<{ name: string; value: string }>;
    unmapped: string[];
  } {
    const shadow: Array<{ name: string; value: string }> = [];
    const unmapped: string[] = [];

    // Process elevation tokens
    Object.entries(elevationTokens).forEach(([tokenName, value]) => {
      const mapping = this.shadowMappings[tokenName];
      
      if (mapping) {
        const cssVar = mapping.cssVariable;
        const cleanName = cssVar.replace('--shadow-', '');
        shadow.push({ name: cleanName, value: cssVar });
      } else {
        unmapped.push(tokenName);
      }
    });

    // Add defaults if empty
    if (shadow.length === 0) {
      shadow.push(
        { name: 'xxs', value: '--shadow-2xs' },
        { name: 'xs', value: '--shadow-xs' },
        { name: 'sm', value: '--shadow-sm' },
        { name: 'md', value: '--shadow-md' },
        { name: 'lg', value: '--shadow-lg' },
        { name: 'xl', value: '--shadow-xl' },
        { name: '2xl', value: '--shadow-2xl' },
      );
    }

    return { shadow, unmapped };
  }
}

/**
 * Story File Updater - Updates existing story files with new token values
 */
class StoryFileUpdater {
  private storybookDir: string;
  private tokenDir: string;

  constructor(storybookDir: string, tokenDir: string) {
    this.storybookDir = storybookDir;
    this.tokenDir = join(storybookDir, tokenDir);
  }

  /**
   * Update color stories with mapped tokens
   */
  updateColorStories(colorMapping: any): boolean {
    const colorStoriesPath = join(this.tokenDir, 'color.stories.tsx');
    
    if (!existsSync(colorStoriesPath)) {
      logger.warn(`Color stories file not found: ${colorStoriesPath}`);
      return false;
    }

    try {
      let content = readFileSync(colorStoriesPath, 'utf8');
      
      // Update Functional story args
      if (colorMapping.functional.length > 0) {
        const functionalArgs = colorMapping.functional.map((swatch: any) => 
          `      {\n        name: "${swatch.name}",\n        colors: {\n${Object.entries(swatch.colors).map(([key, value]) => 
            `          ${key}: "${value}"`
          ).join(',\n')},\n        },\n      }`
        ).join(',\n');

        content = content.replace(
          /(export const Functional: Story = \{\s*args: \{\s*swatch: \[)[^}]+(\]\s*\}\s*\};)/s,
          `$1\n${functionalArgs}\n    $2`
        );
      }

      // Update Component story args
      if (colorMapping.component.length > 0) {
        const componentArgs = colorMapping.component.map((swatch: any) => 
          `      {\n        name: "${swatch.name}",\n        colors: {\n${Object.entries(swatch.colors).map(([key, value]) => 
            `          "${key}": "${value}"`
          ).join(',\n')},\n        },\n      }`
        ).join(',\n');

        content = content.replace(
          /(export const Component: Story = \{\s*args: \{\s*swatch: \[)[^}]+(\]\s*\}\s*\};)/s,
          `$1\n${componentArgs}\n    $2`
        );
      }

      writeFileSync(colorStoriesPath, content);
      logger.info(`Updated color stories: ${colorStoriesPath}`);
      return true;
    } catch (error) {
      logger.error(`Failed to update color stories: ${error}`);
      return false;
    }
  }

  /**
   * Update typography stories with mapped tokens
   */
  updateTypographyStories(typographyMapping: any): boolean {
    const typographyStoriesPath = join(this.tokenDir, 'typography.stories.tsx');
    
    if (!existsSync(typographyStoriesPath)) {
      logger.warn(`Typography stories file not found: ${typographyStoriesPath}`);
      return false;
    }

    try {
      let content = readFileSync(typographyStoriesPath, 'utf8');
      
      // Update each typography category
      const categories = ['FontFamily', 'FontSize', 'FontWeight', 'LetterSpacing'];
      const mappings = {
        FontFamily: typographyMapping.fontFamily,
        FontSize: typographyMapping.fontSize,
        FontWeight: typographyMapping.fontWeight,
        LetterSpacing: typographyMapping.letterSpacing,
      };

      categories.forEach(category => {
        const tokens = mappings[category as keyof typeof mappings];
        if (tokens && tokens.length > 0) {
          const args = tokens.map((token: any) => 
            `      { name: "${token.name}", value: "${token.value}" }`
          ).join(',\n');

          const regex = new RegExp(
            `(export const ${category}: Story = \\{\\s*args: \\{[^\\[]*property: \\[)[^\\]]+`,
            's'
          );

          content = content.replace(regex, `$1\n${args}\n    `);
        }
      });

      writeFileSync(typographyStoriesPath, content);
      logger.info(`Updated typography stories: ${typographyStoriesPath}`);
      return true;
    } catch (error) {
      logger.error(`Failed to update typography stories: ${error}`);
      return false;
    }
  }

  /**
   * Update spacing stories with mapped tokens
   */
  updateSpacingStories(spacingMapping: any): boolean {
    const spacingStoriesPath = join(this.tokenDir, 'spacing.stories.tsx');
    
    if (!existsSync(spacingStoriesPath)) {
      logger.warn(`Spacing stories file not found: ${spacingStoriesPath}`);
      return false;
    }

    try {
      let content = readFileSync(spacingStoriesPath, 'utf8');
      
      if (spacingMapping.scale.length > 0) {
        const args = spacingMapping.scale.map((space: any) => 
          `      { name: "${space.name}", value: ${space.value} }`
        ).join(',\n');

        content = content.replace(
          /(export const Core: Story = \{\s*args: \{\s*scale: \[)[^}]+(\]\s*\}\s*\};)/s,
          `$1\n${args}\n    $2`
        );
      }

      writeFileSync(spacingStoriesPath, content);
      logger.info(`Updated spacing stories: ${spacingStoriesPath}`);
      return true;
    } catch (error) {
      logger.error(`Failed to update spacing stories: ${error}`);
      return false;
    }
  }

  /**
   * Update radius stories with mapped tokens
   */
  updateRadiusStories(radiusMapping: any): boolean {
    const radiusStoriesPath = join(this.tokenDir, 'radius.stories.tsx');
    
    if (!existsSync(radiusStoriesPath)) {
      logger.warn(`Radius stories file not found: ${radiusStoriesPath}`);
      return false;
    }

    try {
      let content = readFileSync(radiusStoriesPath, 'utf8');
      
      if (radiusMapping.radius.length > 0) {
        const args = radiusMapping.radius.map((radius: any) => 
          `      { name: "${radius.name}", value: "${radius.value}" }`
        ).join(',\n');

        content = content.replace(
          /(export const Core: Story = \{\s*args: \{\s*radius: \[)[^}]+(\]\s*\}\s*\};)/s,
          `$1\n${args}\n    $2`
        );
      }

      writeFileSync(radiusStoriesPath, content);
      logger.info(`Updated radius stories: ${radiusStoriesPath}`);
      return true;
    } catch (error) {
      logger.error(`Failed to update radius stories: ${error}`);
      return false;
    }
  }

  /**
   * Update shadow stories with mapped tokens
   */
  updateShadowStories(shadowMapping: any): boolean {
    const shadowStoriesPath = join(this.tokenDir, 'shadow.stories.tsx');
    
    if (!existsSync(shadowStoriesPath)) {
      logger.warn(`Shadow stories file not found: ${shadowStoriesPath}`);
      return false;
    }

    try {
      let content = readFileSync(shadowStoriesPath, 'utf8');
      
      if (shadowMapping.shadow.length > 0) {
        const args = shadowMapping.shadow.map((shadow: any) => 
          `      { name: "${shadow.name}", value: "${shadow.value}" }`
        ).join(',\n');

        content = content.replace(
          /(export const Core: Story = \{\s*args: \{\s*shadow: \[)[^}]+(\]\s*\}\s*\};)/s,
          `$1\n${args}\n    $2`
        );
      }

      writeFileSync(shadowStoriesPath, content);
      logger.info(`Updated shadow stories: ${shadowStoriesPath}`);
      return true;
    } catch (error) {
      logger.error(`Failed to update shadow stories: ${error}`);
      return false;
    }
  }
}

/**
 * Main createTokenStories tool handler - now updates existing stories
 */
export const createTokenStoriesTool: Tool = {
  definition: {
    name: "createTokenStories",
    description: "Update existing Storybook token stories with values from design.json while preserving the sophisticated file structure and table layouts",
    inputSchema: zodToJsonSchema(inputSchema),
  },

  async handler(input) {
    logger.debug(`Handler called with input: ${JSON.stringify(input, null, 2)}`);
    
    // Handle dummy parameter case (when called via MCP with random_string)
    const processedInput = typeof input === 'object' && 'random_string' in input ? {} : input;
    
    // Parse and validate input with defaults
    const validatedInput = inputSchema.parse(processedInput || {});
    
    // Extract parameters
    const projectPath = validatedInput.projectPath || ".";
    const designFile = validatedInput.designFile;
    const storybookDir = validatedInput.storybookDir || "./.supercomponents/.storybook";
    const outputDir = validatedInput.outputDir || "stories/01-tokens";

    try {
      logger.info(`Updating token stories for SuperComponents from project: ${projectPath}...`);
      
      // Step 1: Find and parse design.json
      const designFilePath = await findDesignFile(projectPath, designFile);
      
      if (!designFilePath) {
        throw new Error(
          `No design.json file found. Searched locations:\n` +
          `  - ${designFile ? resolve(projectPath, designFile) : 'explicit file (not provided)'}\n` +
          `  - ${join(projectPath, '.supercomponents', 'design.json')}\n` +
          `  - ${join(projectPath, 'design.json')}\n\n` +
          `Please run 'parseDesignAndGenerateTokens' first to generate design.json`
        );
      }

      const tokensByType = parseDesignTokens(designFilePath);
      logger.info(`Parsed tokens from ${designFilePath}: ${Object.keys(tokensByType).join(', ')}`);

      // Step 1.5: Update CSS variables in index.css
      const designData = JSON.parse(readFileSync(designFilePath, 'utf-8'));
      const allTokens = designData.tokens || [];
      updateCSSVariables(allTokens, projectPath);

      // Step 2: Check if story files exist
      const tokenStoriesDir = join(storybookDir, outputDir);
      if (!existsSync(tokenStoriesDir)) {
        throw new Error(
          `Token stories directory not found: ${tokenStoriesDir}\n\n` +
          `Please run 'initializeProject' first to set up the Storybook structure.`
        );
      }

      // Step 3: Initialize token mapper and story updater
      const tokenMapper = new TokenMapper();
      const storyUpdater = new StoryFileUpdater(storybookDir, outputDir);

      const updatedFiles: string[] = [];
      const allUnmapped: Record<string, string[]> = {};

      // Step 4: Process each token type
      
      // Colors
      if (tokensByType.color) {
        const colorMapping = tokenMapper.mapColorTokens(tokensByType.color);
        if (storyUpdater.updateColorStories(colorMapping)) {
          updatedFiles.push('color.stories.tsx');
        }
        if (colorMapping.unmapped.length > 0) {
          allUnmapped.colors = colorMapping.unmapped;
        }
      }

      // Typography
      if (tokensByType.typography) {
        const typographyMapping = tokenMapper.mapTypographyTokens(tokensByType.typography);
        if (storyUpdater.updateTypographyStories(typographyMapping)) {
          updatedFiles.push('typography.stories.tsx');
        }
        if (typographyMapping.unmapped.length > 0) {
          allUnmapped.typography = typographyMapping.unmapped;
        }
      }

      // Spacing
      if (tokensByType.spacing) {
        const spacingMapping = tokenMapper.mapSpacingTokens(tokensByType.spacing);
        if (storyUpdater.updateSpacingStories(spacingMapping)) {
          updatedFiles.push('spacing.stories.tsx');
        }
        if (spacingMapping.unmapped.length > 0) {
          allUnmapped.spacing = spacingMapping.unmapped;
        }
      }

      // Radius
      if (tokensByType.radius) {
        const radiusMapping = tokenMapper.mapRadiusTokens(tokensByType.radius);
        if (storyUpdater.updateRadiusStories(radiusMapping)) {
          updatedFiles.push('radius.stories.tsx');
        }
        if (radiusMapping.unmapped.length > 0) {
          allUnmapped.radius = radiusMapping.unmapped;
        }
      }

      // Shadows/Elevation
      if (tokensByType.elevation) {
        const shadowMapping = tokenMapper.mapShadowTokens(tokensByType.elevation);
        if (storyUpdater.updateShadowStories(shadowMapping)) {
          updatedFiles.push('shadow.stories.tsx');
        }
        if (shadowMapping.unmapped.length > 0) {
          allUnmapped.elevation = shadowMapping.unmapped;
        }
      }

      // Step 5: Generate summary
      let message = `✅ Successfully updated ${updatedFiles.length} token story files\n\n`;
      message += `📁 Updated stories in: ${tokenStoriesDir}\n`;
      if (updatedFiles.length > 0) {
        message += `  - ${updatedFiles.join('\n  - ')}\n\n`;
      }

      // Report unmapped tokens
      const unmappedCount = Object.values(allUnmapped).flat().length;
      if (unmappedCount > 0) {
        message += `⚠️  ${unmappedCount} tokens could not be mapped:\n`;
        Object.entries(allUnmapped).forEach(([type, tokens]) => {
          message += `  ${type}: ${tokens.join(', ')}\n`;
        });
        message += `\n💡 These tokens may need custom CSS variables or story updates.\n\n`;
      }

      message += `🔄 Next steps:\n`;
      message += `  - Restart Storybook to see the updated token values\n`;
      message += `  - Review the token stories in the '01-tokens' section\n`;
      message += `  - Use 'analyzeComponents' to analyze existing components\n`;
      message += `  - Use 'generateInstruction' to create implementation guidance`;

      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            success: true,
            updatedFiles,
            tokensProcessed: Object.keys(tokensByType),
            unmappedTokens: allUnmapped,
            message,
            timestamp: new Date().toISOString(),
            outputPath: tokenStoriesDir
          }, null, 2)
        }],
        isError: false
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`Failed to update token stories: ${errorMessage}`);
      
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            success: false,
            error: errorMessage,
            message: "Failed to update token stories",
            troubleshooting: [
              "Ensure design.json exists (run 'parseDesignAndGenerateTokens' first)",
              "Ensure Storybook structure exists (run 'initializeProject' first)",
              "Check that token story files exist in .supercomponents/.storybook/stories/01-tokens/",
              "Verify file permissions and accessibility"
            ]
          }, null, 2)
        }],
        isError: true
      };
    }
  }
}; 