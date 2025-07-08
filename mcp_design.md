
## MCP server tools / prompts

/init_project
A tool that sets up the initial project scaffolding, including React, Storybook, TypeScript, Tailwind, and recommended linter configurations. This handles the "Scaffolding" requirement.

/define_design_principles
An interactive prompt to guide the user in establishing the north-star design principles for the library. It would ask questions about brand identity, target audience, and core values to produce a summary of principles.

/extract_design_tokens
A tool that accepts a URL, image, or text description as input and extracts design tokens (colors, typography, spacing, radii). It would output a tailwind v4 compatible index.css theme object.

/generate_style_showcase
A tool that takes the extracted design tokens and generates a static HTML or React page. This page would visually demonstrate all the defined colors, fonts, and spacing, serving as a reference and "inspiration."

/plan_component_library
A prompt that analyzes the design principles and style showcase to propose a structured list of components to be built. It would suggest a component hierarchy (e.g., atoms, molecules) and a development priority.

/generate_component_implementation_prompt
A core prompt generator. For a given component name (e.g., "Button"), this would create a detailed, context-aware prompt for a development agent (like Cursor). The prompt would include the component's API (props), required variants, accessibility standards, and instructions for using the project's design tokens.




Potential MCP workflow
```
id: design-system-pipeline
steps:
  1_init_project:
    uses: /init_project
    input: {}
  2_define_principles:
    uses: /define_design_principles
    needs: [1_init_project]
  3_extract_tokens:
    uses: /extract_design_tokens
    needs: [2_define_principles]
    input:
      source: <user-supplied URL or image>
  4_style_showcase:
    uses: /generate_style_showcase
    needs: [3_extract_tokens]
  5_plan_library:
    uses: /plan_component_library
    needs: [2_define_principles, 4_style_showcase]
  6_component_prompt:
    uses: /generate_component_implementation_prompt
    needs: [5_plan_library]
    input:
      component_name: "Button"
```