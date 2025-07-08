# API Reference

## CLI Commands

### `inspiration-to-system`

Generate a complete design system from inspiration.

**Usage:**
```bash
npx inspiration-to-system [options]
```

**Options:**

#### Input Sources (required - choose one)
- `--image <url>` - Image URL for visual inspiration
- `--url <url>` - Website URL for design inspiration  
- `--description <text>` - Text description of desired design

#### Context Options (optional)
- `--brand <keywords>` - Brand keywords (comma-separated)
- `--industry <type>` - Industry type
- `--audience <description>` - Target audience description
- `--style <preferences>` - Style preferences (comma-separated)
- `--colors <preferences>` - Color preferences (hex codes or names)
- `--accessibility <level>` - Accessibility level (basic, enhanced, enterprise)
- `--output <path>` - Output directory (default: ./design-system)

## Generated File Structure

### `.supercomponents/metadata.json`
Contains generation metadata and configuration.

```json
{
  "version": "1.0.0",
  "generatedAt": "2024-01-01T00:00:00.000Z",
  "inspiration": {
    "imageUrl": "https://example.com/image.jpg",
    "brandKeywords": ["modern", "minimal"]
  },
  "tokens": {...},
  "principles": {...},
  "componentPlan": {...},
  "workflow": "inspiration-to-system"
}
```

### `design/PRINCIPLES.md`
Design principles document in Markdown format.

### `tokens/design-tokens.json`
W3C Design Tokens v1 format containing:
- Color tokens with semantic naming
- Typography tokens (fonts, sizes, weights)
- Spacing tokens
- Border radius tokens
- Shadow tokens

### `tokens/accessibility-report.md`
WCAG compliance report with contrast ratios and recommendations.

### `tailwind.config.ts`
Tailwind v4 configuration file generated from design tokens.

### Component Structure
Each component follows this structure:
```
src/components/ComponentName/
├── ComponentName.tsx           # React component
├── ComponentName.stories.tsx   # Storybook stories
└── ComponentName.test.tsx      # Vitest tests
```

## MCP Server Tools

### `analyze_inspiration`
Analyzes inspiration and returns design insights.

**Input:**
```json
{
  "imageUrl": "string",
  "websiteUrl": "string", 
  "description": "string",
  "brandKeywords": ["string"],
  "targetAudience": "string",
  "stylePreferences": ["string"]
}
```

**Output:**
```json
{
  "insights": {
    "imageryPalette": ["#hex"],
    "typographyFamilies": ["string"],
    "spacingScale": [4, 8, 12, 16],
    "uiDensity": "compact|regular|spacious",
    "brandKeywords": ["string"],
    "supportingReferences": ["string"]
  },
  "designRationale": "string"
}
```

### `generate_tokens`
Generates design tokens from insights.

### `generate_principles`
Creates design principles from insights and context.

### `generate_components`
Scaffolds component structure with tests and stories.

## TypeScript Interfaces

### `DesignInsight`
```typescript
interface DesignInsight {
  imageryPalette: string[];      // hex colors, length ≤ 8
  typographyFamilies: string[];  // font names
  spacingScale: number[];        // e.g. [4,8,12,16]
  uiDensity: "compact" | "regular" | "spacious";
  brandKeywords: string[];
  supportingReferences: string[]; // image crop URLs or CSS snippets
}
```

### `DesignTokens`
```typescript
interface DesignTokens {
  colors: Record<string, string>;
  typography: {
    fonts: string[];
    sizes: Record<string, string>;
    weights: Record<string, number>;
  };
  spacing: Record<string, string>;
  borderRadius: Record<string, string>;
  shadows: Record<string, string>;
}
```

### `DesignPrinciples`
```typescript
interface DesignPrinciples {
  coreValues: string[];
  brandIdentity: string;
  targetAudience: string;
  designApproach: string;
  accessibilityCommitment: string;
}
```

## Exit Codes

- `0` - Success
- `1` - General error
- `2` - Invalid input
- `3` - API error
- `4` - File system error
- `5` - Accessibility validation failed
