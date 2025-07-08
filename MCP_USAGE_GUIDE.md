# SuperComponents MCP Tools Usage Guide

## Overview

The SuperComponents MCP server provides 4 powerful tools for generating design systems, component libraries, and Storybook documentation. This guide explains how to use each tool effectively.

## 🚀 Quick Start

### 1. Initialize Project (REQUIRED FIRST STEP)

**Tool**: `initializeProject`

**Purpose**: Sets up the project structure with Storybook, Tailwind CSS, and SuperComponents directory.

**Usage**:
```json
{
  "path": "./",
  "projectName": "My Design System",
  "skipStorybook": false,
  "skipTailwind": false,
  "skipSuperComponents": false
}
```

**What it does**:
- Creates Storybook configuration
- Sets up Tailwind CSS
- Creates `supercomponents/` directory
- Generates example components and stories

---

### 2. Parse Design and Generate Tokens

**Tool**: `parseDesignAndGenerateTokens`

**Purpose**: Takes design descriptions, file content, or **actual images** and generates design tokens.

**IMPORTANT**: The `input` parameter is REQUIRED and can be either a string or an image object.

**Usage Examples**:

**Simple text description**:
```json
{
  "input": "Create a modern dashboard with blue primary colors, card-based layout, and rounded corners"
}
```

**🆕 Direct image analysis**:
```json
{
  "input": {
    "type": "image",
    "data": "base64-encoded-image-data",
    "mimeType": "image/jpeg"
  },
  "outputDir": "./my-design-system",
  "includeCSS": true,
  "includeTailwind": true
}
```

**With custom output directory**:
```json
{
  "input": "Design an e-commerce interface with purple accent colors, clean typography, and consistent spacing",
  "outputDir": "./my-design-system",
  "includeCSS": true,
  "includeTailwind": true
}
```

**File content analysis**:
```json
{
  "input": "Based on this React component: import React from 'react'; const Card = ({ children, className }) => <div className='bg-white shadow-lg rounded-lg p-6 border border-gray-200'>{children}</div>; Create a design system with consistent spacing and colors.",
  "outputDir": "./tokens"
}
```

**Generated files**:
- `design.json` - Structured design tokens
- `tailwind.config.js` - Tailwind configuration
- `tokens.css` - CSS custom properties

---

### 3. Create Token Stories

**Tool**: `createTokenStories`

**Purpose**: Generates Storybook stories that visualize your design tokens.

**Usage**:
```json
{
  "random_string": "dummy"
}
```

**What it creates**:
- Color palette stories
- Typography scale stories
- Spacing/sizing stories
- Component token documentation

---

### 4. Analyze Components

**Tool**: `analyzeComponents`

**Purpose**: Analyzes existing React/Vue components and identifies patterns.

**Usage**:
```json
{
  "random_string": "dummy"
}
```

**What it does**:
- Scans component files
- Identifies design patterns
- Suggests token improvements
- Creates component documentation

---

## 🎯 Common Workflows

### Workflow 1: Starting from a Design Description

1. **Initialize the project**:
   ```json
   Tool: initializeProject
   Parameters: { "projectName": "My Design System" }
   ```

2. **Generate tokens from description**:
   ```json
   Tool: parseDesignAndGenerateTokens
   Parameters: {
     "input": "Create a SaaS dashboard with blue primary colors (#2563eb), clean typography (Inter font), 8px spacing scale, rounded corners (4px, 8px, 12px), and subtle shadows"
   }
   ```

3. **Create Storybook documentation**:
   ```json
   Tool: createTokenStories
   Parameters: { "random_string": "dummy" }
   ```

### Workflow 2: Starting from Existing Components

1. **Initialize the project**:
   ```json
   Tool: initializeProject
   Parameters: {}
   ```

2. **Analyze existing code**:
   ```json
   Tool: analyzeComponents
   Parameters: { "random_string": "dummy" }
   ```

3. **Generate tokens based on analysis**:
   ```json
   Tool: parseDesignAndGenerateTokens
   Parameters: {
     "input": "Based on the analyzed components, create a unified design system that consolidates the spacing, colors, and typography patterns found in the codebase"
   }
   ```

4. **Create documentation**:
   ```json
   Tool: createTokenStories
   Parameters: { "random_string": "dummy" }
   ```

### Workflow 3: Starting from Design Files or Images

1. **Initialize the project**:
   ```json
   Tool: initializeProject
   Parameters: {}
   ```

2. **Process design files** - You can now do this in TWO ways:

   **Option A - Upload image directly** (🆕 New!):
   ```json
   Tool: parseDesignAndGenerateTokens
   Parameters: {
     "input": {
       "type": "image",
       "data": "base64-encoded-image-data",
       "mimeType": "image/jpeg"
     }
   }
   ```

   **Option B - Describe the design in text**:
   ```json
   Tool: parseDesignAndGenerateTokens
   Parameters: {
     "input": "The design shows a modern e-commerce interface with: Primary color appears to be a deep purple (#6366f1), secondary colors in gray scale, typography uses a sans-serif font (likely Inter or similar), spacing follows an 8px grid system, buttons have 8px border radius, cards have 12px border radius and subtle drop shadows, the layout is responsive with breakpoints at 768px and 1024px"
   }
   ```

3. **Generate documentation**:
   ```json
   Tool: createTokenStories
   Parameters: { "random_string": "dummy" }
   ```

---

## 🔧 Troubleshooting

### Error: "Required field 'input' is missing"

**Problem**: The `parseDesignAndGenerateTokens` tool was called without the required `input` parameter.

**Solution**: Always provide the `input` parameter with a string value:
```json
{
  "input": "Your design description here"
}
```

### Error: "Project directory not found"

**Problem**: Trying to use tools before initializing the project structure.

**Solution**: Run `initializeProject` first:
```json
Tool: initializeProject
Parameters: { "path": "./" }
```

### Error: "No components found to analyze"

**Problem**: The `analyzeComponents` tool couldn't find component files to analyze.

**Solution**: 
1. Ensure you have React/Vue component files in your project
2. Make sure file extensions are `.tsx`, `.jsx`, `.vue`
3. Check that components are in standard directories (`src/`, `components/`, etc.)

---

## 📁 File Structure

After running the tools, your project will have:

```
project/
├── .storybook/              # Storybook configuration
├── supercomponents/         # Generated design system
│   ├── design.json         # Structured design tokens
│   ├── tailwind.config.js  # Tailwind configuration
│   ├── tokens.css          # CSS custom properties
│   ├── components/         # Example components
│   └── stories/            # Token visualization stories
├── src/                    # Your application code
└── package.json           # Dependencies
```

---

## 💡 Tips for Better Results

### For `parseDesignAndGenerateTokens`:

1. **Be specific about colors**: Include hex codes, color names, or detailed descriptions
2. **Mention typography**: Font families, sizes, weights, line heights
3. **Describe spacing**: Grid systems, padding/margin patterns
4. **Include component details**: Button styles, card layouts, form elements
5. **Specify breakpoints**: Mobile, tablet, desktop sizes

### Example of a great input:
```json
{
  "input": "Design a fintech app with: Primary brand color #0066CC (trust blue), secondary color #00CC66 (success green), neutral grays from #F8F9FA to #212529, typography using Inter font family with 16px base size and 1.5 line height, 8px spacing grid (8, 16, 24, 32, 48, 64px), border radius of 6px for buttons and 12px for cards, subtle shadows using 0 2px 4px rgba(0,0,0,0.1), responsive breakpoints at 768px and 1200px"
}
```

---

## 🔄 Parameter Reference

### initializeProject
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| path | string | No | "./" | Project directory |
| projectName | string | No | "SuperComponents Project" | Project name |
| skipStorybook | boolean | No | false | Skip Storybook setup |
| skipTailwind | boolean | No | false | Skip Tailwind setup |
| skipSuperComponents | boolean | No | false | Skip directory creation |

### parseDesignAndGenerateTokens
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| input | string | **Yes** | - | Design description or file content |
| outputDir | string | No | "./supercomponents" | Output directory |
| includeCSS | boolean | No | true | Generate CSS variables |
| includeTailwind | boolean | No | true | Generate Tailwind config |

### createTokenStories
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| random_string | string | Yes | - | Dummy parameter (any string) |

### analyzeComponents  
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| random_string | string | Yes | - | Dummy parameter (any string) | 