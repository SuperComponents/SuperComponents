# SuperComponents Manual Deployment Guide

This guide explains how to manually publish the SuperComponents package to NPM using local scripts and optional GitHub Actions.

## Overview

The deployment system uses:
- **Manual Publishing**: Local or GitHub Actions-based manual publishing
- **Manual Versioning**: Explicit version control using npm version commands
- **GitHub Actions**: Automated testing and optional manual publishing
- **NPM**: Package publishing

## Prerequisites

1. **NPM Account**: You need an NPM account with publishing permissions
2. **GitHub Repository**: The project must be hosted on GitHub  
3. **Node.js**: Version 18+ installed locally for manual publishing

## Setup Steps

### 1. Repository Configuration

The repository URLs are already configured in `package.json`:

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

### 2. NPM Authentication

For local publishing, you need to authenticate with NPM:

```bash
# Login to NPM
npm login

# Verify you're logged in
npm whoami
```

### 3. GitHub Secrets (Optional - for GitHub Actions publishing)

If you want to use the optional GitHub Actions manual publishing workflow:

1. **Generate NPM Token**:
   ```bash
   npm token create --read-only=false
   ```
   
2. **Add to GitHub Secrets**:
   - Go to your GitHub repository
   - Navigate to: **Settings** → **Secrets and variables** → **Actions**
   - Click **New repository secret**
   - Name: `NPM_TOKEN`
   - Value: Your NPM token (starts with `npm_`)

## Publishing Workflow

### Method 1: Local Manual Publishing (Recommended)

This is the primary method for publishing new versions:

```bash
# 1. Ensure you're on master branch and up to date
git checkout master
git pull origin master

# 2. Update version (choose one):
npm run version:patch   # 1.0.0 → 1.0.1 (bug fixes)
npm run version:minor   # 1.0.0 → 1.1.0 (new features)  
npm run version:major   # 1.0.0 → 2.0.0 (breaking changes)

# 3. Push version changes
git push origin master --tags

# 4. Build and publish
npm run publish:manual
```

### Method 2: GitHub Actions Manual Publishing (Optional)

You can also publish using GitHub Actions:

1. Go to your repository on GitHub
2. Click the **Actions** tab
3. Select **Test and Build** workflow
4. Click **Run workflow**
5. Select **master** branch  
6. Click **Run workflow**
7. The workflow will run tests, then require manual approval for publishing
8. Approve the deployment in the **Environments** section when ready

### Version Management

Use semantic versioning to indicate the type of changes:

- **Patch** (`1.0.0 → 1.0.1`): Bug fixes, documentation updates
- **Minor** (`1.0.0 → 1.1.0`): New features, backwards compatible
- **Major** (`1.0.0 → 2.0.0`): Breaking changes

```bash
# Examples:
npm run version:patch   # Fixed a bug
npm run version:minor   # Added new MCP tool
npm run version:major   # Changed API interface
```

## Development Workflow

### Feature Development

```bash
# 1. Create feature branch
git checkout -b feature/new-tool

# 2. Make changes and commit
git add .
git commit -m "Add new design parsing tool"

# 3. Push and create PR
git push origin feature/new-tool
# Create PR on GitHub → triggers automated tests

# 4. After PR approval and merge:
# → No automatic publishing
# → Manual publishing when ready
```

### Testing

The GitHub Actions workflow automatically runs tests on:
- All pull requests
- Pushes to master branch  
- Manual workflow triggers

Tests include:
- Dependency installation
- TypeScript compilation
- Build verification
- ES module loading test

## Manual Publishing Scripts

The following scripts are available in `package.json`:

```bash
# Version management
npm run version:patch   # Increment patch version
npm run version:minor   # Increment minor version  
npm run version:major   # Increment major version

# Publishing
npm run publish:manual  # Build and publish to NPM

# Development
npm run build          # Compile TypeScript
npm run dev            # Watch mode compilation
npm run test           # Run tests
```

## Package Contents

The published NPM package includes:
- ✅ Compiled JavaScript files (`build/`)
- ✅ TypeScript declaration files (`*.d.ts`)
- ✅ Source maps for debugging
- ✅ README.md
- ✅ LICENSE file
- ❌ Source TypeScript files (excluded via .npmignore)
- ❌ Tests and development files (excluded)

## Publishing Checklist

Before publishing a new version:

- [ ] All changes merged to master branch
- [ ] Tests passing locally: `npm test`
- [ ] Build successful: `npm run build`
- [ ] Version updated: `npm run version:*`
- [ ] Changes documented in commit messages
- [ ] No sensitive data in build output

## Troubleshooting

### Common Issues

1. **NPM publish fails**: 
   ```bash
   # Check authentication
   npm whoami
   
   # Re-login if needed
   npm login
   ```

2. **Version already exists**:
   ```bash
   # Check current published version
   npm view supercomponents-server version
   
   # Update version before publishing
   npm run version:patch
   ```

3. **Build fails**:
   ```bash
   # Clean and rebuild
   rm -rf build/
   npm run build
   ```

4. **Permission denied**:
   - Verify you have publish permissions for the package
   - Check if package name is available: `npm view supercomponents-server`

### Debug Commands

```bash
# Test build locally
npm run build

# Check what will be published
npm pack
tar -tzf *.tgz

# Verify package contents
npm publish --dry-run

# Check NPM authentication
npm whoami

# View package info
npm view supercomponents-server
```

## Files Created/Modified

This deployment setup includes:
- `package.json` - Updated with manual publishing scripts
- `.npmignore` - Controls what gets published
- `tsconfig.json` - TypeScript compilation settings
- `.github/workflows/release.yml` - GitHub Actions for testing and optional manual publishing
- `LICENSE` - MIT license file
- `DEPLOYMENT.md` - This documentation

## Team Workflow

### Recommended Process

1. **Development**: Work on feature branches, create PRs
2. **Testing**: GitHub Actions automatically tests all PRs
3. **Merging**: Merge PRs to master after review
4. **Versioning**: Use `npm run version:*` to update version
5. **Publishing**: Use `npm run publish:manual` when ready to release

### Publishing Schedule

Since publishing is manual, the team can decide when to release:
- **Immediately**: For critical bug fixes
- **Weekly**: For regular feature releases  
- **Milestone-based**: For major version releases

## Security Notes

- NPM tokens have publish permissions - keep them secure
- GitHub Actions manual publishing requires approval
- Only publish from master branch
- Verify package contents before publishing

The deployment system is now ready for manual publishing! 🚀 