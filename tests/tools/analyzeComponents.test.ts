// tests/tools/analyzeComponents.test.ts
import { describe, it, expect, beforeEach, afterEach, beforeAll } from '@jest/globals';
import { writeFileSync, mkdirSync, rmSync } from 'fs';
import { join } from 'path';
import { analyzeComponentsTool } from '../../src/tools/analyzeComponents.js';
import { initializeLogger } from '../../src/utils/logger.js';

describe('analyzeComponents Tool', () => {
  const testDir = join(process.cwd(), 'test-components');
  
  beforeAll(() => {
    // Initialize logger for tests
    initializeLogger({
      logLevel: 'error',
      nodeEnv: 'test'
    });
  });
  
  beforeEach(() => {
    // Create test directory
    mkdirSync(testDir, { recursive: true });
  });
  
  afterEach(() => {
    // Clean up test directory
    rmSync(testDir, { recursive: true, force: true });
  });
  
  it('should analyze function components correctly', async () => {
    // Create test component file
    const componentCode = `
import React from 'react';

function Button({ title, onClick, disabled = false }) {
  return (
    <button onClick={onClick} disabled={disabled}>
      {title}
    </button>
  );
}

export default Button;
`;
    
    writeFileSync(join(testDir, 'Button.jsx'), componentCode);
    
    // Test the tool
    const result = await analyzeComponentsTool.handler({
      paths: [testDir],
      maxFiles: 10
    });
    
    expect(result.content).toHaveLength(1);
    expect(result.content[0].type).toBe('text');
    
    const analysis = JSON.parse(result.content[0].text);
    expect(analysis.components).toHaveLength(1);
    expect(analysis.components[0].name).toBe('Button');
    expect(analysis.components[0].props).toBeDefined();
    expect(analysis.errors).toHaveLength(0);
  });
  
  it('should analyze class components correctly', async () => {
    // Create test component file
    const componentCode = `
import React, { Component } from 'react';

class Card extends Component {
  static propTypes = {
    title: PropTypes.string.isRequired,
    children: PropTypes.node
  };
  
  render() {
    return (
      <div className="card">
        <h2>{this.props.title}</h2>
        {this.props.children}
      </div>
    );
  }
}

export default Card;
`;
    
    writeFileSync(join(testDir, 'Card.jsx'), componentCode);
    
    // Test the tool
    const result = await analyzeComponentsTool.handler({
      paths: [testDir],
      maxFiles: 10
    });
    
    const analysis = JSON.parse(result.content[0].text);
    expect(analysis.components).toHaveLength(1);
    expect(analysis.components[0].name).toBe('Card');
  });
  
  it('should analyze arrow function components correctly', async () => {
    // Create test component file
    const componentCode = `
import React from 'react';

const Alert = ({ message, type = 'info' }) => {
  return (
    <div className={\`alert alert-\${type}\`}>
      {message}
    </div>
  );
};

export default Alert;
`;
    
    writeFileSync(join(testDir, 'Alert.jsx'), componentCode);
    
    // Test the tool
    const result = await analyzeComponentsTool.handler({
      paths: [testDir],
      maxFiles: 10
    });
    
    const analysis = JSON.parse(result.content[0].text);
    expect(analysis.components).toHaveLength(1);
    expect(analysis.components[0].name).toBe('Alert');
  });
  
  it('should handle multiple components in one file', async () => {
    // Create test component file
    const componentCode = `
import React from 'react';

function Header({ title }) {
  return <h1>{title}</h1>;
}

const Footer = ({ copyright }) => {
  return <footer>{copyright}</footer>;
};

class Layout extends React.Component {
  render() {
    return (
      <div>
        <Header title="My App" />
        <main>{this.props.children}</main>
        <Footer copyright="2024" />
      </div>
    );
  }
}

export { Header, Footer };
export default Layout;
`;
    
    writeFileSync(join(testDir, 'Layout.jsx'), componentCode);
    
    // Test the tool
    const result = await analyzeComponentsTool.handler({
      paths: [testDir],
      maxFiles: 10
    });
    
    const analysis = JSON.parse(result.content[0].text);
    expect(analysis.components).toHaveLength(3);
    expect(analysis.components.map((c: any) => c.name).sort()).toEqual(['Footer', 'Header', 'Layout']);
  });
  
  it('should handle TypeScript components', async () => {
    // Create test component file
    const componentCode = `
import React from 'react';

interface Props {
  name: string;
  age?: number;
}

const User: React.FC<Props> = ({ name, age = 0 }) => {
  return (
    <div>
      <h2>{name}</h2>
      <p>Age: {age}</p>
    </div>
  );
};

export default User;
`;
    
    writeFileSync(join(testDir, 'User.tsx'), componentCode);
    
    // Test the tool
    const result = await analyzeComponentsTool.handler({
      paths: [testDir],
      maxFiles: 10,
      extensions: ['.tsx']
    });
    
    const analysis = JSON.parse(result.content[0].text);
    expect(analysis.components).toHaveLength(1);
    expect(analysis.components[0].name).toBe('User');
  });
  
  it('should handle malformed files gracefully', async () => {
    // Create malformed component file
    const malformedCode = `
import React from 'react'

function BrokenComponent( {
  return <div>Broken JSX
}
`;
    
    writeFileSync(join(testDir, 'Broken.jsx'), malformedCode);
    
    // Test the tool
    const result = await analyzeComponentsTool.handler({
      paths: [testDir],
      maxFiles: 10
    });
    
    const analysis = JSON.parse(result.content[0].text);
    expect(analysis.errors).toHaveLength(1);
    expect(analysis.errors[0]).toContain('Parse error');
  });
  
  it('should analyze naming patterns', async () => {
    // Create multiple component files with different naming patterns
    const files = [
      ['ButtonPrimary.jsx', 'function ButtonPrimary() { return <button>Primary</button>; }'],
      ['ButtonSecondary.jsx', 'function ButtonSecondary() { return <button>Secondary</button>; }'],
      ['CardHeader.jsx', 'function CardHeader() { return <div>Header</div>; }'],
      ['CardBody.jsx', 'function CardBody() { return <div>Body</div>; }'],
    ];
    
    files.forEach(([filename, code]) => {
      writeFileSync(join(testDir, filename), code);
    });
    
    // Test the tool
    const result = await analyzeComponentsTool.handler({
      paths: [testDir],
      maxFiles: 10,
      analyzePatterns: true
    });
    
    const analysis = JSON.parse(result.content[0].text);
    expect(analysis.components).toHaveLength(4);
    expect(analysis.patterns).toBeDefined();
    expect(Array.isArray(analysis.patterns)).toBe(true);
    expect(analysis.patterns.length).toBeGreaterThan(0);
  });
  
  it('should respect file limits', async () => {
    // Create more files than the limit
    for (let i = 0; i < 5; i++) {
      writeFileSync(join(testDir, `Component${i}.jsx`), `function Component${i}() { return <div>Component ${i}</div>; }`);
    }
    
    // Test with low file limit
    const result = await analyzeComponentsTool.handler({
      paths: [testDir],
      maxFiles: 3
    });
    
    const analysis = JSON.parse(result.content[0].text);
    expect(analysis.components.length).toBeLessThanOrEqual(3);
  });
  
  it('should handle empty directories', async () => {
    // Test with empty directory
    const emptyDir = join(testDir, 'empty');
    mkdirSync(emptyDir);
    
    const result = await analyzeComponentsTool.handler({
      paths: [emptyDir],
      maxFiles: 10
    });
    
    const analysis = JSON.parse(result.content[0].text);
    expect(analysis.components).toHaveLength(0);
    expect(analysis.recommendations).toContain('No component files found in the specified paths');
  });
}); 