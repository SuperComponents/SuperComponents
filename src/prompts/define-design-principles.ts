export function defineDesignPrinciplesPrompt(args?: any) {
  return {
    messages: [
      {
        role: 'user',
        content: {
          type: 'text',
          text: `Let's establish the north-star design principles for your component library. I'll guide you through a series of questions to help define your design system's foundation.

Please answer the following questions:

1. **Brand Identity**: What is the core identity of your brand or product? (e.g., professional, playful, minimal, bold)

2. **Target Audience**: Who are the primary users of your application? What are their needs and expectations?

3. **Core Values**: What are the 3-5 most important values your design should communicate? (e.g., simplicity, accessibility, innovation)

4. **Visual Personality**: How should your design feel? (e.g., warm and inviting, cool and sophisticated, energetic and dynamic)

5. **Design Goals**: What specific goals should your design system achieve? (e.g., consistency across products, faster development, better accessibility)

6. **Constraints**: Are there any specific constraints or requirements? (e.g., WCAG compliance, mobile-first, performance budgets)

Based on your answers, I'll help you create a comprehensive design principles document that will guide all future design decisions.`,
        },
      },
    ],
  }
}
