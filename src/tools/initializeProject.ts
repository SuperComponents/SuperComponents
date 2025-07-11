/**
 * Clones the SCAFFOLD_REPO_BRANCH of the SCAFFOLD_REPO_URL and copies the 
 * SCAFFOLD_REPO_SUBDIR to the target path, then runs the supercomponents-setup script
 * in that template's package.json
 *
 * the branch should contain a scaffold from our project
 */

// src/tools/initializeProject.ts
import { z } from "zod";
import { execSync } from "child_process";
import { mkdirSync, existsSync } from "fs";
import { join } from "path";
import { Tool } from "../types.js";
import { zodToJsonSchema } from "../utils/validation.js";
import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';
import { getLogger } from '../utils/logger.js';
import { getTargetPath } from '../utils/fileSystem.js';

const SCAFFOLD_REPO_URL = 'https://github.com/SuperComponents/SuperComponents.git';
const SCAFFOLD_REPO_BRANCH = 'scaffolding-repo';
const SCAFFOLD_REPO_SUBDIR = 'supercomponents-template'

const inputSchema = z.object({
  path: z.string().optional().default('').describe("Project path where SuperComponents scaffolding will be initialized (defaults to caller's current directory)")
});

/**
 * Check if Node.js version meets minimum requirements
 */
function checkNodeVersion(): void {
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
  
  if (majorVersion < 20) {
    throw new McpError(
      ErrorCode.InvalidRequest,
      `🚨 INCOMPATIBLE NODE.JS VERSION: SuperComponents requires Node.js 20 or higher. Current version: ${nodeVersion}. The scaffolding template uses modern JavaScript features that require Node.js 20+.`
    );
  }
}


function parseInput(args: any) {
  let input;
  if (!args || (typeof args === 'object' && Object.keys(args).length === 0)) {
    input = {};
  } else {
    input = args;
  }
  return inputSchema.parse(input);
}

/**
 * Clones the scaffold repository and copies the specified subdirectory to the target path
 * @param targetPath - The path where the scaffold should be copied to
 * @returns Array of result messages
 */
function fetchScaffold(targetPath: string) {
  
  // Create a temporary directory for cloning
  const tempDir = join(targetPath, '.temp-supercomponents-' + Date.now());
  mkdirSync(tempDir, { recursive: true });
  
  try {
    // Clone the specific branch
    execSync(
      `git clone --depth 1 --branch ${SCAFFOLD_REPO_BRANCH} ${SCAFFOLD_REPO_URL} .`,
      { 
        cwd: tempDir, 
        stdio: 'inherit' 
      }
    );
    
    // Remove .git directory from temp folder before copying
    const tempGitDir = join(tempDir, '.git');
    if (existsSync(tempGitDir)) {
      execSync(`rm -rf ${tempGitDir}`, { stdio: 'inherit' });
    }
    
    // Path to the subdirectory we want to copy from
    const sourceDir = join(tempDir, SCAFFOLD_REPO_SUBDIR);
    
    // Check if the subdirectory exists
    if (!existsSync(sourceDir)) {
      throw new Error(`Subdirectory '${SCAFFOLD_REPO_SUBDIR}' not found in the repository`);
    }
    
    // Copy all files from the subdirectory to target directory
    // Use rsync to properly copy all files (including hidden) without duplicating
    execSync(`rsync -av --exclude='.git' ${sourceDir}/ ${targetPath}/`, { stdio: 'inherit' });
  } finally {
    // Always clean up the temp directory
    execSync(`rm -rf ${tempDir}`, { stdio: 'inherit' });
  }
}

export const initializeProjectTool: Tool = {
  definition: {
    name: "initializeProject",
    description: "Initialize a new SuperComponents project by fetching scaffolding from the SuperComponents repository.",
    inputSchema: zodToJsonSchema(inputSchema)
  },
  handler: async (args) => {

    const logger = getLogger();
    let path: string = '';

    try {
      logger.info('Starting SuperComponents project initialization...');
      
      // ⚠️ CRITICAL: Check Node.js version FIRST - this must be the primary error
      // This will throw an McpError that should bubble up immediately
      try {
        checkNodeVersion();
      } catch (error) {
        // If it's a Node.js version error, let it bubble up as the primary error
        if (error instanceof McpError) {
          return {
            success: false,
            message: `❌ ${error.message}`,
            path: path || 'unknown',
            fix_instructions: [
              "🔧 To fix this issue:",
              "1. Install Node.js 20 or higher from https://nodejs.org/",
              "2. Or use nvm: 'nvm install 20 && nvm use 20'",
              "3. Verify with: 'node --version'",
              "4. Then try initializing SuperComponents again"
            ]
          };
        }
        // If it's not an McpError, re-throw it
        throw error;
      }
    
      // Handle different input formats
      const input = parseInput(args)
      path = getTargetPath(input.path);

      if (!existsSync(path)) {
        throw new Error(`Project directory ${path} does not exist`);
      }

      let results: string[] = [];
      
      try {
        fetchScaffold(path);
        results.push("✅ SuperComponents scaffolding fetched successfully");
        
        execSync('npm run supercomponents-setup', { 
          cwd: path, 
          stdio: 'inherit',
          // DEV env so devDependencies are installed
          env: { ...process.env, NODE_ENV: 'development' }
        });
        
        results.push("✅ SuperComponents setup completed successfully");
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to fetch scaffolding: ${errorMessage}`);
      }
      
      return {
        success: true,
        message: `✅ SuperComponents project initialized successfully`,
        path: path,
        results: results,
        next_steps: [
          "🚀 Your SuperComponents project is ready! Follow these steps:",
          "",
          "📋 STEP 1: Open TWO separate terminals in your project directory:",
          "   Terminal 1: For the development server",
          "   Terminal 2: For Storybook",
          "   ⚠️  Both commands run continuously - keep both terminals open!",
          "",
          "🖥️  STEP 2: In Terminal 1, run:",
          "   npm run dev",
          "   (This starts the React development server at http://localhost:5173)",
          "   💡 Keep this terminal running while developing",
          "",
          "📚 STEP 3: In Terminal 2, run:",
          "   npm run storybook", 
          "   (This starts Storybook at http://localhost:6006)",
          "   💡 Keep this terminal running to view your component library",
          "",
          "✨ STEP 4: Start building your component library!",
          "   - Check the README.md for more information",
          "   - Use SuperComponents MCP tools to generate design tokens and components",
          "   - Visit http://localhost:5173 to see your React app",
          "   - Visit http://localhost:6006 to see your Storybook",
          "",
          "🔧 Available SuperComponents MCP tools:",
          "   - parseDesignAndGenerateTokens: Create design tokens from descriptions",
          "   - createTokenStories: Generate Storybook stories for your tokens",
          "   - analyze_components: Analyze your component structure", 
          "   - generateInstruction: Generate implementation instructions",
          "",
          "🤖 NOTE: These are manual steps for you to run. The AI cannot manage multiple terminals."
        ]
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return {
        success: false,
        message: `❌ Failed to initialize project: ${errorMessage}`,
        path: path || 'unknown',
      };
    }
  }
};