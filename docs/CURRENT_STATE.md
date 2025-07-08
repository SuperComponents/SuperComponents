──────────────────────────────────────
PROMPT FOR CODING AGENTS
──────────────────────────────────────
Project: SuperComponents – AI-powered design-system generator  
Primary Repo Root: `github.com/SuperComponents/Super Components`

You are Agent-Team Alpha. Your mission is to take the partially-completed codebase and deliver an MVP that satisfies **all** acceptance criteria in `docs/INSTRUCTIONS.md` (§3).

============================================================
0. Preparation – create a unified working branch
============================================================
1. Check out `master`.  
2. Create a new branch **`integration/mvp-merge`** from `master`.  
3. Fast-forward merge these heads into the new branch (resolving conflicts as you go, preferring newer logic):  
   • `feature/vision-analysis`  
   • `feature/token-generator` *(tip is identical to `feature/principles-components`)*  
   (The orchestrator in `pre-amp-agent` is older; keep the merged versions and adapt their APIs.)  
4. Run `pnpm install && pnpm test`. All existing Jest suites must pass before you begin new work.

─────────────────────────────────────
IMPORTANT BRANCHING RULES 
─────────────────────────────────────
• **Do NOT merge to `master`.**  
• Work only inside a dedicated feature branch:

  1. `git checkout -b feature/integration-mvp` (branched from `master`).  
  2. Fast-forward merge existing work:  
      `git merge feature/vision-analysis feature/token-generator --no-ff`  
  3. Treat `feature/integration-mvp` as the trunk for this effort.  
  4. Feel free to create *sub-branches* (`feat/components`, `feat/cli`, …) and PR them back into **`feature/integration-mvp`**.  
  5. When all acceptance criteria pass, open a single PR **targeted at `master`** for human review—no auto-merge.

============================================================
1. Finish EPIC C — Principle Composer
============================================================
• File: `src/generators/principles.ts` (already stubbed).  
• Input: `DesignInsight`.  
• Output:  
  a. Markdown file `design/PRINCIPLES.md` (3–5 principles, <= 120 words each).  
  b. Storybook MDX page `src/stories/Principles.stories.mdx` that renders the markdown.  
• Unit tests: verify markdown headings, list length, and that each principle contains ≥ 1 brandKeyword.

============================================================
2. Finish EPIC D — Component Factory
============================================================
• Generator entry-point: `src/generators/components/factory.ts`.  
• Generate **4 atomic components** (`Button`, `Input`, `Card`, `Modal`).  
• Folder layout (example for Button):

```
src/components/
  Button/
    Button.tsx
    Button.stories.tsx
    Button.test.tsx
```

Requirements  
  – Use the W3C tokens via CSS variables or Tailwind classes.  
  – Each Storybook story must include a `play` function with @storybook/testing-library interaction.  
  – Snapshot tests with `vitest` for default and primary variants.

============================================================
3. Complete EPIC E — Workflow + CLI
============================================================
A. `src/workflows/inspiration-to-system.ts`  
   1. Replace local `analyzeInspiration()` with a call to the **AIDesignAnalyzer** from `feature/vision-analysis`.  
   2. Call **TokenGenerator.generate()** to obtain W3C tokens and legacy conversion.  
   3. Call the new `generatePrinciples()` (from §1) and `ComponentFactory.generate()` (from §2).  
   4. Write these artefacts to disk:  

```
design/PRINCIPLES.md
tokens/design-tokens.json          // W3C schema
tailwind.config.ts                 // produced by token generator
src/components/**                  // 4 component folders
.supercomponents/metadata.json     // {timestamp, version, sources}
```

B. CLI wrapper  
   • File `bin/inspiration-to-system.ts` (shebang, tsx-runner).  
   • Usage:  
      `npx inspiration-to-system --image <url>|--url <url>|--description "<text>" --output <dir>`  
   • Arguments: inspiration source, output root (default `./generated-design-system`), `--verbose`.

C. Pipeline performance: total run time ≤ 60 s on the three fixture inspirations.

============================================================
4. Storybook Integration
============================================================
• Auto-append tokens & principles to Storybook config (`main.ts` & `preview.ts`) so running `pnpm storybook` shows:  
  1. “Foundations/Colors” swatch page (import HTML from WCAG validator).  
  2. “Foundations/Principles” MDX page.  
  3. The 4 components.

CI must build Storybook without errors (headless mode).

============================================================
5. CI Pipeline
============================================================
• Add GitHub Actions workflow `.github/workflows/ci.yml` that:

```
pnpm install
pnpm test
pnpm build-storybook --quiet
```

============================================================
6. Documentation
============================================================
• Update `README.md` with quick-start (“npx inspiration-to-system …”), badges, and contribution guide.  
• Document all new scripts in `package.json`.

============================================================
7. Definition of Done (automated)
============================================================
Running:

```
pnpm tsx bin/inspiration-to-system.ts --description "Sample inspiration" --output /tmp/out
pnpm test
pnpm build-storybook --quiet
npx lighthouse http://localhost:6006 --only-categories=accessibility
```

must produce  
 •  all specified files in `/tmp/out`,  
 •  100 % passing unit & snapshot tests,  
 •  Storybook build exit 0,  
 •  Lighthouse a11y score ≥ 90.

============================================================
Coding guidelines & constraints
============================================================
• TypeScript strict mode (leave `noImplicitAny` disabled only if unavoidable).  
• Follow W3C Design Tokens v1 ($type/$value).  
• Keep WCAG contrast ≥ 4.5 via the validator.  
• Cap outbound network calls in unit tests (mock OpenAI).  
• Prefer parallel async operations inside generators.  
• Conventional commits for all PRs.


