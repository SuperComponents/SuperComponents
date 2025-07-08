Branching rules (read first!)  
1. **Do NOT** merge anything to `master`.  
2. Create one “umbrella” branch off `master`, e.g. `feature/mvp-finish`.  
3. If you need to split the work, create short-lived sub-branches (`feature/mvp-finish/<subtask>`) and merge those back into **`feature/mvp-finish`**.  
4. When all acceptance criteria are green, open a PR **from `feature/mvp-finish` → `master`**.  
   – CI must pass, but the PR should stay open for human review; do not press the merge button.

## Context  
• All nested feature/epic branches (`feature/*`, `epic-*`, etc.) have already been merged; the latest **`master`** contains 100 % of their commits.  
• You will create a **new short-lived branch** (e.g. `finish-mvp`) off `master`, implement the items below, open a PR, and update docs/CI.

Goal  
Finish the MVP so that the repo meets every acceptance criterion in `docs/INSTRUCTIONS.md` §3.

High-Level Tasks (in priority order)

1. End-to-End CLI & Workflow  
   a. Wire `src/workflows/inspiration-to-system.ts` to real modules already in the repo:  
      • `AIDesignAnalyzer` (EPIC A)  
      • `TokenGenerator`, `TailwindConfigGenerator`, `WCAGValidator` (EPIC B)  
      • `PrincipleGenerator` (EPIC C)  
      • `ComponentFactory` (EPIC D)  
   b. Emit files exactly as the spec requires:  
      • `design/PRINCIPLES.md`  
      • `tokens/design-tokens.json` (W3C v1)  
      • `tailwind.config.ts` (from generator)  
      • `.supercomponents/metadata.json`  ← include timestamps, git SHA, version `"1.0.0"`  
      • 4 component folders (Button, Input, Card, Modal) populated by `ComponentFactory`  
   c. Create an executable script `bin/inspiration-to-system` (Node ESM) that forwards CLI flags to the workflow.  
      - Example: `npx inspiration-to-system --image <url> --brand "playful modern"`  
   d. Add an npm script `"generate": "node ./bin/inspiration-to-system"`.

2. Storybook Integration  
   a. Add a Storybook “Foundation/Design Tokens” page that reads `design-tokens.json` and renders color/spacing/type swatches (you can re-use `WCAGValidator.generateSwatchHTML` logic).  
   b. Add a “Foundation/Principles” MDX page that imports `design/PRINCIPLES.md`.

3. Testing & Tooling Harmonization  
   a. Decide on **Vitest** (preferred) OR **Jest**. Currently codebase mixes both.  
      • If Vitest: migrate Jest tests or configure Vitest to run them; update `package.json` and configs.  
   b. Ensure `pnpm test` (or `npm test`) passes with >90 % coverage.  
   c. Provide snapshot tests for generated tokens & tailwind config.

4. CI / GitHub Actions  
   a. Create `.github/workflows/ci.yml` that runs on PRs:  
      - `pnpm install --frozen-lockfile`  
      - `pnpm lint`  
      - `pnpm typecheck`  
      - `pnpm test`  
      - `pnpm run build-storybook` (headless)  
      - Execute `bin/inspiration-to-system --image fixtures/inspiration/modern-dashboard.png` and assert output files exist.  
   b. Cache node_modules via actions/setup-node.

5. Accessibility Validation  
   • Hook `WCAGValidator.generateAccessibilityReport` into the workflow; fail the build if <90 % combinations pass AA.  
   • Save the report next to the design tokens (`tokens/accessibility-report.md`).

6. Documentation  
   a. Update `README.md` quick-start with:  
      ```bash
      pnpm install
      pnpm run generate --image <url>
      pnpm run storybook
      ```  
   b. Document the CLI flags and output folder structure.  
   c. Add “Contributing / Branch Strategy” section—use short-lived feature branches merged via PR.

7. Housekeeping  
   • Remove obsolete refs/branches after merge; keep `master` + new PR branch only.  
   • Add `pnpm lint` (ESLint) and `pnpm format` (Prettier) scripts if missing.  
   • Ensure `tsconfig.json` turns **strict** back **on** (was temporarily relaxed in one branch).

Acceptance Checklist (CI must enforce)

- [ ] `npx inspiration-to-system --image fixtures/...` generates all required artifacts.  
- [ ] Storybook renders tokens + principles + components with zero console errors.  
- [ ] `pnpm test` passes using a single test runner.  
- [ ] Lighthouse a11y score ≥ 90 for Storybook build (optional automated check).  
- [ ] All commands succeed inside the GitHub Action.

Deliverables

1. Pull request `finish-mvp` -> `master` containing only the changes necessary to meet the checklist.  
2. Green CI on the PR.

Good luck—this is the final sprint!