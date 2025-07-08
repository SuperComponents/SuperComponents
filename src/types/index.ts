export interface DesignPrinciples {
  brandIdentity: string;
  targetAudience: string;
  coreValues: string[];
  designGoals: string[];
  constraints?: string[];
}

export interface DesignTokens {
  colors: {
    [key: string]: string;
  };
  typography: {
    fonts: string[];
    sizes: { [key: string]: string };
    weights: { [key: string]: number };
    lineHeights: { [key: string]: string };
  };
  spacing: {
    [key: string]: string;
  };
  borderRadius: {
    [key: string]: string;
  };
  shadows?: {
    [key: string]: string;
  };
}

export interface DesignInsight {
  imageryPalette: string[];      // hex colors, length ≤ 8
  typographyFamilies: string[];  // font names
  spacingScale: number[];        // e.g. [4,8,12,16]
  uiDensity: "compact" | "regular" | "spacious";
  brandKeywords: string[];
  supportingReferences: string[]; // image crop URLs or CSS snippets
}

export interface ComponentSpec {
  name: string;
  category: 'atom' | 'molecule' | 'organism';
  description: string;
  props?: Record<string, any>;
  variants?: string[];
  accessibility?: string[];
  dependencies?: string[];
}