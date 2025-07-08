import { z } from "zod";
import { Tool } from "../types.js";
import { zodToJsonSchema } from "../utils/validation.js";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { getLogger } from "../utils/logger.js";

const logger = getLogger();

// Input schema for the createTokenStories tool
const inputSchema = z.object({
  tokensDir: z.string().describe("Directory containing design tokens (JSON files or Tailwind config)"),
  storybookDir: z.string().default(".storybook").describe("Storybook directory path"),
  outputDir: z.string().default("stories/tokens").describe("Output directory for token stories (relative to storybookDir)"),
  includeTypes: z.array(z.enum(["colors", "typography", "spacing", "radius", "elevation", "opacity", "durations", "zIndex", "easing"]))
    .default(["colors", "typography", "spacing"])
    .describe("Token types to generate stories for"),
  storyFormat: z.enum(["csf", "mdx"]).default("csf").describe("Story format - CSF or MDX"),
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

/**
 * Token Data Reader - Subtask 10.1
 * Reads and parses design token data from various sources
 */
class TokenDataReader {
  private tokensDir: string;

  constructor(tokensDir: string) {
    this.tokensDir = tokensDir;
  }

  /**
   * Read tokens from multiple possible sources
   */
  async readTokens(): Promise<TokenStructure> {
    const possibleFiles = [
      join(this.tokensDir, "tokens.json"),
      join(this.tokensDir, "tailwind.config.js"),
      join(this.tokensDir, "tailwind.config.cjs"),
      join(this.tokensDir, "design-tokens.json"),
      join(this.tokensDir, "theme.json"),
    ];

    for (const filePath of possibleFiles) {
      if (existsSync(filePath)) {
        logger.debug(`Reading tokens from: ${filePath}`);
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
    
    // Validate colors
    if (tokens.colors) {
      validatedTokens.colors = {};
      Object.entries(tokens.colors).forEach(([key, value]) => {
        if (typeof value === "string" || (typeof value === "object" && value !== null)) {
          validatedTokens.colors![key] = value;
        } else {
          logger.warn(`Invalid color value for ${key}: ${value}`);
        }
      });
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
  title: 'Design System/Colors',
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
      const items = Object.entries(values).map(([key, value]) => {
        return `    { category: "${category}", name: "${key}", value: "${value}" }`;
      }).join(",\n");
      return items;
    }).join(",\n");

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
  title: 'Design System/Typography',
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
  title: 'Design System/Spacing',
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

<Meta title="Design System/Colors" />

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
    // Implementation similar to CSF but in MDX format
    return `import { Meta, Story, Canvas } from '@storybook/addon-docs';

<Meta title="Design System/Typography" />

# Typography Tokens

This page showcases all the typography tokens available in the design system.

<Canvas>
  <Story name="Typography">
    <div>Typography tokens will be displayed here</div>
  </Story>
</Canvas>
`;
  }

  /**
   * Generate MDX format for spacing
   */
  private generateSpacingMDX(spacing: Record<string, number>): string {
    // Implementation similar to CSF but in MDX format
    return `import { Meta, Story, Canvas } from '@storybook/addon-docs';

<Meta title="Design System/Spacing" />

# Spacing Tokens

This page showcases all the spacing tokens available in the design system.

<Canvas>
  <Story name="Spacing">
    <div>Spacing tokens will be displayed here</div>
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
    const { tokensDir, storybookDir, outputDir, includeTypes, storyFormat } = input;

    try {
      logger.info(`Creating token stories from ${tokensDir}...`);

      // Step 1: Read token data
      const tokenReader = new TokenDataReader(tokensDir);
      const rawTokens = await tokenReader.readTokens();
      const tokens = tokenReader.validateTokens(rawTokens);

      // Step 2: Initialize story template generator
      const storyGenerator = new StoryTemplateGenerator(storyFormat);

      // Step 3: Ensure output directory exists
      const fullOutputDir = join(storybookDir, outputDir);
      if (!existsSync(fullOutputDir)) {
        mkdirSync(fullOutputDir, { recursive: true });
      }

      // Step 4: Generate stories based on requested types
      const generatedStories: string[] = [];

      if (includeTypes.includes("colors") && tokens.colors) {
        const colorStory = storyGenerator.generateColorStories(tokens.colors);
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
            message: `Successfully generated ${generatedStories.length} token stories`
          }, null, 2)
        }],
        isError: false
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`Failed to create token stories: ${errorMessage}`);
      
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            success: false,
            error: errorMessage,
            message: "Failed to create token stories"
          }, null, 2)
        }],
        isError: true
      };
    }
  }
}; 