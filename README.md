# SuperComponents MCP Server

An AI-powered Model Context Protocol (MCP) server for generating design tokens and analyzing component structures. This tool can be installed in any repository to help developers create consistent design systems by automatically generating design tokens from text descriptions or images.

## Features

- **🎨 Design Token Generation**: Generate comprehensive design tokens from text descriptions or images
- **📊 Component Analysis**: Analyze existing component structures and patterns
- **🔍 Image Analysis**: Extract design tokens directly from design mockups and images
- **📖 Storybook Integration**: Generate Storybook stories for design tokens
- **🎯 AI-Powered**: Uses Claude 3.5 Sonnet and GPT-4o for intelligent design analysis
- **🔧 Easy Installation**: Can be added to any repository via npm or manual setup

## Quick Start

### 1. Install the Package
```bash
npm install supercomponents-mcp
```

### 2. Configure Cursor
Add to your `.cursor/mcp.json`:
```json
{
  "mcpServers": {
    "supercomponents": {
      "command": "npx",
      "args": ["supercomponents-mcp"],
      "env": {
        "ANTHROPIC_API_KEY": "your-anthropic-key",
        "OPENAI_API_KEY": "your-openai-key"
      }
    }
  }
}
```

### 3. Restart Cursor
The SuperComponents tools are now available!

## Environment Setup

You need at least one API key:

**Option 1: Anthropic (Recommended)**
```bash
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

**Option 2: OpenAI (Alternative)**
```bash
OPENAI_API_KEY=your_openai_api_key_here
```

**Option 3: Both (Anthropic will be preferred)**
```bash
ANTHROPIC_API_KEY=your_anthropic_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
```

## Available MCP Tools

Once installed, you'll have access to these tools in your AI assistant:

### 1. Initialize Project
```javascript
mcp_supercomponents_initializeProject({
  projectName: "My App",
  skipStorybook: false,
  skipTailwind: false
})
```

### 2. Generate Design Tokens
```javascript
// From text description
mcp_supercomponents_parseDesignAndGenerateTokens({
  input: "Create a modern dashboard with blue primary colors and card layout"
})

// From image
mcp_supercomponents_parseDesignAndGenerateTokens({
  input: {
    type: "image",
    data: "base64-encoded-image-data",
    mimeType: "image/jpeg"
  }
})
```

### 3. Create Token Stories
```javascript
mcp_supercomponents_createTokenStories({
  random_string: "dummy"
})
```

### 4. Analyze Components
```javascript
mcp_supercomponents_analyze_components({
  random_string: "dummy"
})
```

## Usage Examples

### Basic Text Description
```
AI: I'll generate design tokens from your description.
Human: Create a modern e-commerce site with green accent colors
```

### Image Analysis
```
AI: I can analyze your design image to extract tokens.
Human: [Upload image of design mockup]
```

### Project Setup
```
AI: I'll initialize the SuperComponents project structure.
Human: Set up SuperComponents for my React app
```

## Development

If you want to contribute or modify the MCP server:

### Install Dependencies
```bash
npm install
```

### Build
```bash
npm run build
```

### Run Development Server
```bash
npm run dev
```

### Test
```bash
npm test
```

## Architecture

Built with:
- **Node.js & TypeScript**: Core runtime and type safety
- **MCP SDK**: Model Context Protocol for AI assistant integration
- **Zod**: Schema validation and type safety
- **Claude 3.5 Sonnet**: Primary AI model for design analysis
- **GPT-4o**: Fallback AI model with vision capabilities

## File Structure

```
src/
├── llm/           # AI model integrations
├── schemas/       # Zod schemas for validation
├── server/        # MCP server initialization
├── tools/         # MCP tool implementations
├── utils/         # Utility functions
├── config/        # Configuration
├── types.ts       # Type definitions
└── server.ts      # Main MCP server
```

## Documentation

- [Installation Guide](./INSTALLATION_GUIDE.md) - Complete setup instructions
- [MCP Usage Guide](./MCP_USAGE_GUIDE.md) - Detailed usage examples
- [API Keys & Models](./API_KEYS_AND_MODELS.md) - Model configuration and costs
- [Schema Documentation](./docs/schemas.md) - Data structure references

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For issues and questions:
- Create an issue in this repository
- Check the [troubleshooting section](./INSTALLATION_GUIDE.md#troubleshooting) in the installation guide
- Review the [MCP Usage Guide](./MCP_USAGE_GUIDE.md) for examples 
