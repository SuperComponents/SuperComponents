# Troubleshooting Guide

## Common Issues

### Installation Issues

#### "Cannot find module '@modelcontextprotocol/sdk'"
**Solution:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### "Node version not supported"
**Solution:**
```bash
# Check Node version
node --version

# Update to Node 18 or higher
nvm install 18
nvm use 18
```

### CLI Issues

#### "LLM service not configured"
**Problem:** OpenAI API key not set
**Solution:**
```bash
# Set environment variable
export OPENAI_API_KEY="sk-..."

# Or add to .env file
echo "OPENAI_API_KEY=sk-..." >> .env
```

#### "No inspiration provided"
**Problem:** No input source specified
**Solution:**
```bash
# Provide at least one input source
npx inspiration-to-system --image "https://example.com/image.jpg"
# OR
npx inspiration-to-system --description "Modern tech startup"
```

#### "Failed to generate design system"
**Possible causes:**
1. Invalid API key
2. Network connectivity issues
3. Inaccessible image URL
4. API rate limits

**Solutions:**
```bash
# Check API key
curl -H "Authorization: Bearer $OPENAI_API_KEY" https://api.openai.com/v1/models

# Test network connectivity
ping api.openai.com

# Try with different input
npx inspiration-to-system --description "simple design system"
```

### Generation Issues

#### "Accessibility validation failed"
**Problem:** Generated tokens don't meet WCAG AA standards
**Solution:**
```bash
# Check the accessibility report
cat ./design-system/tokens/accessibility-report.md

# Adjust color preferences for better contrast
npx inspiration-to-system --image "..." --colors "#000000,#ffffff"
```

#### "Component generation failed"
**Problem:** Error in component scaffolding
**Solution:**
```bash
# Check output directory permissions
ls -la ./design-system/

# Try with different output directory
npx inspiration-to-system --image "..." --output ./temp-system
```

### Build Issues

#### "TypeScript compilation failed"
**Solution:**
```bash
# Check TypeScript configuration
npm run typecheck

# Fix type errors
npm run lint --fix
```

#### "Storybook build failed"
**Solution:**
```bash
# Check Storybook configuration
npm run storybook

# Clear Storybook cache
rm -rf node_modules/.cache
```

### Testing Issues

#### "Tests failing after generation"
**Solution:**
```bash
# Run tests with verbose output
npm test --verbose

# Update snapshots if needed
npm test --updateSnapshot
```

#### "Coverage below 90%"
**Solution:**
```bash
# Check coverage report
npm run test:coverage

# Add missing tests for uncovered code
```

## Debug Mode

### Enable Debug Logging
```bash
# Set debug environment variable
export DEBUG=supercomp:*

# Run CLI with debug output
npm run cli --description "test" --output ./debug-output
```

### Check Generated Files
```bash
# List all generated files
find ./design-system -type f -name "*.json" -o -name "*.md" -o -name "*.tsx"

# Validate JSON files
jq . ./design-system/tokens/design-tokens.json
jq . ./design-system/.supercomponents/metadata.json
```

### Inspect Token Generation
```bash
# Check token structure
cat ./design-system/tokens/design-tokens.json | jq '.colors'

# Validate Tailwind config
node -e "console.log(require('./design-system/tailwind.config.ts'))"
```

## Performance Issues

### Large Image Processing
**Problem:** Slow processing of large images
**Solution:**
```bash
# Use smaller images or optimize before processing
# Consider using description instead of image
npx inspiration-to-system --description "based on modern design"
```

### Memory Issues
**Problem:** Out of memory errors
**Solution:**
```bash
# Increase Node memory limit
NODE_OPTIONS="--max-old-space-size=4096" npx inspiration-to-system --image "..."
```

## Network Issues

### Proxy Configuration
**Problem:** Behind corporate firewall
**Solution:**
```bash
# Configure proxy
export HTTP_PROXY=http://proxy.company.com:8080
export HTTPS_PROXY=https://proxy.company.com:8080

# Or use .env file
echo "HTTP_PROXY=http://proxy.company.com:8080" >> .env
```

### SSL Certificate Issues
**Problem:** SSL certificate errors
**Solution:**
```bash
# Disable SSL verification (not recommended for production)
export NODE_TLS_REJECT_UNAUTHORIZED=0

# Or add certificate to trusted store
```

## API Issues

### Rate Limiting
**Problem:** "Rate limit exceeded" errors
**Solution:**
```bash
# Wait and retry
sleep 60

# Use different API tier if available
export OPENAI_MODEL=gpt-4

# Reduce request frequency
```

### API Key Issues
**Problem:** "Invalid API key" errors
**Solution:**
```bash
# Check API key format
echo $OPENAI_API_KEY | grep -E "^sk-[a-zA-Z0-9]+$"

# Regenerate API key from OpenAI dashboard
# Update environment variable
```

## File System Issues

### Permission Errors
**Problem:** Cannot write to output directory
**Solution:**
```bash
# Check directory permissions
ls -la ./design-system/

# Fix permissions
chmod 755 ./design-system/
```

### Disk Space Issues
**Problem:** "No space left on device"
**Solution:**
```bash
# Check available space
df -h

# Clean up temporary files
rm -rf ./design-system/
```

## Validation Issues

### WCAG Compliance
**Problem:** Accessibility validation failures
**Solution:**
```bash
# Review accessibility report
cat ./design-system/tokens/accessibility-report.md

# Use high contrast colors
npx inspiration-to-system --colors "#000000,#ffffff" --accessibility enterprise
```

### Component Validation
**Problem:** Generated components don't compile
**Solution:**
```bash
# Check TypeScript errors
cd ./design-system
npm run typecheck

# Fix import issues
npm install
```

## Development Issues

### Hot Reload Not Working
**Solution:**
```bash
# Restart development server
npm run dev

# Check for TypeScript errors
npm run typecheck
```

### Storybook Not Loading
**Solution:**
```bash
# Clear Storybook cache
rm -rf node_modules/.cache

# Restart Storybook
npm run storybook
```

## Getting Help

### Log Collection
When reporting issues, include:
```bash
# System information
node --version
pnpm --version
uname -a

# Error logs
DEBUG=supercomp:* npx inspiration-to-system --description "test" 2>&1 | tee debug.log

# Generated file structure
find ./design-system -type f | head -20
```

### Minimal Reproduction
Create a minimal example:
```bash
# Simplest possible command that reproduces the issue
npx inspiration-to-system --description "simple test"
```

### Bug Reports
Include in GitHub issues:
- Operating system and version
- Node.js version
- Command used
- Error messages
- Expected vs actual behavior
- Debug logs

### Feature Requests
When requesting features:
- Describe the use case
- Provide examples
- Explain expected behavior
- Consider implementation complexity

## Recovery Procedures

### Clean Installation
```bash
# Remove everything and start fresh
rm -rf node_modules package-lock.json
rm -rf ./design-system/
npm install
```

### Reset Configuration
```bash
# Remove generated files
rm -rf ./design-system/

# Reset environment
unset OPENAI_API_KEY
export OPENAI_API_KEY="sk-..."
```

### Rollback Changes
```bash
# Revert to last working version
git checkout HEAD~1

# Or reset to specific commit
git reset --hard <commit-hash>
```
