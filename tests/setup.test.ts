// tests/setup.test.ts
describe('Project Setup', () => {
  test('should have a working test environment', () => {
    expect(true).toBe(true);
  });

  test('should be able to run TypeScript tests', () => {
    const greeting = (name: string): string => `Hello, ${name}!`;
    expect(greeting('SuperComponents')).toBe('Hello, SuperComponents!');
  });

  test('should have Node.js environment available', () => {
    expect(process.env.NODE_ENV).toBeDefined();
  });
}); 