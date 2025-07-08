# CI/CD Setup Documentation

## Overview

This document describes the complete CI/CD pipeline for SuperComponents, including end-to-end testing, Lighthouse accessibility validation, and badge generation.

## CI Pipeline Architecture

### 1. Main CI Workflow (`.github/workflows/ci.yml`)

**Jobs:**
- `test`: Runs tests, linting, and type checking on Node.js 18 & 20
- `build`: Builds the project and Storybook
- `integration`: Basic integration testing (main branch only)
- `e2e-generation`: Validates E2E workflow configuration

**Triggers:**
- Push to `main`, `master`, `feature/integration-mvp`
- Pull requests to `main`, `master`, `feature/integration-mvp`
- Manual workflow dispatch

### 2. E2E Generation Testing (`.github/workflows/e2e-generation.yml`)

**Matrix Strategy:**
- Tests multiple inspiration configurations:
  - `sample.json`: Basic text-based inspiration
  - `dashboard.json`: Image-based inspiration with dashboard theme

**Pipeline Steps:**
1. **CLI Generation**: Runs `inspiration-to-system` CLI with test fixtures
2. **Output Validation**: Verifies generated file structure and JSON validity
3. **Dependency Installation**: Installs dependencies in generated project
4. **Storybook Build**: Builds Storybook from generated components
5. **Lighthouse Audit**: Validates accessibility score ≥90%
6. **WCAG Assertion**: Parses and validates WCAG compliance results
7. **Artifact Upload**: Uploads generated Storybook and logs

**Critical Requirements:**
- ✅ End-to-end CLI testing on sample inspirations
- ✅ Storybook build from generated output
- ✅ Lighthouse accessibility score ≥90%
- ✅ WCAG validation assertion
- ✅ Artifact preservation for debugging

### 3. Badge Generation (`.github/workflows/badges.yml`)

**Generated Badges:**
- Build Status
- E2E Test Status
- Accessibility Score
- CLI Status

## Configuration Files

### `.lighthouserc.json`
```json
{
  "ci": {
    "collect": {
      "staticDistDir": "./storybook-static",
      "numberOfRuns": 3
    },
    "assert": {
      "assertions": {
        "categories:accessibility": ["error", {"minScore": 0.9}],
        "categories:performance": ["warn", {"minScore": 0.7}],
        "categories:best-practices": ["warn", {"minScore": 0.8}],
        "categories:seo": ["warn", {"minScore": 0.8}]
      }
    }
  }
}
```

### Test Fixtures

#### `fixtures/inspiration/sample.json`
Basic text-based inspiration for testing CLI functionality.

#### `fixtures/inspiration/dashboard.json`
Image-based inspiration testing with dashboard theme.

## Environment Variables

### Required Secrets
- `OPENAI_API_KEY`: OpenAI API key for CLI generation
- `GITHUB_TOKEN`: GitHub token for badge generation
- `BADGE_GIST_ID`: GitHub Gist ID for badge storage

## Local Testing

### CLI Testing
```bash
# Test CLI functionality
pnpm run test:cli

# Test with sample inspiration
pnpm run inspiration-to-system --description "Modern design system" --output ./test-output

# Test with JSON inspiration
pnpm run inspiration-to-system \
  --description "$(cat fixtures/inspiration/sample.json | jq -r '.description')" \
  --brand-keywords "$(cat fixtures/inspiration/sample.json | jq -r '.brandKeywords | join(",")')" \
  --output ./test-output
```

### Lighthouse Testing
```bash
# Install Lighthouse CI
npm install -g @lhci/cli

# Run Lighthouse audit
cd generated-project
pnpm run build-storybook
lhci autorun
```

## Success Criteria

### ✅ End-to-End Testing
- CLI runs successfully on sample inspirations
- Generated output contains all required files
- JSON files are valid and properly structured
- Dependencies install without errors

### ✅ Storybook Integration
- Storybook builds from generated components
- No build errors or warnings
- All components render correctly
- Stories are properly generated

### ✅ Accessibility Validation
- Lighthouse accessibility score ≥90%
- WCAG validation passes
- Color contrast ratios meet standards
- Keyboard navigation works properly

### ✅ CI/CD Pipeline
- All jobs pass consistently
- Artifacts are properly uploaded
- Badges are generated and updated
- Integration with GitHub Actions works

## Troubleshooting

### Common Issues

**CLI Generation Fails:**
- Check `OPENAI_API_KEY` environment variable
- Verify fixture files exist and are valid JSON
- Check output directory permissions

**Lighthouse Audit Fails:**
- Verify Storybook builds successfully
- Check accessibility score threshold
- Review generated component structure

**Badge Generation Fails:**
- Check `GITHUB_TOKEN` permissions
- Verify `BADGE_GIST_ID` is correct
- Ensure gist exists and is public

## Maintenance

### Adding New Test Cases
1. Create new JSON fixture in `fixtures/inspiration/`
2. Add to matrix strategy in `e2e-generation.yml`
3. Update documentation

### Updating Accessibility Thresholds
1. Modify `.lighthouserc.json` configuration
2. Update assertion logic in workflow
3. Test with sample projects

### Badge Configuration
1. Update badge generation workflow
2. Create new gist for badge storage
3. Update repository README with new badges
