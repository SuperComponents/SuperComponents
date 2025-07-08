# Supercomp Design System MCP Server

A Model Context Protocol (MCP) server that assists in structured component library development. It provides tools and prompts to guide users through design system creation, from establishing design principles to generating component implementation prompts.

## Features

### Tools
- **`/init_project`** - Initialize a new design system project with React, Storybook, TypeScript, and Tailwind v4
- **`/extract_design_tokens`** - Extract design tokens from URLs, images, or text descriptions
- **`/generate_style_showcase`** - Generate HTML or React showcase pages displaying all design tokens

### Prompts
- **`/define_design_principles`** - Interactive guide to establish north-star design principles
- **`/plan_component_library`** - Analyze design principles and suggest component library structure
- **`/generate_component_implementation`** - Generate detailed implementation prompts for specific components

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

## Building

```bash
npm run build
```

## Usage with Claude Desktop

Add this configuration to your Claude Desktop config:

```json
{
  "mcpServers": {
    "supercomp-design-system": {
      "command": "node",
      "args": ["/path/to/supercomp-v1/dist/index.js"],
      "env": {}
    }
  }
}
```

## Example Workflow

1. **Initialize Project**
   ```
   Use tool: /init_project
   Input: { "projectName": "my-design-system", "projectPath": "/path/to/projects" }
   ```

2. **Define Design Principles**
   ```
   Use prompt: /define_design_principles
   ```

3. **Extract Design Tokens**
   ```
   Use tool: /extract_design_tokens
   Input: { "source": "https://example.com", "sourceType": "url" }
   ```

4. **Generate Style Showcase**
   ```
   Use tool: /generate_style_showcase
   Input: { "outputPath": "./showcase", "format": "html" }
   ```

5. **Plan Component Library**
   ```
   Use prompt: /plan_component_library
   ```

6. **Generate Component Implementation**
   ```
   Use prompt: /generate_component_implementation
   Input: { "componentName": "Button" }
   ```

## Architecture

```
src/
├── index.ts                 # Entry point
├── server.ts               # MCP server setup
├── tools/                  # Tool implementations
├── prompts/                # Prompt definitions
├── templates/              # Project templates
├── utils/                  # Utility functions
└── types/                  # TypeScript types
```

## License

MIT