# SuperComponents Server

MCP server for AI-powered component generation - analyze designs, generate components, and create implementation instructions.

## Overview

SuperComponents Server is an MCP (Model Context Protocol) server that provides AI-powered component generation capabilities. It enables developers to parse design inputs, analyze component libraries, and generate implementation instructions through a standardized protocol interface.

## Installation

### Install the Package

```bash
# Install in your project
npm install supercomponents-server

# Or install globally (requires additional setup)
npm install -g supercomponents-server
```

### Configure MCP Client

This package is an MCP server that needs to be configured in your MCP client (like Cursor, Claude Desktop, etc.).

#### For Cursor IDE

Add to your `.cursor/mcp.json` file:

```json
{
  "mcpServers": {
    "supercomponents-server": {
      "command": "node",
      "args": ["./node_modules/supercomponents-server/build/index.js"]
    }
  }
}
```

#### For Claude Desktop

Add to your MCP configuration:

```json
{
  "mcpServers": {
    "supercomponents-server": {
      "command": "node",
      "args": ["path/to/node_modules/supercomponents-server/build/index.js"]
    }
  }
}
```

#### Alternative: Using npx

You can also use npx to run the server:

```json
{
  "mcpServers": {
    "supercomponents-server": {
      "command": "npx",
      "args": ["supercomponents-server"]
    }
  }
}
```

## Usage

Once configured, the MCP server provides these tools to your AI assistant:

### Available MCP Tools

- **`parse.design`**: Convert design inputs into structured JSON representations
- **`analyze.components`**: Analyze existing component structures and patterns  
- **`generate.instruction`**: Generate detailed implementation instructions for component development

### Example Usage

The AI assistant can use these tools to:

```
# Parse a design file
parse.design({ input: "design-file.json" })

# Analyze component library
analyze.components({ library: "react-components" })

# Generate implementation instructions
generate.instruction({ component: "Button", requirements: "..." })
```

## Configuration

### Environment Variables

The server may require certain environment variables for AI model integration:

```bash
# Example - check specific AI provider requirements
OPENAI_API_KEY=your_api_key_here
```

### Project Structure

When using the server, ensure your project has the expected structure for component analysis:

```
your-project/
├── src/
│   ├── components/
│   ├── designs/
│   └── ...
├── package.json
└── ...
```

## Development

If you want to contribute to or modify the server:

### Setup

```bash
# Clone the repository
git clone https://github.com/SuperComponents/SuperComponents.git
cd SuperComponents

# Install dependencies
npm install

# Build the project
npm run build
```

### Development Commands

```bash
# Watch mode compilation
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Start the server
npm start
```

## Features

- **Design Parsing**: Convert design inputs into structured JSON representations
- **Component Analysis**: Analyze existing component structures and patterns
- **Instruction Generation**: Generate detailed implementation instructions for component development
- **MCP Protocol**: Standardized interface for AI assistant integration
- **TypeScript Support**: Full TypeScript support with type definitions

## Architecture

Built with:
- Node.js & TypeScript
- MCP (Model Context Protocol) SDK
- Zod for schema validation
- AI model integration for processing tasks

## Troubleshooting

### Common Issues

1. **MCP Server Not Found**: Ensure the package is installed and the path in your MCP configuration points to `node_modules/supercomponents-server/build/index.js`
2. **Permission Errors**: Ensure Node.js has permission to execute the server files
3. **Port Conflicts**: The server uses standard MCP protocol - ensure no conflicts with other MCP servers
4. **Module Not Found**: Run `npm install` to ensure all dependencies are installed

### Debug Mode

Enable debug logging by setting:

```bash
DEBUG=supercomponents-server node node_modules/supercomponents-server/build/index.js
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

- GitHub Issues: [Report bugs or request features](https://github.com/SuperComponents/SuperComponents/issues)
- Documentation: [Full documentation](https://github.com/SuperComponents/SuperComponents#readme) 
