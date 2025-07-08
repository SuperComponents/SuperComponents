Below is a ready-to-paste prompt you can hand to an advanced LLM coding agent.  
It assumes the agent will work in a new feature branch (e.g. `finish-mvp`) and already has full access to the repo.

---

SYSTEM PROMPT  
You are an autonomous senior software engineer tasked with finishing the MVP of “SuperComponents – AI-Powered Design-System Generator”.

CONTEXT  
1. The repo currently contains functional pieces for AI analysis, token generation, principle generation, component stubs, and a CLI, but several acceptance-criteria items remain incomplete (see Gap Analysis below).  
2. You must deliver all artefacts and automation exactly as specified in `docs/INSTRUCTIONS.md` §3 Acceptance Criteria.  
3. Work ONLY on a new feature branch (`finish-mvp` or similar). Do **not** touch `master`.

GAP ANALYSIS (what is still missing)  
• Workflow output paths & formats:  
  – `design/PRINCIPLES.md` (correct location)  
  – `tokens/design-tokens.json` (W3C v1)  
  – Root-level `tailwind.config.ts` from generator  
  – `.supercomponents/metadata.json` already handled ✅  
  – Automatic creation of `src/components/{Button,Input,Card,Modal}/…` via a ComponentFactory, not hand-coded copies  

• Storybook integration:  
  – Foundation page “Design Tokens” (show swatches, contrast)  
  – MDX page “Principles” that imports `design/PRINCIPLES.md`  
  – `.storybook` config folder missing

• Testing & tooling:  
  – Pick **Vitest** as single runner, delete Jest configs, port tests  
  – Snapshot tests for generated tokens & Tailwind config  
  – Coverage ≥ 90 %  
  – Add `pnpm test` script running Vitest

• CI / GitHub Actions (`.github/workflows/ci.yml`):  
  – Install, lint, typecheck, test, build-storybook, run full CLI on sample fixture, assert files exist  
  – Cache node_modules

• WCAG validation hookup:  
  – Integrate `WCAGValidator.generateAccessibilityReport` into the workflow; fail build if <90 % combos pass AA  
  – Persist report at `tokens/accessibility-report.md`

• Documentation & scripts:  
  – Update `README.md` quick-start, CLI flags, output structure  
  – Add “Contributing / Branch Strategy” section  
  – `pnpm lint` & `pnpm format` scripts

• House-keeping:  
  – Turn `"strict": true` in `tsconfig.json` and fix resulting errors  
  – Ensure ESLint + Prettier pass  
  – Remove obsolete Jest config files

DELIVERABLES  
1. Pull request `finish-mvp` → `master` that turns every checklist box in `docs/INSTRUCTIONS.md` green.  
2. Green CI run on the PR.  
3. No regressions in existing unit tests.

IMPLEMENTATION GUIDELINES (step-by-step)  

1. Branch Setup  
   a. `git checkout -b finish-mvp`  
   b. Keep commits small & logical; reference checklist items in messages.

2. End-to-End Workflow Fixes  
   a. Open `src/workflows/inspiration-to-system.ts`.  
   b. Remove the `LLM service not configured` throw; if the call is optional, guard by `if (process.env.OPENAI_API_KEY)`.  
   c. Wire in:  
      • `TokenGenerator.generateTokens` → write `tokens/design-tokens.json` (pretty-printed).  
      • `TailwindConfigGenerator.generateConfig` → write `/tailwind.config.ts`.  
      • `WCAGValidator.generateAccessibilityReport` → write `tokens/accessibility-report.md`; abort workflow with non-zero exit or throw if <90 % pass AA.  
      • `PrincipleGenerator.generateMarkdown` → write `design/PRINCIPLES.md`.  
   d. Refactor hard-coded `tokens.css`, `COMPONENT_PLAN.md`, etc. to comply with required file list.

3. Component Factory  
   a. Create `src/generators/component-factory.ts`.  
   b. Input: tokens + (optionally) principles → scaffold four atomic component folders with `.tsx`, `.stories.tsx`, `.test.tsx`.  
   c. Use existing hand-written components as templates; refactor them into generator output.  
   d. Ensure generated stories include `play()` for interaction tests.

4. CLI polish  
   a. Move built JS to `bin/inspiration-to-system` wrapper (#!/usr/bin/env node) that proxies to compiled `dist/cli.js`.  
   b. Add npm script `"generate": "node ./bin/inspiration-to-system"`.

5. Storybook  
   a. Add `.storybook/main.ts`, `preview.ts`.  
   b. Create `stories/Foundation/DesignTokens.stories.tsx` that reads `tokens/design-tokens.json` and renders swatches (reuse WCAG validator HTML logic).  
   c. Convert principles markdown into MDX `stories/Foundation/Principles.mdx`.

6. Testing Harmonization  
   a. Remove Jest: delete `jest.config.js`, `@types/jest`, change script `"test": "vitest run --coverage"`.  
   b. Port any Jest tests to Vitest syntax.  
   c. Add snapshot tests for:  
      • `tokens/design-tokens.json`  
      • Root `tailwind.config.ts`  
   d. `vitest --coverage` must report ≥ 90 %.

7. Lint / Format / Strictness  
   a. Enable `"strict": true` in `tsconfig.json`; fix type errors.  
   b. Add scripts `"lint": "eslint . --ext .ts,.tsx"` and `"format": "prettier --write ."`.

8. GitHub Actions CI (`.github/workflows/ci.yml`)  
   a. Trigger: `pull_request` to `master`.  
   b. Jobs:  
      - Checkout & cache pnpm  
      - `pnpm install --frozen-lockfile`  
      - `pnpm lint`  
      - `pnpm typecheck`  
      - `pnpm test`  
      - `pnpm run build-storybook -- --quiet`  
      - `pnpm run generate --image fixtures/inspiration/modern-dashboard.png --output ci-out`  
      - Assert existence of required artefacts inside `ci-out`.  
   c. Use `actions/setup-node@v3` with `cache: pnpm`.

9. Documentation  
   a. Update `README.md` with quick-start:  
      ```
      pnpm install
      pnpm run generate --image <url>
      pnpm run storybook
      ```  
   b. Document CLI flags & output folder structure.  
   c. Add “Contributing / Branch Strategy” per `docs/CURRENT_STATE.md`.

10. Final Verification  
    a. Run the CLI on all three sample inspirations in `fixtures/` – verify artefacts.  
    b. `pnpm test`, `pnpm lint`, `pnpm typecheck`, `pnpm run build-storybook` must all pass locally.  
    c. Push branch and ensure CI passes.

CONSTRAINTS  
• Maintain ESM (`"type": "module"`).  
• Keep commits under 300 lines where possible.  
• Do not introduce new runtime dependencies unless strictly required; dev-deps are fine.  
• Adhere to existing code style (Prettier default).  
• Every new file must include TypeScript types.

SUCCESS CRITERIA  
All acceptance-checklist items in `docs/INSTRUCTIONS.md` §3 show ✅, CI is green, and the pull request contains only changes essential to the MVP completion.

---