import { W3CDesignTokens } from '../tokens.js';
import { ComponentSpec } from '../../types/index.js';
import { generateButton } from './Button/generator.js';
import { generateInput } from './Input/generator.js';
import { generateCard } from './Card/generator.js';
import { generateModal } from './Modal/generator.js';
import { promises as fs } from 'fs';
import { join } from 'path';

export interface ComponentGeneratorOptions {
  outputDir: string;
  generateTests?: boolean;
  generateStories?: boolean;
  includeTailwind?: boolean;
}

export class ComponentFactory {
  private options: ComponentGeneratorOptions;

  constructor(options: ComponentGeneratorOptions) {
    this.options = {
      generateTests: true,
      generateStories: true,
      includeTailwind: true,
      ...options
    };
  }

  /**
   * Generate all 4 atomic components with tests and stories
   */
  async generate(tokens: W3CDesignTokens): Promise<void> {
    const components = [
      { name: 'Button', generator: generateButton },
      { name: 'Input', generator: generateInput },
      { name: 'Card', generator: generateCard },
      { name: 'Modal', generator: generateModal }
    ];

    // Ensure output directory exists
    await this.ensureDirectory(this.options.outputDir);

    // Generate each component
    for (const component of components) {
      const componentDir = join(this.options.outputDir, component.name);
      await this.ensureDirectory(componentDir);

      // Generate component files
      const files = await component.generator(tokens, this.options);
      
      // Write files to disk
      for (const [filename, content] of Object.entries(files)) {
        const filePath = join(componentDir, filename);
        await fs.writeFile(filePath, content, 'utf8');
      }

      console.log(`✓ Generated ${component.name} component`);
    }

    // Generate barrel exports
    await this.generateBarrelExports();
    
    console.log('✓ Component factory generation complete');
  }

  private async ensureDirectory(dir: string): Promise<void> {
    try {
      await fs.mkdir(dir, { recursive: true });
    } catch (error) {
      // Directory already exists
    }
  }

  private async generateBarrelExports(): Promise<void> {
    const indexContent = `// Generated component exports
export { Button } from './Button/Button.js';
export { Input } from './Input/Input.js';
export { Card } from './Card/Card.js';
export { Modal } from './Modal/Modal.js';

// Export types
export type { ButtonProps } from './Button/Button.js';
export type { InputProps } from './Input/Input.js';
export type { CardProps } from './Card/Card.js';
export type { ModalProps } from './Modal/Modal.js';
`;

    await fs.writeFile(join(this.options.outputDir, 'index.ts'), indexContent, 'utf8');
  }
}

export default ComponentFactory;
