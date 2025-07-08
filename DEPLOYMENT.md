# SuperComponents Deployment Guide

This guide explains how to set up automated NPM publishing using GitHub Actions for the SuperComponents project.

## Overview

The deployment system uses:
- **GitHub Actions** for CI/CD automation
- **Semantic Release** for automatic version management
- **Conventional Commits** for version determination
- **NPM** for package publishing

## Prerequisites

1. **NPM Account**: You need an NPM account with publishing permissions
2. **GitHub Repository**: The project must be hosted on GitHub
3. **Admin Access**: You need admin access to the GitHub repository

## Setup Steps

### 1. Repository Configuration

First, update the repository URLs in `package.json`:

```json
{
  "repository": {
    "type": "git",
    "url": "https://github.com/SuperComponents/SuperComponents.git"
  },
  "homepage": "https://github.com/SuperComponents/SuperComponents#readme",
  "bugs": {
    "url": "https://github.com/SuperComponents/SuperComponents/issues"
  }
}
```

Replace `YOUR_USERNAME` with your actual GitHub username or organization name.

### 2. NPM Token Setup

1. **Generate NPM Token**:
   ```bash
   npm login
   npm token create --read-only=false
   ```
   
2. **Add to GitHub Secrets**:
   - Go to your GitHub repository
   - Navigate to: **Settings** → **Secrets and variables** → **Actions**
   - Click **New repository secret**
   - Name: `NPM_TOKEN`
   - Value: Your NPM token (starts with `npm_`)

### 3. GitHub Token (Already Available)

The `GITHUB_TOKEN` is automatically provided by GitHub Actions - no setup needed.

### 4. Branch Protection (Highly Recommended for Team Workflow)

Since you're using feature branches and PRs, set up branch protection to enforce this workflow:

1. Go to **Settings** → **Branches**
2. Click **Add rule**
3. Branch name pattern: `master`
4. Enable:
   - ✅ Require pull request reviews before merging
   - ✅ Require status checks to pass before merging
   - ✅ Require up-to-date branches before merging
   - ✅ Restrict pushes that create files
   - ✅ Do not allow bypassing the above settings

This prevents direct pushes to master and ensures all changes go through the PR process.

## How It Works

### Feature Branch Workflow

The deployment system is optimized for a professional feature branch workflow:

1. **Feature Development**: Work happens on feature branches
2. **Pull Request**: Create PR to master (triggers tests only)
3. **Code Review**: Team reviews changes before merge
4. **Merge to Master**: Triggers automatic release

### Automatic Publishing

The system automatically publishes a new version when:
1. A Pull Request is merged into the `master` branch
2. The commit messages follow conventional commit format
3. All tests pass and build succeeds

### Commit Message Format

Use these prefixes in your commit messages:

```bash
feat: add new feature          # → Minor version bump (1.0.0 → 1.1.0)
fix: resolve bug               # → Patch version bump (1.0.0 → 1.0.1)
docs: update documentation     # → Patch version bump
style: formatting changes      # → Patch version bump
refactor: code improvements    # → Patch version bump
test: add tests               # → Patch version bump
build: build system changes   # → Patch version bump
ci: CI/CD changes             # → Patch version bump
chore: maintenance tasks      # → Patch version bump

# For breaking changes (major version):
feat!: breaking change        # → Major version bump (1.0.0 → 2.0.0)
# OR
feat: new feature

BREAKING CHANGE: This change breaks the API
```

### Workflow Overview

The GitHub Actions workflow consists of 3 jobs optimized for feature branch workflow:

1. **Test Job** (runs on all PRs and feature branch pushes):
   - Installs dependencies
   - Runs tests (currently optional since tests aren't implemented)
   - Builds the project
   - Verifies build output
   - ✅ Shows status check on PR

2. **Release Job** (runs ONLY when PRs are merged to master):
   - Analyzes ALL commit messages from the merged PR
   - Automatically updates version in package.json
   - Generates changelog
   - Creates GitHub release
   - Publishes to NPM

3. **Manual Publish Job** (can be triggered manually):
   - Builds and publishes without version changes
   - Use for emergency releases

### What Triggers What

- **Push to feature branch**: Nothing (develop freely)
- **Create PR to master**: Test job only (safe to test)
- **Merge PR to master**: Release job (automatic publish)
- **Direct push to master**: Release job (if branch protection disabled)

### Important: PR Merge Strategy

The system works with any merge strategy, but be aware:

- **Merge Commit**: Preserves all individual commit messages (recommended)
- **Squash and Merge**: Combines commits into one (use descriptive squash message)
- **Rebase and Merge**: Preserves individual commits in linear history

For best results, use **merge commits** or ensure your **squash commit messages** follow conventional format.

## Usage Examples

### Development Workflow (Feature Branch Approach)

```bash
# Create feature branch
git checkout -b feature/new-tool

# Make changes and commit using conventional format
git commit -m "feat: add new design parsing tool"

# Push feature branch (triggers test job only)
git push origin feature/new-tool

# Create Pull Request on GitHub
# → Test job runs automatically
# → Build verification occurs
# → Ready for review

# After PR is approved and merged to master:
# → Automatic version bump to 1.1.0
# → Automatic NPM publish
# → GitHub release created
```

### Bug Fix Workflow

```bash
# Create fix branch
git checkout -b fix/validation-error

# Fix the issue and commit
git commit -m "fix: resolve validation error in design schema"

# After merge to master:
# → Automatic version bump to 1.0.1
# → Automatic NPM publish
```

### Breaking Change Workflow

```bash
# Make breaking change
git commit -m "feat!: change API interface for better type safety

BREAKING CHANGE: The parseDesign function now returns a Promise instead of synchronous result"

# After merge to master:
# → Automatic version bump to 2.0.0
# → Automatic NPM publish
```

## Manual Publishing

If you need to publish manually:

```bash
# Build the project
npm run build

# Publish to NPM
npm publish
```

Or trigger the manual workflow in GitHub Actions:
1. Go to **Actions** tab
2. Select **Release and Publish** workflow
3. Click **Run workflow**
4. Select **master** branch
5. Click **Run workflow**

## Package Contents

The published NPM package includes:
- ✅ Compiled JavaScript files (`build/`)
- ✅ TypeScript declaration files (`*.d.ts`)
- ✅ Source maps for debugging
- ✅ README.md
- ✅ LICENSE file
- ❌ Source TypeScript files (excluded via .npmignore)
- ❌ Tests and development files (excluded)

## Troubleshooting

### Common Issues

1. **NPM publish fails**: Check that your NPM_TOKEN is valid and has publish permissions
2. **GitHub release fails**: Ensure GITHUB_TOKEN has proper permissions
3. **Version not bumping**: Check that commit messages follow conventional format
4. **Build fails**: Run `npm run build` locally to test

### Debug Commands

```bash
# Test build locally
npm run build

# Test package contents
npm pack
tar -tzf *.tgz

# Check NPM token
npm whoami

# Verify semantic release locally (requires installation)
npx semantic-release --dry-run
```

## Files Created/Modified

This deployment setup created/modified these files:
- `package.json` - Updated for NPM publishing
- `.npmignore` - Controls what gets published
- `tsconfig.json` - TypeScript compilation settings
- `.github/workflows/release.yml` - GitHub Actions workflow
- `.releaserc.json` - Semantic release configuration
- `LICENSE` - MIT license file
- `DEPLOYMENT.md` - This documentation

## Next Steps

1. Update the repository URLs in `package.json`
2. Add the NPM_TOKEN secret to GitHub
3. Test the workflow with a sample commit
4. Set up branch protection rules (optional)
5. Share this guide with your team

The deployment system is now ready for your team to use! 🚀 