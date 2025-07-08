#!/bin/bash

# Test the inspiration-to-system CLI workflow
echo "🎨 Testing inspiration-to-system CLI workflow..."

# Create a test output directory
OUTPUT_DIR="./test-design-system"
rm -rf "$OUTPUT_DIR"

# Test with image URL
echo "Testing with image URL..."
node dist/cli.js \
  --image "https://images.unsplash.com/photo-1586473219010-2ffc57b0d282?w=800" \
  --brand "modern, minimal, tech" \
  --industry "technology" \
  --audience "developers and designers" \
  --style "modern,minimal" \
  --colors "#3b82f6,#10b981,#f59e0b" \
  --accessibility "enhanced" \
  --output "$OUTPUT_DIR"

# Check if files were generated
if [ -d "$OUTPUT_DIR" ]; then
  echo "✅ Success! Files generated in $OUTPUT_DIR"
  echo "Generated files:"
  find "$OUTPUT_DIR" -type f -name "*.md" -o -name "*.json" -o -name "*.css" | sort
else
  echo "❌ Failed to generate design system"
  exit 1
fi

echo ""
echo "📋 Next steps:"
echo "1. cd $OUTPUT_DIR"
echo "2. npm install"
echo "3. npm run storybook"
echo "4. Open http://localhost:6006 to view the design system"
