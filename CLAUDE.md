# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

**Development:**
- `npm run dev` - Run TypeScript server with hot reloading (uses tsx watch mode)
- `npm run build` - Compile TypeScript to JavaScript in dist/
- `npm start` - Run compiled production server from dist/

**Code Quality:**
- `npm run lint` - Run ESLint on all TypeScript files
- `npm run typecheck` - Type check without emitting files
- `npm test` - Run Jest tests (no tests implemented yet)

## Architecture Overview

This is a Model Context Protocol (MCP) server that guides structured component library development through an opinionated workflow. The server returns prompts for development agents (like Claude or Cursor) rather than directly implementing components.

### Core Workflow Sequence
1. **Design Principles** → 2. **Token Extraction** → 3. **Style Showcase** → 4. **Library Planning** → 5. **Component Implementation**

### Key Architectural Patterns

**MCP Request Handling** (src/server.ts):
- Tools return: `{ content: [{ type: "text", text: "..." }], isError?: boolean }`
- Prompts return: `{ messages: [{ role: "user", content: { type: "text", text: "..." } }] }`
- All handlers follow the pattern: validate request → execute logic → return formatted response

**Tool Implementation Pattern** (src/tools/):
```typescript
export async function toolName(args: ToolArgs): Promise<ToolResponse> {
  try {
    // Validate inputs
    // Execute tool logic
    // Return formatted response
  } catch (error) {
    return { content: [{ type: "text", text: error.message }], isError: true };
  }
}
```

**Fixed Technology Stack** (enforced by init_project):
- React + TypeScript + Vite
- Storybook for component development
- Tailwind CSS v4 (using new @theme directive)
- ESLint + Prettier preconfigured

### Important Implementation Details

1. **Tailwind v4 Theme Format** (src/tools/extract-design-tokens.ts):
   - Uses CSS variables with `@theme` directive
   - Tokens structured as: `--color-*`, `--font-*`, `--spacing-*`, etc.

2. **Component Organization** (src/prompts/plan-component-library.ts):
   - Follows Atomic Design: atoms → molecules → organisms
   - Components planned based on extracted design principles

3. **No State Persistence**:
   - Each tool/prompt call is stateless
   - Design tokens and principles must be passed between calls

4. **Current Limitations**:
   - Token extraction returns mock data (POC stage)
   - No file watching or project monitoring
   - No integration tests implemented

### MCP Server Integration

To use with Claude Desktop, add to config after building:
```json
{
  "mcpServers": {
    "supercomp-design-system": {
      "command": "node",
      "args": ["/absolute/path/to/dist/index.js"]
    }
  }
}
```

### Key Files to Understand

- `src/server.ts` - Main request routing and handler registration
- `src/tools/init-project.ts` - Complex file generation logic for scaffolding
- `src/types/index.ts` - Core type definitions (DesignPrinciples, DesignTokens, ComponentSpec)
- @spec.md - High-level product specification
- `mcp_design.md` - Detailed workflow and tool descriptions