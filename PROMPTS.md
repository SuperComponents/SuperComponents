# MCP Prompts Usage Guide

This MCP server includes both **tools** (which execute actions) and **prompts** (which return conversation templates).

## Available Prompts

### 1. define_design_principles
Guides you through establishing design principles for your component library.

### 2. plan_component_library  
Analyzes your design principles and suggests a component library structure following atomic design.

### 3. generate_component_implementation
Generates detailed implementation prompts for specific components.

## How to Use Prompts

In MCP-compatible clients:
1. Use the `prompts/list` method to see available prompts
2. Use `prompts/get` with the prompt name to retrieve the prompt content

## Manual Usage

If your client doesn't support prompts, you can use these templates directly:

### Define Design Principles
Ask: "Let's establish the north-star design principles for your component library..."

### Plan Component Library
Ask: "Based on the design principles, let's plan your component library structure..."

### Generate Component Implementation
Ask: "Generate an implementation prompt for [ComponentName]..."

## Converting to Tools (Alternative)

If needed, we can convert these prompts to tools that return the prompt text for easier access in clients with limited MCP support.