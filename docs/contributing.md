# Contributing Guide

## Getting Started

### Prerequisites
- Node.js 18+
- npm package manager
- OpenAI API key for development

### Setup
```bash
# Clone the repository
git clone https://github.com/SuperComponents/SuperComponents.git
cd SuperComponents

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your OpenAI API key
```

### Development Workflow
```bash
# Start development server
npm run dev

# Run tests
npm test

# Run linting
npm run lint

# Type check
npm run typecheck

# Test CLI locally
npm run cli --description "test design system"
```

## Branch Strategy

### Main Branches
- `master` - Production-ready code only
- Never commit directly to `master`

### Feature Branches
- Create from `master`
- Format: `feature/description` or `feature/mvp-finish`
- Short-lived branches merged via PR

### Sub-branches (for complex features)
- Create from feature branch
- Format: `feature/mvp-finish/subtask`
- Merge back to parent feature branch

### Example Workflow
```bash
# Create feature branch
git checkout master
git pull origin master
git checkout -b feature/new-component

# Work on feature
git add .
git commit -m "feat: add new component generator"

# Push and create PR
git push -u origin feature/new-component
```

## Code Standards

### TypeScript
- Use strict mode
- Prefer interfaces over types
- Use Zod for runtime validation
- Export types from `src/types/index.ts`

### ESLint Rules
- No unused variables
- Prefer const over let
- Use meaningful variable names
- Add JSDoc comments for public APIs

### Prettier Formatting
- 2-space indentation
- Single quotes for strings
- Trailing commas
- Line length: 80 characters

### File Organization
```
src/
├── ai/              # AI analysis modules
├── generators/      # Token and component generators
├── tools/           # MCP tools
├── prompts/         # MCP prompts
├── workflows/       # Orchestration logic
├── utils/           # Utility functions
└── types/           # TypeScript interfaces
```

## Testing

### Test Structure
- Unit tests: `*.test.ts`
- Integration tests: `*.integration.test.ts`
- Fixtures: `fixtures/`

### Testing Guidelines
- Test public APIs
- Mock external dependencies
- Use descriptive test names
- Aim for >90% coverage

### Running Tests
```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test design-analyzer.test.ts

# Run in watch mode (default for vitest)
npm test
```

## Adding New Features

### 1. Create Issue
- Use issue templates
- Include acceptance criteria
- Add appropriate labels

### 2. Design API
- Update TypeScript interfaces
- Consider backward compatibility
- Document breaking changes

### 3. Implement
- Follow existing patterns
- Add comprehensive tests
- Update documentation

### 4. Test Integration
- Test with sample inspirations
- Validate generated artifacts
- Check accessibility compliance

## Pull Request Process

### Before Submitting
- [ ] All tests pass
- [ ] Linting passes
- [ ] Type checking passes
- [ ] Build succeeds
- [ ] Documentation updated
- [ ] Accessibility validated

### PR Requirements
- Clear description
- Link to related issues
- Include screenshots if UI changes
- Add reviewers

### Review Process
1. Automated CI checks
2. Code review by maintainers
3. Human testing of changes
4. Merge after approval

## Release Process

### Version Numbering
- Follow semantic versioning
- Major: Breaking changes
- Minor: New features
- Patch: Bug fixes

### Release Steps
1. Update version in `package.json`
2. Update CHANGELOG.md
3. Create release tag
4. Deploy to npm
5. Update documentation

## Debugging

### Common Issues
- API key not set
- Network connectivity
- File permissions
- Memory issues with large images

### Debug Tools
```bash
# Enable debug logging
DEBUG=supercomp:* npm run cli --description "test"

# Check generated files
ls -la ./design-system/

# Validate JSON output
jq . ./design-system/tokens/design-tokens.json
```

## Code Review Guidelines

### What to Look For
- Code quality and style
- Test coverage
- Documentation accuracy
- Performance implications
- Security considerations

### Review Checklist
- [ ] Code follows style guide
- [ ] Tests are comprehensive
- [ ] Documentation is updated
- [ ] No sensitive data exposed
- [ ] Error handling is appropriate

## Documentation

### Update Requirements
- README.md for user-facing changes
- API documentation for interface changes
- Code comments for complex logic
- Changelog for all changes

### Documentation Style
- Use clear, concise language
- Include code examples
- Provide troubleshooting tips
- Keep examples up-to-date

## Communication

### Channels
- GitHub Issues for bugs and features
- GitHub Discussions for questions
- Pull Request comments for code review

### Guidelines
- Be respectful and constructive
- Provide clear examples
- Help others learn
- Follow code of conduct

## Getting Help

### Resources
- [README.md](../README.md) - Getting started
- [API Reference](api.md) - Technical details
- [Troubleshooting](troubleshooting.md) - Common issues

### Support
- Open an issue for bugs
- Start a discussion for questions
- Check existing issues first
- Provide minimal reproduction examples
