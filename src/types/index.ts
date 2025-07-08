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

// W3C Design Tokens v1 schema interfaces
export interface W3CDesignToken {
  $type: string;
  $value: any;
  $description?: string;
}

export interface W3CDesignTokens {
  [key: string]: W3CDesignToken | W3CDesignTokens;
  color?: {
    primary?: { [key: string]: W3CDesignToken };
    secondary?: { [key: string]: W3CDesignToken };
    neutral?: { [key: string]: W3CDesignToken };
    semantic?: {
      success?: W3CDesignToken;
      warning?: W3CDesignToken;
      error?: W3CDesignToken;
      info?: W3CDesignToken;
    };
  };
  typography?: {
    fontFamily?: { [key: string]: W3CDesignToken };
    fontSize?: { [key: string]: W3CDesignToken };
    fontWeight?: { [key: string]: W3CDesignToken };
    lineHeight?: { [key: string]: W3CDesignToken };
  };
  spacing?: { [key: string]: W3CDesignToken };
  sizing?: { [key: string]: W3CDesignToken };
  borderRadius?: { [key: string]: W3CDesignToken };
  shadow?: { [key: string]: W3CDesignToken };
  transition?: {
    duration?: { [key: string]: W3CDesignToken };
    timingFunction?: { [key: string]: W3CDesignToken };
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