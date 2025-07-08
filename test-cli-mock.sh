#!/bin/bash

# Test CLI with mock setup for Definition of Done validation
# This script tests CLI structure and workflow without requiring OpenAI API

echo "🧪 Testing CLI structure and validation..."

# Test 1: CLI help command
echo "📝 Test 1: CLI help"
npm run inspiration-to-system -- --help
if [ $? -eq 0 ]; then
    echo "✅ CLI help works"
else
    echo "❌ CLI help failed"
    exit 1
fi

# Test 2: CLI version command  
echo "📝 Test 2: CLI version"
npm run inspiration-to-system -- --version
if [ $? -eq 0 ]; then
    echo "✅ CLI version works"
else
    echo "❌ CLI version failed"
    exit 1
fi

# Test 3: CLI with missing required input (should fail gracefully)
echo "📝 Test 3: CLI validation"
npm run inspiration-to-system -- --output /tmp/test-out 2>&1 | grep -q "Must provide either"
if [ $? -eq 0 ]; then
    echo "✅ CLI validation works"
else
    echo "❌ CLI validation failed"
    exit 1
fi

echo "🎉 All CLI structure tests passed!"
echo ""
echo "📋 For full CLI end-to-end testing with real OpenAI API:"
echo "   export OPENAI_API_KEY='your-key-here'"
echo "   npm run inspiration-to-system -- --description 'Sample inspiration' --output /tmp/out"
