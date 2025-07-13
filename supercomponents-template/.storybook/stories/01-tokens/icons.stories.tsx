import * as React from "react";
// React Simple Icons Components
import { 
  SiReact, 
  SiVite, 
  SiTailwindcss, 
  SiStorybook, 
  SiTypescript,
  SiGithub,
  SiGoogle,
  SiFigma,
  SiVercel,
  SiNetlify,
  SiReactHex,
  SiViteHex,
  SiTailwindcssHex,
  SiStorybookHex,
  SiTypescriptHex
} from "@icons-pack/react-simple-icons";
// Raw Simple Icons (alternative approach)
import { siApple, siGoogle, siGithub, siReact, siTypescript } from "simple-icons";
import type { Meta, StoryObj } from "@storybook/react";

type IconDemo = {
  name: string;
  component: React.ReactNode;
  category: string;
};

type RawIconDemo = {
  name: string;
  icon: any;
  category: string;
};

const IconTile = ({ name, component, category }: IconDemo) => {
  return (
    <div className="flex flex-col items-center gap-2 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
      <div className="flex items-center justify-center w-12 h-12">
        {component}
      </div>
      <p className="text-center text-xs font-medium">{name}</p>
      <p className="text-center text-xs opacity-70">{category}</p>
    </div>
  );
};

const RawIconTile = ({ name, icon, category }: RawIconDemo) => {
  return (
    <div className="flex flex-col items-center gap-2 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
      <div 
        className="w-8 h-8"
        dangerouslySetInnerHTML={{ __html: icon.svg }}
        style={{ color: `#${icon.hex}` }}
      />
      <p className="text-center text-xs font-medium">{name}</p>
      <p className="text-center text-xs opacity-70">{category}</p>
      <p className="text-center text-xs opacity-50">#{icon.hex}</p>
    </div>
  );
};

/**
 * Brand icons using Simple Icons library
 */
const meta: Meta<{
  reactIcons: IconDemo[];
  rawIcons: RawIconDemo[];
}> = {
  title: "design tokens/Icons",
  tags: ["autodocs"],
  argTypes: {},
  render: (args) => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">React Simple Icons (Recommended)</h3>
        <p className="text-sm text-gray-600 mb-4">
          Pre-built React components from @icons-pack/react-simple-icons. Easy to use with props for size, color, and styling.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {args.reactIcons.map((iconData, index) => (
            <IconTile key={index} {...iconData} />
          ))}
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Raw Simple Icons (Advanced)</h3>
        <p className="text-sm text-gray-600 mb-4">
          Raw SVG data from simple-icons package. Requires manual handling but provides access to all metadata.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {args.rawIcons.map((iconData, index) => (
            <RawIconTile key={index} {...iconData} />
          ))}
        </div>
      </div>

      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-medium mb-2">Usage Examples:</h4>
        <div className="space-y-2 text-sm">
          <div>
            <code className="bg-white px-2 py-1 rounded text-xs">
              {`import { SiReact } from '@icons-pack/react-simple-icons';`}
            </code>
          </div>
          <div>
            <code className="bg-white px-2 py-1 rounded text-xs">
              {`<SiReact size={24} color="#61DAFB" />`}
            </code>
          </div>
          <div>
            <code className="bg-white px-2 py-1 rounded text-xs">
              {`<SiReact color="default" size={32} />  // Uses brand color`}
            </code>
          </div>
          <div>
            <code className="bg-white px-2 py-1 rounded text-xs">
              {`<SiReact color={SiReactHex} size={24} />  // Using hex constant`}
            </code>
          </div>
        </div>
      </div>
    </div>
  ),
};

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * Collection of popular brand icons commonly used in web development
 */
export const Core: Story = {
  args: {
    reactIcons: [
      { 
        name: "React", 
        component: <SiReact size={32} color={SiReactHex} />, 
        category: "Framework" 
      },
      { 
        name: "TypeScript", 
        component: <SiTypescript size={32} color={SiTypescriptHex} />, 
        category: "Language" 
      },
      { 
        name: "Vite", 
        component: <SiVite size={32} color={SiViteHex} />, 
        category: "Build Tool" 
      },
      { 
        name: "Tailwind CSS", 
        component: <SiTailwindcss size={32} color={SiTailwindcssHex} />, 
        category: "Styling" 
      },
      { 
        name: "Storybook", 
        component: <SiStorybook size={32} color={SiStorybookHex} />, 
        category: "Development" 
      },
      { 
        name: "GitHub", 
        component: <SiGithub size={32} color="#181717" />, 
        category: "Platform" 
      },
      { 
        name: "Figma", 
        component: <SiFigma size={32} color="#F24E1E" />, 
        category: "Design" 
      },
      { 
        name: "Vercel", 
        component: <SiVercel size={32} color="#000000" />, 
        category: "Hosting" 
      },
      { 
        name: "Netlify", 
        component: <SiNetlify size={32} color="#00C7B7" />, 
        category: "Hosting" 
      },
      { 
        name: "Google", 
        component: <SiGoogle size={32} color="#4285F4" />, 
        category: "Platform" 
      },
    ],
    rawIcons: [
      { name: "Apple", icon: siApple, category: "Brand" },
      { name: "Google", icon: siGoogle, category: "Brand" },
      { name: "GitHub", icon: siGithub, category: "Platform" },
      { name: "React", icon: siReact, category: "Framework" },
      { name: "TypeScript", icon: siTypescript, category: "Language" },
    ]
  },
};

/**
 * Examples showing different sizes and color variations
 */
export const Variations: Story = {
  args: {
    reactIcons: [
      { 
        name: "Small (16px)", 
        component: <SiReact size={16} color={SiReactHex} />, 
        category: "Size" 
      },
      { 
        name: "Medium (24px)", 
        component: <SiReact size={24} color={SiReactHex} />, 
        category: "Size" 
      },
      { 
        name: "Large (32px)", 
        component: <SiReact size={32} color={SiReactHex} />, 
        category: "Size" 
      },
      { 
        name: "Custom Color", 
        component: <SiReact size={32} color="#ff6b6b" />, 
        category: "Color" 
      },
      { 
        name: "Default Color", 
        component: <SiReact size={32} color="default" />, 
        category: "Color" 
      },
      { 
        name: "Current Color", 
        component: <div style={{ color: '#9333ea' }}><SiReact size={32} color="currentColor" /></div>, 
        category: "Color" 
      },
    ],
    rawIcons: []
  },
}; 