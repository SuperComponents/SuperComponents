# 🗺️ PROJECT OBJECTIVE
Build an **AI-powered design-system generator** that converts visual or textual inspiration into a complete, implementation-ready React + Storybook + Tailwind v4 design system.

---

## 0. HIGH-LEVEL USER FLOW

1. User supplies inspiration  
   • image URL • web-page URL • free-text description  
2. Server calls `/analyze_inspiration` (LLM + vision) → returns **Design Insights**  
3. Insights feed a pipeline that generates  
   a. Design **Principles** → b. **Tokens** (colors, spacing, type, …) →  
   c. **Foundational components** → d. **Showcase site**  
4. Outputs are committed to `src/` and deployed to Storybook.

---

## 1. DONE (Solid Foundation)

✅ React + TS + Storybook + Tailwind v4 scaffold  
✅ MCP architecture skeleton  
✅ Example prompts & mocks

---

## 2. REMAINING EPICS & TASKS

### EPIC A — Vision+LLM Inspiration Analysis (`src/ai/design-analyzer.ts`)
A-1  Replace mock with real vision model (GPT-4o, Claude 3.5V, etc.)  
A-2  Define canonical **DesignInsight** interface:

```ts
export interface DesignInsight {
  imageryPalette: string[];      // hex colors, length ≤ 8
  typographyFamilies: string[];  // font names
  spacingScale: number[];        // e.g. [4,8,12,16]
  uiDensity: "compact" | "regular" | "spacious";
  brandKeywords: string[];
  supportingReferences: string[]; // image crop URLs or CSS snippets
}
```

A-3  Unit-test with 3 fixture images (`/fixtures/inspiration/*.png`) ⇒ ensure stable output  
A-4  Persist insights in `/tmp/insights.json` for downstream steps

---

### EPIC B — Token Generator (`src/generators/tokens.ts`)
B-1  Input: `DesignInsight` → Output: `DesignTokens` JSON  
B-2  Adopt W3C Design Tokens v1 schema (`"$type"` keys)  
B-3  Provide `tailwind.config.ts` writer  
B-4  Validation script: renders tokens to HTML swatches, checks WCAG contrast ≥ 4.5

---

### EPIC C — Principle Composer (`src/generators/principles.ts`)
C-1  Prompt template uses insight.brandKeywords + audience + stylePrefs  
C-2  Produce markdown file `/design/PRINCIPLES.md` with 3–5 concise principles  
C-3  Add Storybook page that surfaces principles alongside tokens

---

### EPIC D — Component Factory (`src/generators/components/*.ts`)
D-1  Generate atomic components: Button, Input, Card, Modal  
D-2  Required file layout:

```
src/components/
  Button/
    Button.tsx
    Button.stories.tsx
    Button.test.tsx
```

D-3  Each story must have **play function** with interaction test  
D-4  Snapshot tests run via `vitest`

---

### EPIC E — End-to-End Workflow (`src/workflows/inspiration-to-system.ts`)
E-1  Orchestrates A→B→C→D  
E-2  CLI: `npx inspiration-to-system --image <url>`  
E-3  Emits `.supercomponents/metadata.json` with timestamps & version

---

## 3. ACCEPTANCE CRITERIA

1. Running the CLI with any of the 3 sample inspirations produces:  
   • `design/PRINCIPLES.md`  
   • `tokens/design-tokens.json` + `tailwind.config.ts`  
   • 4 component folders with tests & stories  
   • Storybook shows tokens + principles + components with zero build errors
2. `pnpm test` passes all unit and snapshot tests
3. Lighthouse a11y score ≥ 90 on the generated Storybook build

---

## 4. IMPLEMENTATION CHECKLIST (AGENT-READY)

- [ ]  Create `/tools/analyze_inspiration.ts` matching JSON schema below
- [ ]  Fill in **DesignInsight** interface
- [ ]  Replace mock in `design-analyzer.ts`
- [ ]  Add fixtures & unit tests
- [ ]  Build Token Generator with validator
- [ ]  Generate Principles markdown + Storybook page
- [ ]  Scaffold atomic components with tests/stories
- [ ]  Write orchestrating workflow & CLI
- [ ]  Update CI pipeline (`.github/workflows/ci.yml`) to run workflow on PRs
- [ ]  Document usage in `README.md`

---

## 5. TOOL CONTRACTS FOR MCP

```json
{
  "name": "analyze_inspiration",
  "description": "AI-powered analysis of design inspiration to extract tokens and principles",
  "inputSchema": {
    "type": "object",
    "properties": {
      "imageUrl": { "type": "string" },
      "websiteUrl": { "type": "string" },
      "description": { "type": "string" },
      "brandKeywords": { "type": "array", "items": { "type": "string" } },
      "targetAudience": { "type": "string" },
      "stylePreferences": { "type": "array", "items": { "type": "string" } }
    },
    "required": ["description"]
  },
  "outputSchema": { "$ref": "#/definitions/DesignInsight" }
}
```

---

## 6. OPEN QUESTIONS (FLAGGED FOR HUMAN REVIEW)

1. Which paid model tier will be used for vision features? (cost analysis)
2. Should generated components use Headless UI or fully custom markup?
3. Versioning strategy for regenerated tokens/components when users iterate?

---

## 7. FUTURE IDEAS (POST-MVP, NO ACTION NOW)

• Figma plugin input  
• Multi-brand workspaces  
• PDF style-guide export  
• Live-edit mode with streaming updates
