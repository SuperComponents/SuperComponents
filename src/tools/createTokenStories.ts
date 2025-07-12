import { z } from "zod";
import { Tool } from "../types.js";
import { zodToJsonSchema } from "../utils/validation.js";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join, dirname, resolve } from "path";
import { getLogger } from "../utils/logger.js";
import fg from "fast-glob";

const logger = getLogger();

// Input schema for the createTokenStories tool  
const inputSchema = z.object({
  projectPath: z.string().default(".").describe("Root directory to search for design files").optional(),
  designFile: z.string().optional().describe("Explicit path to design.json file (optional, auto-discovery used if not provided)"),
  tokensDir: z.string().optional().describe("Legacy: Directory containing design tokens (fallback if design.json not found)"),
  storybookDir: z.string().default(".storybook").describe("Storybook directory path").optional(),
  outputDir: z.string().default("stories/tokens").describe("Output directory for token stories (relative to storybookDir)").optional(),
  includeTypes: z.array(z.enum(["colors", "color", "typography", "spacing", "radius", "elevation", "opacity", "durations", "zIndex", "easing"]))
    .default(["colors", "color", "typography", "spacing"])
    .describe("Token types to generate stories for")
    .optional(),
  storyFormat: z.enum(["csf", "mdx"]).default("csf").describe("Story format - CSF or MDX").optional(),
});

// Token structure interface
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

// Story template interface
interface StoryTemplate {
  title: string;
  component: string;
  args: Record<string, any>;
  argTypes: Record<string, any>;
  parameters: Record<string, any>;
}

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

/**
 * Enhanced file discovery system for design tokens
 */
async function findDesignFiles(projectPath: string, designFile?: string): Promise<string | null> {
  // Ensure projectPath is defined
  if (!projectPath) {
    throw new Error('projectPath is required for findDesignFiles');
  }
  const resolvedProjectPath = resolve(projectPath);
  
  // Priority 1: Explicit designFile parameter
  if (designFile) {
    const explicitPath = resolve(resolvedProjectPath, designFile);
    if (existsSync(explicitPath)) {
      logger.debug(`Found explicit design file: ${explicitPath}`);
      return explicitPath;
    }
    logger.warn(`Explicit design file not found: ${explicitPath}`);
  }

  // Priority 2: .supercomponents/design.json (hidden directory)
  const hiddenDesignPath = join(resolvedProjectPath, '.supercomponents', 'design.json');
  if (existsSync(hiddenDesignPath)) {
    logger.debug(`Found design file in hidden directory: ${hiddenDesignPath}`);
    return hiddenDesignPath;
  }

  // Priority 3: supercomponents/design.json (visible directory)
  const visibleDesignPath = join(resolvedProjectPath, 'supercomponents', 'design.json');
  if (existsSync(visibleDesignPath)) {
    logger.debug(`Found design file in visible directory: ${visibleDesignPath}`);
    return visibleDesignPath;
  }

  // Priority 4: Search subdirectories with fast-glob
  try {
    const patterns = [
      '**/design.json',
      '**/.supercomponents/design.json',
      '**/supercomponents/design.json'
    ];
    
    const foundFiles = await fg(patterns, {
      cwd: resolvedProjectPath,
      absolute: true,
      ignore: ['node_modules/**', '.git/**', 'dist/**', 'build/**'],
      onlyFiles: true
    });

    if (foundFiles.length > 0) {
      logger.debug(`Found design files via glob search: ${foundFiles}`);
      return foundFiles[0]; // Return first match
    }
  } catch (error) {
    logger.warn(`Fast-glob search failed: ${error instanceof Error ? error.message : String(error)}`);
  }

  logger.debug('No design.json files found');
  return null;
}

/**
 * Parse design.json file and convert to TokenStructure format
 */
function parseDesignJson(filePath: string): TokenStructure {
  try {
    const content = readFileSync(filePath, 'utf8');
    const designData: DesignFile = JSON.parse(content);
    
    if (!designData.tokens || !Array.isArray(designData.tokens)) {
      throw new Error('Invalid design.json format: missing or invalid tokens array');
    }

    const tokenStructure: TokenStructure = {};

    // Group tokens by type
    designData.tokens.forEach(token => {
      const { type, name, value } = token;
      
      if (!tokenStructure[type]) {
        tokenStructure[type] = {};
      }

      // Clean token name (remove type prefix if present)
      const cleanName = name.startsWith(`${type}-`) ? name.substring(type.length + 1) : name;
      
      tokenStructure[type][cleanName] = value;
    });

    // Debug: Log token types found
    const tokenTypes = Object.keys(tokenStructure);
    logger.debug(`Parsed ${designData.tokens.length} tokens from design.json`);
    logger.debug(`Token types found: ${tokenTypes.join(', ')}`);
    
    // Debug: Log color tokens specifically
    if (tokenStructure.color) {
      logger.debug(`Found ${Object.keys(tokenStructure.color).length} color tokens`);
      logger.debug(`Color tokens: ${Object.keys(tokenStructure.color).join(', ')}`);
    } else {
      logger.debug('No color tokens found in parsed structure');
    }
    
    return tokenStructure;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to parse design.json: ${errorMessage}`);
  }
}

/**
 * Enhanced Token Data Reader with design.json support
 * Reads and parses design token data from various sources including design.json
 */
class TokenDataReader {
  private projectPath: string;
  private designFile?: string;
  private tokensDir?: string;

  constructor(projectPath: string, designFile?: string, tokensDir?: string) {
    this.projectPath = projectPath;
    this.designFile = designFile;
    this.tokensDir = tokensDir;
  }

  /**
   * Read tokens with enhanced discovery and fallback strategy
   */
  async readTokens(): Promise<TokenStructure> {
    // Step 1: Try to find design.json files
    const designFilePath = await findDesignFiles(this.projectPath, this.designFile);
    
    if (designFilePath) {
      logger.info(`Using design file: ${designFilePath}`);
      return parseDesignJson(designFilePath);
    }

    // Step 2: Fallback to legacy token directory approach
    if (this.tokensDir) {
      logger.info(`Falling back to legacy token directory: ${this.tokensDir}`);
      return await this.readLegacyTokens();
    }

    // Step 3: Try default token locations in project
    const defaultTokensDir = join(this.projectPath, '.supercomponents');
    if (existsSync(defaultTokensDir)) {
      logger.info(`Trying default tokens directory: ${defaultTokensDir}`);
      this.tokensDir = defaultTokensDir;
      return await this.readLegacyTokens();
    }

    // Create detailed error message with search paths
    const searchedPaths = [
      this.designFile ? resolve(this.projectPath, this.designFile) : null,
      join(this.projectPath, '.supercomponents', 'design.json'),
      join(this.projectPath, 'supercomponents', 'design.json'),
      this.tokensDir ? join(this.tokensDir, 'tokens.json') : null,
      join(this.projectPath, '.supercomponents', 'tokens.json'),
    ].filter(Boolean);

    throw new Error(
      `No design tokens found. Searched the following locations:\n` +
      searchedPaths.map(path => `  - ${path}`).join('\n') + '\n\n' +
      `To fix this issue:\n` +
      `  1. Ensure design.json exists in .supercomponents/ directory\n` +
      `  2. Or provide explicit designFile parameter\n` +
      `  3. Or ensure legacy token files exist in specified tokensDir`
    );
  }

  /**
   * Read tokens from legacy token files (original implementation)
   */
  private async readLegacyTokens(): Promise<TokenStructure> {
    if (!this.tokensDir) {
      throw new Error('No tokens directory specified for legacy fallback');
    }

    const possibleFiles = [
      join(this.tokensDir, "tokens.json"),
      join(this.tokensDir, "tailwind.config.js"),
      join(this.tokensDir, "tailwind.config.cjs"),
      join(this.tokensDir, "design-tokens.json"),
      join(this.tokensDir, "theme.json"),
    ];

    for (const filePath of possibleFiles) {
      if (existsSync(filePath)) {
        logger.debug(`Reading legacy tokens from: ${filePath}`);
        return await this.readTokensFromFile(filePath);
      }
    }

    throw new Error(`No token files found in ${this.tokensDir}. Expected: tokens.json, tailwind.config.js, etc.`);
  }

  /**
   * Read tokens from a specific file
   */
  private async readTokensFromFile(filePath: string): Promise<TokenStructure> {
    try {
      if (filePath.endsWith(".json")) {
        const content = readFileSync(filePath, "utf8");
        return JSON.parse(content);
      } else if (filePath.endsWith(".js") || filePath.endsWith(".cjs")) {
        // For JavaScript config files, we need to evaluate them
        // This is a simplified approach - in production, consider using a safer eval method
        const content = readFileSync(filePath, "utf8");
        
        // Try to extract the theme object from Tailwind config
        if (content.includes("theme:")) {
          const themeMatch = content.match(/theme:\s*{([^}]+(?:{[^}]*}[^}]*)*?)}/s);
          if (themeMatch) {
            const themeContent = themeMatch[1];
            const extendMatch = themeContent.match(/extend:\s*{([^}]+(?:{[^}]*}[^}]*)*?)}/s);
            if (extendMatch) {
              // Parse the extend object (simplified parsing)
              return this.parseConfigObject(extendMatch[1]);
            }
          }
        }
        
        throw new Error(`Could not parse JavaScript config file: ${filePath}`);
      }
      
      throw new Error(`Unsupported file format: ${filePath}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to read tokens from ${filePath}: ${errorMessage}`);
    }
  }

  /**
   * Parse configuration object from JavaScript config (simplified)
   */
  private parseConfigObject(configContent: string): TokenStructure {
    // This is a simplified parser - in production, consider using a proper JS parser
    const tokens: TokenStructure = {};
    
    // Parse colors
    const colorsMatch = configContent.match(/colors:\s*{([^}]+(?:{[^}]*}[^}]*)*?)}/s);
    if (colorsMatch) {
      tokens.colors = this.parseObjectLiteral(colorsMatch[1]);
    }
    
    // Parse spacing
    const spacingMatch = configContent.match(/spacing:\s*{([^}]+)}/s);
    if (spacingMatch) {
      tokens.spacing = this.parseObjectLiteral(spacingMatch[1]);
    }
    
    // Parse other properties
    const otherProperties = ["borderRadius", "fontSize", "fontWeight", "lineHeight", "boxShadow", "opacity", "transitionDuration", "zIndex"];
    otherProperties.forEach(prop => {
      const regex = new RegExp(`${prop}:\\s*{([^}]+)}`, "s");
      const match = configContent.match(regex);
      if (match) {
        const key = this.mapConfigKeyToTokenKey(prop);
        tokens[key] = this.parseObjectLiteral(match[1]);
      }
    });
    
    return tokens;
  }

  /**
   * Parse a simple object literal string
   */
  private parseObjectLiteral(content: string): Record<string, any> {
    const result: Record<string, any> = {};
    
    // Simple regex to match key-value pairs
    const pairs = content.match(/['"']?([^'":\s]+)['"']?\s*:\s*['"']?([^'",\n]+)['"']?,?/g) || [];
    
    pairs.forEach(pair => {
      const match = pair.match(/['"']?([^'":\s]+)['"']?\s*:\s*['"']?([^'",\n]+)['"']?/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim().replace(/,$/, "");
        
        // Try to parse as number if it looks like one
        if (/^\d+(\.\d+)?$/.test(value)) {
          result[key] = parseFloat(value);
        } else {
          result[key] = value;
        }
      }
    });
    
    return result;
  }

  /**
   * Map Tailwind config keys to token keys
   */
  private mapConfigKeyToTokenKey(configKey: string): string {
    const mapping: Record<string, string> = {
      "borderRadius": "radius",
      "fontSize": "typography",
      "fontWeight": "typography",
      "lineHeight": "typography",
      "boxShadow": "elevation",
      "transitionDuration": "durations",
      "transitionTimingFunction": "easing",
    };
    
    return mapping[configKey] || configKey;
  }

  /**
   * Validate and structure token data
   */
  validateTokens(tokens: TokenStructure): TokenStructure {
    const validatedTokens: TokenStructure = {};
    
    // Validate colors (handle both "color" and "colors" for compatibility)
    const colorData = tokens.colors || tokens.color;
    if (colorData) {
      // Store as "color" to match the design.json parsing
      validatedTokens.color = {};
      Object.entries(colorData).forEach(([key, value]) => {
        if (typeof value === "string" || (typeof value === "object" && value !== null)) {
          validatedTokens.color![key] = value;
        } else {
          logger.warn(`Invalid color value for ${key}: ${value}`);
        }
      });
      logger.debug(`Validated ${Object.keys(validatedTokens.color).length} color tokens`);
    }
    
    // Validate spacing
    if (tokens.spacing) {
      validatedTokens.spacing = {};
      Object.entries(tokens.spacing).forEach(([key, value]) => {
        if (typeof value === "number" || (typeof value === "string" && /^\d+/.test(value))) {
          validatedTokens.spacing![key] = typeof value === "string" ? parseInt(value) : value;
        } else {
          logger.warn(`Invalid spacing value for ${key}: ${value}`);
        }
      });
    }
    
    // Validate other token types
    const otherTypes = ["radius", "elevation", "opacity", "durations", "zIndex", "easing"];
    otherTypes.forEach(type => {
      if (tokens[type]) {
        validatedTokens[type] = tokens[type];
      }
    });
    
    // Validate typography
    if (tokens.typography) {
      validatedTokens.typography = tokens.typography;
    }
    
    return validatedTokens;
  }
}

/**
 * Story Template Generator - Subtask 10.2
 * Generates Storybook story templates based on token data
 */
class StoryTemplateGenerator {
  private storyFormat: "csf" | "mdx";

  constructor(storyFormat: "csf" | "mdx" = "csf") {
    this.storyFormat = storyFormat;
  }

  /**
   * Generate color token stories
   */
  generateColorStories(colors: Record<string, string | Record<string, string>>): string {
    const colorEntries = this.flattenColors(colors);
    
    if (this.storyFormat === "csf") {
      return this.generateColorCSF(colorEntries);
    } else {
      return this.generateColorMDX(colorEntries);
    }
  }

  /**
   * Generate typography token stories
   */
  generateTypographyStories(typography: Record<string, Record<string, any>>): string {
    if (this.storyFormat === "csf") {
      return this.generateTypographyCSF(typography);
    } else {
      return this.generateTypographyMDX(typography);
    }
  }

  /**
   * Generate spacing token stories
   */
  generateSpacingStories(spacing: Record<string, number>): string {
    if (this.storyFormat === "csf") {
      return this.generateSpacingCSF(spacing);
    } else {
      return this.generateSpacingMDX(spacing);
    }
  }

  /**
   * Flatten nested color objects
   */
  private flattenColors(colors: Record<string, string | Record<string, string>>): Record<string, string> {
    const flattened: Record<string, string> = {};
    
    Object.entries(colors).forEach(([key, value]) => {
      if (typeof value === "string") {
        flattened[key] = value;
      } else if (typeof value === "object" && value !== null) {
        Object.entries(value).forEach(([subKey, subValue]) => {
          flattened[`${key}-${subKey}`] = subValue;
        });
      }
    });
    
    return flattened;
  }

  /**
   * Generate CSF format for colors
   */
  private generateColorCSF(colors: Record<string, string>): string {
    const colorSwatches = Object.entries(colors).map(([name, value]) => {
      return `  {
    name: "${name}",
    value: "${value}",
  }`;
    }).join(",\n");

    return `import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

const ColorSwatch = ({ name, value }: { name: string; value: string }) => (
  <div style={{ margin: '8px', display: 'inline-block', textAlign: 'center' }}>
    <div
      style={{
        width: '80px',
        height: '80px',
        backgroundColor: value,
        border: '1px solid #ccc',
        borderRadius: '4px',
        marginBottom: '8px',
      }}
    />
    <div style={{ fontSize: '12px', fontWeight: 'bold' }}>{name}</div>
    <div style={{ fontSize: '10px', color: '#666' }}>{value}</div>
  </div>
);

const ColorPalette = ({ colors }: { colors: Array<{ name: string; value: string }> }) => (
  <div style={{ padding: '20px' }}>
    <h2>Color Tokens</h2>
    <div style={{ display: 'flex', flexWrap: 'wrap' }}>
      {colors.map((color) => (
        <ColorSwatch key={color.name} name={color.name} value={color.value} />
      ))}
    </div>
  </div>
);

const meta: Meta<typeof ColorPalette> = {
  title: 'Design Tokens/Colors',
  component: ColorPalette,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof ColorPalette>;

export const Colors: Story = {
  args: {
    colors: [
${colorSwatches}
    ],
  },
};
`;
  }

  /**
   * Generate CSF format for typography
   */
  private generateTypographyCSF(typography: Record<string, Record<string, any>>): string {
    const typographyEntries = Object.entries(typography).map(([category, values]) => {
      return Object.entries(values).map(([key, value]) => {
        return `      { category: "${category}", name: "${key}", value: "${value}" }`;
      });
    }).flat().join(",\n");

    return `import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

const TypographyExample = ({ category, name, value }: { category: string; name: string; value: string }) => {
  const getStyle = () => {
    switch (category) {
      case 'sizes':
        return { fontSize: typeof value === 'number' ? \`\${value}px\` : value };
      case 'weights':
        return { fontWeight: value };
      case 'lineHeights':
        return { lineHeight: typeof value === 'number' ? \`\${value}px\` : value };
      default:
        return {};
    }
  };

  return (
    <div style={{ margin: '16px 0', padding: '16px', border: '1px solid #eee', borderRadius: '4px' }}>
      <div style={getStyle()}>
        The quick brown fox jumps over the lazy dog
      </div>
      <div style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
        {category}.{name}: {value}
      </div>
    </div>
  );
};

const TypographyShowcase = ({ typography }: { typography: Array<{ category: string; name: string; value: string }> }) => (
  <div style={{ padding: '20px' }}>
    <h2>Typography Tokens</h2>
    {typography.map((typo, index) => (
      <TypographyExample key={index} category={typo.category} name={typo.name} value={typo.value} />
    ))}
  </div>
);

const meta: Meta<typeof TypographyShowcase> = {
  title: 'Design Tokens/Typography',
  component: TypographyShowcase,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof TypographyShowcase>;

export const Typography: Story = {
  args: {
    typography: [
${typographyEntries}
    ],
  },
};
`;
  }

  /**
   * Generate CSF format for spacing
   */
  private generateSpacingCSF(spacing: Record<string, number>): string {
    const spacingEntries = Object.entries(spacing).map(([name, value]) => {
      return `  {
    name: "${name}",
    value: ${value},
  }`;
    }).join(",\n");

    return `import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

const SpacingExample = ({ name, value }: { name: string; value: number }) => (
  <div style={{ margin: '8px 0', padding: '8px' }}>
    <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>
      {name}: {value}px
    </div>
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <div
        style={{
          width: \`\${value}px\`,
          height: '20px',
          backgroundColor: '#3b82f6',
          marginRight: '8px',
        }}
      />
      <div style={{ fontSize: '12px', color: '#666' }}>
        {value}px
      </div>
    </div>
  </div>
);

const SpacingShowcase = ({ spacing }: { spacing: Array<{ name: string; value: number }> }) => (
  <div style={{ padding: '20px' }}>
    <h2>Spacing Tokens</h2>
    {spacing.map((space) => (
      <SpacingExample key={space.name} name={space.name} value={space.value} />
    ))}
  </div>
);

const meta: Meta<typeof SpacingShowcase> = {
  title: 'Design Tokens/Spacing',
  component: SpacingShowcase,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof SpacingShowcase>;

export const Spacing: Story = {
  args: {
    spacing: [
${spacingEntries}
    ],
  },
};
`;
  }

  /**
   * Generate MDX format for colors
   */
  private generateColorMDX(colors: Record<string, string>): string {
    const colorSwatches = Object.entries(colors).map(([name, value]) => {
      return `<ColorSwatch name="${name}" value="${value}" />`;
    }).join("\n");

    return `import { Meta, Story, Canvas } from '@storybook/addon-docs';

<Meta title="Design Tokens/Colors" />

# Color Tokens

This page showcases all the color tokens available in the design system.

export const ColorSwatch = ({ name, value }) => (
  <div style={{ margin: '8px', display: 'inline-block', textAlign: 'center' }}>
    <div
      style={{
        width: '80px',
        height: '80px',
        backgroundColor: value,
        border: '1px solid #ccc',
        borderRadius: '4px',
        marginBottom: '8px',
      }}
    />
    <div style={{ fontSize: '12px', fontWeight: 'bold' }}>{name}</div>
    <div style={{ fontSize: '10px', color: '#666' }}>{value}</div>
  </div>
);

<Canvas>
  <Story name="All Colors">
    <div style={{ display: 'flex', flexWrap: 'wrap' }}>
      ${colorSwatches}
    </div>
  </Story>
</Canvas>
`;
  }

  /**
   * Generate MDX format for typography
   */
  private generateTypographyMDX(typography: Record<string, Record<string, any>>): string {
    const { sizes, weights, lineHeights } = typography;
    
    const sizeExamples = sizes ? Object.entries(sizes).map(([name, size]) => 
      `<div style={{ fontSize: '${size}px', marginBottom: '8px' }}>{name}: ${size}px - The quick brown fox jumps over the lazy dog</div>`
    ).join('\n      ') : '';
    
    const weightExamples = weights ? Object.entries(weights).map(([name, weight]) => 
      `<div style={{ fontWeight: '${weight}', marginBottom: '8px' }}>{name}: ${weight} - The quick brown fox jumps over the lazy dog</div>`
    ).join('\n      ') : '';

    return `import { Meta, Story, Canvas } from '@storybook/addon-docs';

<Meta title="Design Tokens/Typography" />

# Typography Tokens

This page showcases all the typography tokens available in the design system.

## Font Sizes

<Canvas>
  <Story name="Font Sizes">
    <div>
      ${sizeExamples}
    </div>
  </Story>
</Canvas>

## Font Weights

<Canvas>
  <Story name="Font Weights">
    <div>
      ${weightExamples}
    </div>
  </Story>
</Canvas>
`;
  }

  /**
   * Generate MDX format for spacing
   */
  private generateSpacingMDX(spacing: Record<string, number>): string {
    const spacingExamples = Object.entries(spacing).map(([name, value]) => {
      return `<div style={{ marginBottom: '16px' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{name}: ${value}px</div>
        <div style={{ 
          width: '${value}px', 
          height: '20px', 
          backgroundColor: '#3B82F6', 
          borderRadius: '2px' 
        }}></div>
      </div>`;
    }).join('\n      ');

    return `import { Meta, Story, Canvas } from '@storybook/addon-docs';

<Meta title="Design Tokens/Spacing" />

# Spacing Tokens

This page showcases all the spacing tokens available in the design system.

<Canvas>
  <Story name="Spacing">
    <div>
      ${spacingExamples}
    </div>
  </Story>
</Canvas>
`;
  }
}

/**
 * Main createTokenStories tool handler
 */
export const createTokenStoriesTool: Tool = {
  definition: {
    name: "createTokenStories",
    description: "Generate Storybook stories that visualize design tokens for colors, typography, and spacing",
    inputSchema: zodToJsonSchema(inputSchema),
  },

  async handler(input) {
    logger.debug(`Handler called with input: ${JSON.stringify(input, null, 2)}`);
    
    // Handle dummy parameter case (when called via MCP with random_string)
    const processedInput = typeof input === 'object' && 'random_string' in input ? {} : input;
    logger.debug(`Processed input: ${JSON.stringify(processedInput, null, 2)}`);
    
    // Parse and validate input with defaults
    const validatedInput = inputSchema.parse(processedInput || {});
    logger.debug(`Validated input: ${JSON.stringify(validatedInput, null, 2)}`);
    
    // Extract parameters with proper defaults
    const projectPath = validatedInput.projectPath || ".";
    const designFile = validatedInput.designFile;
    const tokensDir = validatedInput.tokensDir;
    const storybookDir = validatedInput.storybookDir || ".supercomponents/.storybook";
    const outputDir = validatedInput.outputDir || "stories/tokens";
    const includeTypes = validatedInput.includeTypes || ["colors", "color", "typography", "spacing"];
    const storyFormat = validatedInput.storyFormat || "csf";

    try {
      logger.info(`Creating token stories from project: ${projectPath}...`);
      
      // Log search strategy
      if (designFile) {
        logger.info(`Using explicit design file: ${designFile}`);
      } else {
        logger.info(`Auto-discovering design files in: ${projectPath}`);
      }

      // Step 1: Read token data with enhanced discovery
      const tokenReader = new TokenDataReader(projectPath, designFile, tokensDir);
      const rawTokens = await tokenReader.readTokens();
      
      // Debug: Log raw token structure
      logger.info(`Raw tokens keys: ${Object.keys(rawTokens).join(', ')}`);
      if (rawTokens.color) {
        logger.info(`Raw color tokens found: ${Object.keys(rawTokens.color).length} tokens`);
        logger.info(`First few color tokens: ${Object.keys(rawTokens.color).slice(0, 5).join(', ')}`);
      } else {
        logger.info(`No color tokens found in raw structure`);
      }
      
      const tokens = tokenReader.validateTokens(rawTokens);
      
      // Debug: Log processed token structure  
      logger.info(`Processed tokens keys: ${Object.keys(tokens).join(', ')}`);
      if (tokens.color) {
        logger.info(`Validated color tokens found: ${Object.keys(tokens.color).length} tokens`);
      } else {
        logger.info(`No color tokens found in validated structure`);
      }

      // Step 2: Initialize story template generator
      const storyGenerator = new StoryTemplateGenerator(storyFormat);

      // Step 3: Ensure output directory exists
      const fullOutputDir = join(storybookDir, outputDir);
      if (!existsSync(fullOutputDir)) {
        mkdirSync(fullOutputDir, { recursive: true });
      }

      // Step 4: Generate stories based on requested types
      const generatedStories: string[] = [];

      // Handle both "colors" and "color" for backward compatibility
      if ((includeTypes.includes("colors") || includeTypes.includes("color")) && (tokens.colors || tokens.color)) {
        const colorData = tokens.colors || tokens.color;
        const colorStory = storyGenerator.generateColorStories(colorData);
        const colorFilePath = join(fullOutputDir, `colors.stories.${storyFormat === "csf" ? "tsx" : "mdx"}`);
        writeFileSync(colorFilePath, colorStory);
        generatedStories.push(colorFilePath);
        logger.info(`Generated color stories: ${colorFilePath}`);
      }

      if (includeTypes.includes("typography") && tokens.typography) {
        const typographyStory = storyGenerator.generateTypographyStories(tokens.typography);
        const typographyFilePath = join(fullOutputDir, `typography.stories.${storyFormat === "csf" ? "tsx" : "mdx"}`);
        writeFileSync(typographyFilePath, typographyStory);
        generatedStories.push(typographyFilePath);
        logger.info(`Generated typography stories: ${typographyFilePath}`);
      }

      if (includeTypes.includes("spacing") && tokens.spacing) {
        const spacingStory = storyGenerator.generateSpacingStories(tokens.spacing);
        const spacingFilePath = join(fullOutputDir, `spacing.stories.${storyFormat === "csf" ? "tsx" : "mdx"}`);
        writeFileSync(spacingFilePath, spacingStory);
        generatedStories.push(spacingFilePath);
        logger.info(`Generated spacing stories: ${spacingFilePath}`);
      }

      // Step 5: Return success response
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            success: true,
            generatedStories,
            tokensFound: Object.keys(tokens),
            message: `Successfully generated ${generatedStories.length} token stories`,
            timestamp: new Date().toISOString(),
            cacheVersion: "v2.0-FIXED", // Cache buster
            debugInfo: {
              hasColorTokens: !!(tokens.colors || tokens.color),
              colorTokenCount: tokens.colors ? Object.keys(tokens.colors).length : (tokens.color ? Object.keys(tokens.color).length : 0),
              totalTokenTypes: Object.keys(tokens).length,
              rawTokenKeys: Object.keys(rawTokens).join(', '),
              rawColorTokens: rawTokens.color ? Object.keys(rawTokens.color).length : 0,
              validatedColorTokens: tokens.color ? Object.keys(tokens.color).length : 0
            }
          }, null, 2)
        }],
        isError: false
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`Failed to create token stories: ${errorMessage}`);
      
      // Provide helpful error response with context
      const response = {
        success: false,
        error: errorMessage,
        message: "Failed to create token stories",
        context: {
          projectPath,
          designFile: designFile || 'auto-discovery',
          tokensDir: tokensDir || 'not specified',
          searchPaths: [
            designFile ? resolve(projectPath, designFile) : null,
            join(projectPath, '.supercomponents', 'design.json'),
            join(projectPath, 'supercomponents', 'design.json'),
            tokensDir ? join(tokensDir, 'tokens.json') : null,
          ].filter(Boolean)
        },
        troubleshooting: [
          "Ensure design.json exists in .supercomponents/ directory",
          "Check file permissions and accessibility",
          "Verify JSON format is valid in design files",
          "Consider using explicit designFile parameter for debugging"
        ]
      };
      
      return {
        content: [{
          type: "text",
          text: JSON.stringify(response, null, 2)
        }],
        isError: true
      };
    }
  }
}; 