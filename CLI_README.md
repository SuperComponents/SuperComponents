# Inspiration to System CLI

Transform any inspiration into a complete design system with a single command.

## Quick Start

```bash
# Install globally
npm install -g supercomp-mcp-server

# Generate from image
npx inspiration-to-system --image "https://example.com/image.jpg"

# Generate from website
npx inspiration-to-system --url "https://example.com"

# Generate from description
npx inspiration-to-system --description "Modern tech startup with clean design"
```

## Usage

```bash
npx inspiration-to-system [options]
```

## Options

### Input Sources (choose one)
- `--image <url>` - Image URL for visual inspiration
- `--url <url>` - Website URL for design inspiration  
- `--description <text>` - Text description of desired design

### Context (optional)
- `--brand <keywords>` - Brand keywords (comma-separated)
- `--industry <type>` - Industry type (e.g., tech, finance, creative)
- `--audience <description>` - Target audience description
- `--style <preferences>` - Style preferences (modern, classic, playful, professional, minimalist)
- `--colors <preferences>` - Color preferences (hex codes or names)
- `--accessibility <level>` - Accessibility level (basic, enhanced, enterprise)
- `--output <path>` - Output directory (default: ./design-system)

## Examples

### From Image Inspiration
```bash
npx inspiration-to-system \
  --image "https://dribbble.com/shots/example.jpg" \
  --brand "modern, minimal, tech" \
  --industry "technology" \
  --audience "developers and designers" \
  --style "modern,minimal" \
  --colors "#3b82f6,#10b981" \
  --accessibility "enhanced"
```

### From Website
```bash
npx inspiration-to-system \
  --url "https://stripe.com" \
  --brand "trustworthy, professional" \
  --industry "fintech" \
  --accessibility "enterprise"
```

### From Description
```bash
npx inspiration-to-system \
  --description "A playful design system for a children's educational app" \
  --brand "fun, educational, colorful" \
  --audience "children ages 5-12" \
  --style "playful" \
  --colors "bright,rainbow"
```

## Generated Output

The CLI generates a complete design system structure:

```
design-system/
├── .supercomponents/
│   └── metadata.json          # Generation metadata
├── src/
│   ├── components/            # Component directory
│   ├── tokens/
│   │   └── tokens.json       # Design tokens
│   └── styles/
│       └── tokens.css        # Tailwind CSS tokens
├── stories/                  # Storybook stories
├── package.json             # Project configuration
├── README.md               # Implementation guide
├── PRINCIPLES.md          # Design principles
└── COMPONENT_PLAN.md     # Component implementation plan
```

## Workflow

1. **AI Analysis** - Analyzes inspiration using GPT-4 Vision
2. **Token Extraction** - Generates design tokens (colors, typography, spacing)
3. **Principle Inference** - Creates design principles aligned with brand
4. **Component Planning** - Plans component library structure
5. **File Generation** - Creates complete project structure

## Integration with MCP Server

The generated design system integrates seamlessly with the SuperComponents MCP server:

```bash
# After generation, use MCP tools to implement components
mcp-client generate-component-prompt --component Button --tokens ./src/tokens/tokens.json
```

## Next Steps

After generation:

1. **Review** - Check the generated tokens and principles
2. **Install** - Run `npm install` in the output directory
3. **Develop** - Use MCP tools to implement components
4. **Showcase** - Run `npm run storybook` to view your design system

## Requirements

- Node.js 18+
- OpenAI API key (set in `OPENAI_API_KEY` environment variable)
- Internet connection for AI analysis

## Troubleshooting

### "LLM service not configured"
Set your OpenAI API key:
```bash
export OPENAI_API_KEY="sk-..."
```

### "No inspiration provided"
Provide at least one input source:
```bash
npx inspiration-to-system --image "https://example.com/image.jpg"
```

### "Failed to generate design system"
Check your internet connection and API key. Ensure the image URL is accessible.
