## Background

This is a Model Context Protocol server for assisting the user in a code development workflow

The goal is to Increase the quality and uniqueness of AI generated applications by providing the user with a structured component library development system.

The MCP tries to mostly return prompts so that the user's development agent (cursor, claude, etc) can directly implement the actual components.

This workflow is opinionated on how the design system gets made.


## Intended design sequence
- Choose north star design principles
- Design token extraction: Extract or generate design tokens according to input references or 
- Inspiration development: Generating demonstrative html files utilizing the design tokens
- Library planning
- Library implementation
- Library documentation

## Scaffolding (techstack of the repo we are managing)

This MCP should also setup scaffolding for the project. The MVP should use fixed scaffolding:
- Linter rules
- React+Storybook+TS
- Tailwind v4


## Tech stack (of our repo)
- Typescript
- npm
- vite
- npm i @modelcontextprotocol/sdk


