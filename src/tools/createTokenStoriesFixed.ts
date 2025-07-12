import { z } from "zod";
import { Tool } from "../types.js";
import { zodToJsonSchema } from "../utils/validation.js";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join, dirname, resolve } from "path";
import { getLogger } from "../utils/logger.js";

const logger = getLogger();

// Input schema - simplified for testing
const inputSchema = z.object({
  random_string: z.string().optional()
});

interface DesignToken {
  name: string;
  value: string | number | object;
  type: string;
  category?: string;
}

interface DesignFile {
  id?: string;
  tokens: DesignToken[];
  metadata?: Record<string, any>;
}

interface TokenStructure {
  [key: string]: any;
  spacing?: Record<string, number>;
  color?: Record<string, string | Record<string, string>>;
  colors?: Record<string, string | Record<string, string>>;
  typography?: Record<string, Record<string, any>>;
  radius?: Record<string, number>;
  elevation?: Record<string, any>;
  opacity?: Record<string, number>;
  durations?: Record<string, number>;
  zIndex?: Record<string, number>;
  easing?: Record<string, string>;
}

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

    logger.debug(`Parsed ${designData.tokens.length} tokens from design.json`);
    logger.debug(`Token types found: ${Object.keys(tokenStructure).join(', ')}`);
    
    return tokenStructure;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to parse design.json: ${errorMessage}`);
  }
}

function validateTokens(tokens: TokenStructure): TokenStructure {
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

function generateColorStory(colors: Record<string, string | Record<string, string>>): string {
  // Flatten nested color objects
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

  const colorSwatches = Object.entries(flattened).map(([name, value]) => {
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
    <h2>Color Tokens (Fixed Version)</h2>
    <div style={{ display: 'flex', flexWrap: 'wrap' }}>
      {colors.map((color) => (
        <ColorSwatch key={color.name} name={color.name} value={color.value} />
      ))}
    </div>
  </div>
);

const meta: Meta<typeof ColorPalette> = {
  title: 'Design System/Colors Fixed',
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

export const createTokenStoriesFixedTool: Tool = {
  definition: {
    name: "createTokenStoriesFixed",
    description: "FIXED VERSION: Generate Storybook stories that visualize design tokens for colors, typography, and spacing",
    inputSchema: zodToJsonSchema(inputSchema),
  },

  async handler(input) {
    try {
      logger.info('FIXED TOOL: Creating token stories...');
      
      // Step 1: Read design.json
      const designPath = join('.supercomponents', 'design.json');
      logger.info(`Reading from: ${designPath}`);
      
      const rawTokens = parseDesignJson(designPath);
      logger.info(`Raw tokens keys: ${Object.keys(rawTokens).join(', ')}`);
      
      if (rawTokens.color) {
        logger.info(`Raw color tokens found: ${Object.keys(rawTokens.color).length} tokens`);
      }
      
      const tokens = validateTokens(rawTokens);
      logger.info(`Validated tokens keys: ${Object.keys(tokens).join(', ')}`);
      
      if (tokens.color) {
        logger.info(`Validated color tokens found: ${Object.keys(tokens.color).length} tokens`);
      }

      // Step 2: Ensure output directory exists
      const fullOutputDir = join('.storybook', 'stories', 'tokens');
      if (!existsSync(fullOutputDir)) {
        mkdirSync(fullOutputDir, { recursive: true });
      }

      // Step 3: Generate stories
      const generatedStories: string[] = [];

      // Generate color story if color tokens exist
      if (tokens.color) {
        const colorStory = generateColorStory(tokens.color);
        const colorFilePath = join(fullOutputDir, 'colors-fixed.stories.tsx');
        writeFileSync(colorFilePath, colorStory);
        generatedStories.push(colorFilePath);
        logger.info(`Generated FIXED color stories: ${colorFilePath}`);
      }

      // Return success response
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            success: true,
            toolVersion: "FIXED-v1.0",
            generatedStories,
            tokensFound: Object.keys(tokens),
            message: `FIXED TOOL: Successfully generated ${generatedStories.length} token stories`,
            timestamp: new Date().toISOString(),
            debugInfo: {
              hasColorTokens: !!tokens.color,
              colorTokenCount: tokens.color ? Object.keys(tokens.color).length : 0,
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
      logger.error(`FIXED TOOL failed: ${errorMessage}`);
      
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            success: false,
            toolVersion: "FIXED-v1.0",
            error: errorMessage,
            message: "FIXED TOOL: Failed to create token stories"
          }, null, 2)
        }],
        isError: true
      };
    }
  }
}; 