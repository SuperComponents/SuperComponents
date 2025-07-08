import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta = {
  title: 'Foundations/Principles',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Design principles that guide our design decisions and ensure consistency across all components.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const PrinciplesContent = () => (
  <div style={{ 
    width: '100%', 
    padding: '20px',
    background: '#f5f5f5',
    minHeight: '100vh'
  }}>
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{
        background: 'white',
        padding: '40px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        lineHeight: '1.6'
      }}>
        <h1 style={{ margin: '0 0 16px 0', color: '#333' }}>Design Principles</h1>
        <p style={{ margin: '0 0 32px 0', color: '#666', fontSize: '18px' }}>
          These principles guide our design decisions and ensure consistency across all components and experiences.
        </p>
        
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ margin: '0 0 16px 0', color: '#333' }}>1. Visual Hierarchy</h2>
          <p style={{ margin: '0', color: '#555' }}>
            Our design system emphasizes modern and clean visual hierarchy through balanced spacing and clear typographic scales. 
            Every element serves a purpose in guiding users through their journey, creating intuitive paths that reduce cognitive 
            load while maintaining visual appeal.
          </p>
        </div>
        
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ margin: '0 0 16px 0', color: '#333' }}>2. Consistency & Coherence</h2>
          <p style={{ margin: '0', color: '#555' }}>
            Modern and clean design language ensures consistency across all touchpoints. Our harmonious component library 
            maintains coherence through standardized patterns, unified color palettes, and systematic spacing that creates 
            a seamless user experience.
          </p>
        </div>
        
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ margin: '0 0 16px 0', color: '#333' }}>3. Accessibility & Inclusion</h2>
          <p style={{ margin: '0', color: '#555' }}>
            Accessibility is fundamental to our modern and clean approach. We design for diverse abilities and needs, 
            ensuring our interfaces are usable by everyone. This includes proper contrast ratios, keyboard navigation, 
            screen reader support, and clear visual indicators for all interactive elements.
          </p>
        </div>
        
        <div style={{ marginBottom: '0' }}>
          <h2 style={{ margin: '0 0 16px 0', color: '#333' }}>4. Performance & Efficiency</h2>
          <p style={{ margin: '0', color: '#555' }}>
            Our modern and clean design system prioritizes performance through optimized component architecture. 
            We focus on fast loading times, efficient interactions, and lightweight implementations that don't 
            compromise on visual quality or user experience.
          </p>
        </div>
      </div>
    </div>
  </div>
);

export const Overview: Story = {
  render: () => <PrinciplesContent />,
  parameters: {
    docs: {
      description: {
        story: 'Our foundational design principles that guide every decision in the design system.',
      },
    },
  },
};
