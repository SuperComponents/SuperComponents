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
      `Node.js 20 or higher is required for Storybook. Current version: ${nodeVersion}. Please upgrade Node.js and try again.`
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
    execSync(`cp -r ${sourceDir}/* ${targetPath}/ 2>/dev/null || true`, { stdio: 'inherit' });
    execSync(`cp -r ${sourceDir}/.* ${targetPath}/ 2>/dev/null || true`, { stdio: 'inherit' });
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
          stdio: 'inherit' 
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
          "Run 'npm run dev' to start the development server",
          "Run 'npm run storybook' to start Storybook",
          "Check the README.md for more information",
          "Start building your component library!"
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