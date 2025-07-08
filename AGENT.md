# AGENT.md - SuperComponents MCP Server

## Commands
- `npm run dev` - Run TypeScript server with hot reloading
- `npm run build` - Compile TypeScript to JavaScript in dist/
- `npm start` - Run compiled production server from dist/
- `npm run lint` - Run ESLint on all TypeScript files
- `npm run typecheck` - Type check without emitting files
- `npm test` - Run Jest tests (no tests implemented yet)

## Architecture
MCP server that guides structured component library development through opinionated workflow. Returns prompts for development agents rather than directly implementing components.

**Core Workflow:** Design Principles → Token Extraction → Style Showcase → Library Planning → Component Implementation

**Key Files:**
- `src/server.ts` - Main request routing and handler registration
- `src/tools/` - Tool implementations (init-project, extract-design-tokens, generate-component-prompt, etc.)
- `src/types/index.ts` - Core types (DesignPrinciples, DesignTokens, ComponentSpec)
- `spec.md` - High-level product specification

## Code Style
- TypeScript strict mode with Zod validation
- Tool pattern: `async function toolName(args): Promise<ToolResponse>`
- Error handling: Return `{ content: [{ type: "text", text: error.message }], isError: true }`
- MCP responses: Tools return `{ content: [...] }`, Prompts return `{ messages: [...] }`
- No state persistence - each call is stateless
- Fixed tech stack: React + TypeScript + Vite + Storybook + Tailwind v4
