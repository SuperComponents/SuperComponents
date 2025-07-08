# SuperComponents MCP Server - Testing Guide

This guide will walk you through setting up and testing the SuperComponents MCP server with all implemented tools.

## 🚀 Quick Setup

### 1. Prerequisites

- Node.js 18+ 
- npm or yarn
- Your API keys for OpenAI and/or Anthropic
- Cursor IDE (for MCP integration) or any MCP-compatible client

### 2. Environment Setup

Create a `.env` file in the project root:

```bash
# Required for LLM functionality
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Optional - defaults are usually fine
NODE_ENV=development
LOG_LEVEL=info
```

### 3. Build and Start the Server

```bash
# Install dependencies
npm install

# Build the TypeScript code
npm run build

# Start the server
npm start
```

The server should start and display:
```
🚀 SuperComponents MCP Server starting
🔧 Registered tool: parseDesignAndGenerateTokens (1/4)
🔧 Registered tool: initializeProject (2/4)
🔧 Registered tool: createTokenStories (3/4)
🔧 Registered tool: analyzeComponents (4/4)
✅ Server ready on transport: stdio
```

## 🔧 MCP Integration Setup

### For Cursor IDE

1. Update your `.cursor/mcp.json` file:

```json
{
  "mcpServers": {
    "supercomponents": {
      "command": "node",
      "args": ["build/server.js"],
      "cwd": ".",
      "env": {
        "NODE_ENV": "production",
        "OPENAI_API_KEY": "your-openai-api-key-here",
        "ANTHROPIC_API_KEY": "your-anthropic-api-key-here"
      }
    }
  }
}
```

2. Restart Cursor to load the MCP server
3. The tools should appear in your MCP tools panel

### For Other MCP Clients

Use the following connection details:
- **Transport**: stdio
- **Command**: `node build/server.js`
- **Working Directory**: Project root
- **Environment Variables**: API keys as shown above

## 🧪 Testing Each Tool

### Tool 1: analyzeComponents

**Purpose**: Analyze React/Vue components to understand their structure, props, and patterns.

**Test with sample components**:

```bash
# The tool can analyze the sample components we created
# Use the tool with these parameters:
{
  "paths": ["./test-samples"],
  "maxFiles": 10,
  "extensions": [".tsx", ".jsx"],
  "analyzePatterns": true
}
```

**Expected Output**: 
- Component analysis with props, structure, and naming patterns
- Detailed breakdown of each component's functionality
- Pattern analysis and recommendations

**Sample Test in Cursor**:
> "Use the analyzeComponents tool to analyze the Button and Card components in the test-samples directory"

### Tool 2: parseDesignAndGenerateTokens

**Purpose**: Parse design descriptions and generate complete design token systems with Tailwind configs.

**Test with sample design**:

```bash
# Use the sample design file we created
{
  "designInput": "<content of test-samples/sample-design.md>",
  "outputDir": "./generated-tokens",
  "generateTailwind": true,
  "generateCSS": true
}
```

**Expected Output**:
- Structured design JSON following DesignSchema
- Complete Tailwind config file
- CSS variables file
- Token analysis and recommendations

**Sample Test in Cursor**:
> "Use the parseDesignAndGenerateTokens tool to process the design system in test-samples/sample-design.md and generate tokens"

### Tool 3: initializeProject

**Purpose**: Set up a complete Storybook + Tailwind CSS project structure.

**Test in a new directory**:

```bash
# Create a test project directory
mkdir test-project
cd test-project

# Use the tool to initialize
{
  "projectName": "Test Design System",
  "outputDir": "./",
  "includeStorybook": true,
  "includeTailwind": true,
  "templateType": "design-system"
}
```

**Expected Output**:
- Complete Storybook configuration
- Tailwind CSS setup with custom design tokens
- Directory structure for components
- Sample Button component and story
- Package.json with all dependencies

**Sample Test in Cursor**:
> "Use the initializeProject tool to set up a new design system project called 'Test System'"

### Tool 4: createTokenStories

**Purpose**: Generate Storybook stories that visualize design tokens.

**Test after running tools 2 and 3**:

```bash
# Use tokens generated from tool 2
{
  "tokensDir": "./generated-tokens",
  "storybookDir": "./.storybook",
  "outputDir": "stories/tokens",
  "includeTypes": ["colors", "typography", "spacing"],
  "storyFormat": "csf"
}
```

**Expected Output**:
- colors.stories.tsx with interactive color swatches
- typography.stories.tsx with font examples
- spacing.stories.tsx with spacing demonstrations
- Properly formatted Storybook CSF files

**Sample Test in Cursor**:
> "Use the createTokenStories tool to generate Storybook stories from the tokens in generated-tokens directory"

## 🔄 Complete Workflow Test

### End-to-End Design System Creation

Test the complete workflow by running all tools in sequence:

1. **Analyze existing components** (if any):
   ```
   analyzeComponents on ./src/components
   ```

2. **Parse design and generate tokens**:
   ```
   parseDesignAndGenerateTokens with sample-design.md
   ```

3. **Initialize project structure**:
   ```
   initializeProject in new directory
   ```

4. **Create token visualization stories**:
   ```
   createTokenStories using generated tokens
   ```

5. **Verify the output**:
   - Check generated Tailwind config
   - Run Storybook: `npm run storybook`
   - View token stories in Storybook UI
   - Verify component examples work

## 🐛 Troubleshooting

### Common Issues

1. **Server won't start**:
   - Check Node.js version (18+ required)
   - Verify build completed: `npm run build`
   - Check for TypeScript errors: `npm run typecheck`

2. **API key errors**:
   - Verify API keys in `.env` file
   - Check MCP configuration has correct env vars
   - Test API keys independently

3. **Tool not found**:
   - Check server logs for tool registration
   - Verify MCP client connection
   - Restart MCP client/server

4. **Permission errors**:
   - Check file/directory permissions
   - Verify output directories exist
   - Check Node.js file system access

### Debug Mode

Enable detailed logging:

```bash
LOG_LEVEL=debug npm start
```

This will show:
- Tool registration details
- Input/output for each tool call
- Error stack traces
- Performance metrics

## 📊 Expected Performance

- **analyzeComponents**: ~2-5 seconds for 10 components
- **parseDesignAndGenerateTokens**: ~10-30 seconds (depends on LLM)
- **initializeProject**: ~5-10 seconds (file I/O heavy)
- **createTokenStories**: ~3-8 seconds

## ✅ Success Criteria

The MCP server is working correctly if:

1. ✅ All 4 tools register without errors
2. ✅ Tools can be called from MCP client
3. ✅ Each tool produces expected output format
4. ✅ Generated files are valid and functional
5. ✅ End-to-end workflow completes successfully
6. ✅ Storybook can display generated stories

## 🎯 Next Steps

After successful testing:

1. **Integration**: Connect to your actual design workflow
2. **Customization**: Modify tools for your specific needs
3. **Extension**: Add new tools using the existing patterns
4. **Production**: Deploy MCP server for team use

## 🆘 Getting Help

If you encounter issues:

1. Check the server logs for detailed error messages
2. Verify your test inputs match the expected formats
3. Test tools individually before running workflows
4. Check API quota/rate limits for LLM providers

---

**Happy testing! 🚀**

The SuperComponents MCP server provides a powerful foundation for AI-driven design system tooling. Each tool is designed to work independently or as part of a complete workflow. 