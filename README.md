# SuperComponents Server

MCP server for SuperComponents project - AI-powered component generation capabilities.

## Overview

SuperComponents Server is an MCP (Model Context Protocol) server that provides AI-powered component generation capabilities. It enables developers to parse design inputs, analyze component libraries, and generate implementation instructions through a standardized protocol interface.

## Installation

```bash
npm install
```

## Environment Variables

Create a `.env` file in the root directory with **either** OpenAI or Anthropic API key:

```env
# Option 1: Use OpenAI (GPT models)
OPENAI_API_KEY=your_openai_api_key_here

# Option 2: Use Anthropic (Claude models) - Preferred
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Option 3: Use both (Anthropic will be preferred)
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

**Provider Selection:**
- If both keys are provided, **Anthropic (Claude) will be used** by default
- If only one key is provided, that provider will be used
- If no keys are provided, the system will throw an error

## Usage

```bash
npm start
```

### LLM Integration Examples

```typescript
import { complete, streamComplete, getCurrentProvider } from './src/llm/index';

// Check current provider
const provider = getCurrentProvider();
console.log(`Using: ${provider.name}`);

// Basic completion
const response = await complete('Explain design systems');

// Streaming completion
for await (const chunk of streamComplete('Generate component code')) {
  console.log(chunk);
}
```

## Development

```bash
npm run dev
```

## Testing

```bash
npm test
```

## Features

- **Design Parsing**: Convert design inputs into structured JSON representations
- **Component Analysis**: Analyze existing component structures and patterns
- **Instruction Generation**: Generate detailed implementation instructions for component development

## Architecture

Built with:
- Node.js & TypeScript
- MCP (Model Context Protocol) SDK
- Zod for schema validation
- AI model integration for processing tasks 
