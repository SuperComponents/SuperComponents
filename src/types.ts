// src/types.ts
export interface Tool {
  definition: {
    name: string;
    description: string;
    inputSchema: any;
  };
  handler: (args: any) => Promise<any>;
}

export interface Design {
  // Design interface placeholder
}

export interface Library {
  // Library interface placeholder
} 