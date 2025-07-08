// examples/llm-example.ts
import { complete, streamComplete, getCurrentProvider, validateApiKey } from '../src/llm/index';

async function demonstrateLLMIntegration() {
  console.log('=== SuperComponents LLM Integration Demo ===\n');

  // Check API key validation
  const hasValidKey = validateApiKey();
  console.log(`✓ API Key Valid: ${hasValidKey}`);

  // Show current provider
  const currentProvider = getCurrentProvider();
  console.log(`✓ Current Provider: ${currentProvider.name} (${currentProvider.hasKey ? 'Ready' : 'No API Key'})\n`);

  if (!hasValidKey) {
    console.log('⚠️  Please set either OPENAI_API_KEY or ANTHROPIC_API_KEY environment variable');
    return;
  }

  try {
    // Example 1: Basic completion
    console.log('--- Example 1: Basic Completion ---');
    const response1 = await complete('Explain what a design system is in 2 sentences.');
    console.log(`Response: ${response1}\n`);

    // Example 2: Completion with options
    console.log('--- Example 2: Completion with Custom Options ---');
    const response2 = await complete('List 3 benefits of component libraries.', {
      max_tokens: 150,
      temperature: 0.7
    });
    console.log(`Response: ${response2}\n`);

    // Example 3: Streaming completion
    console.log('--- Example 3: Streaming Completion ---');
    console.log('Streaming response:');
    let streamedContent = '';
    for await (const chunk of streamComplete('Write a brief overview of TypeScript benefits.')) {
      process.stdout.write(chunk);
      streamedContent += chunk;
    }
    console.log('\n');

    // Example 4: Provider-specific models
    console.log('--- Example 4: Provider-Specific Models ---');
    if (currentProvider.name === 'anthropic') {
      const anthropicResponse = await complete('What is component composition?', {
        model: 'claude-sonnet-4-20250514',
        max_tokens: 100
      });
      console.log(`Anthropic Response: ${anthropicResponse}\n`);
    } else if (currentProvider.name === 'openai') {
      const openaiResponse = await complete('What is component composition?', {
        model: 'gpt-4o',
        max_tokens: 100
      });
      console.log(`OpenAI Response: ${openaiResponse}\n`);
    }

    console.log('✅ All examples completed successfully!');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run the demo if this file is executed directly
if (require.main === module) {
  demonstrateLLMIntegration();
}

export { demonstrateLLMIntegration }; 