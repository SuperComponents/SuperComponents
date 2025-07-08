#!/bin/bash
set -e

echo "🧪 Testing CLI with sample description..."

# Test CLI with minimal description
npx tsx bin/inspiration-to-system.ts \
  --description "Modern SaaS application with clean design" \
  --brand-keywords "modern,professional,clean" \
  --industry-type "technology" \
  --output "./test-output" \
  --verbose

echo "✅ CLI test completed successfully!"
echo "📁 Check ./test-output for generated files"
