#!/bin/bash
set -e

echo "🧪 Testing CLI functionality..."

# Test CLI help
echo "📋 Testing CLI help..."
npm run inspiration-to-system -- --help || {
  echo "❌ CLI help failed"
  exit 1
}

# Test CLI version
echo "📋 Testing CLI version..."
npm run inspiration-to-system -- --version || {
  echo "❌ CLI version failed"
  exit 1
}

# Test CLI validation (should fail without API key)
echo "📋 Testing CLI validation..."
npm run inspiration-to-system -- --description "Test" --output /tmp/test-cli 2>&1 | grep -q "Error" && {
  echo "✅ CLI validation works (expected error without API key)"
} || {
  echo "❌ CLI validation unexpected behavior"
  exit 1
}

# Test JSON inspiration parsing
echo "📋 Testing JSON inspiration parsing..."
if [ -f "fixtures/inspiration/sample.json" ]; then
  # Test that we can parse the JSON
  jq empty fixtures/inspiration/sample.json || {
    echo "❌ Sample inspiration JSON is invalid"
    exit 1
  }
  echo "✅ Sample inspiration JSON is valid"
else
  echo "❌ Sample inspiration JSON not found"
  exit 1
fi

echo "✅ All CLI tests passed!"
