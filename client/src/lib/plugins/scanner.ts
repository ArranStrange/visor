/**
 * Runtime File Scanner
 *
 * Automatically discovers and loads plugin files following SFG20 patterns:
 * - *.runtime.ts / *.runtime.tsx - Runtime plugins (loaded when routes become active)
 * - startup-main.ts / startup-main.tsx - Startup plugins (loaded at app startup)
 * - *.app.ts / *.app.tsx - App-level configuration
 * - *.lazy.ts / *.lazy.tsx - Lazy-loaded plugins
 *
 * Uses Vite's import.meta.glob for automatic discovery.
 */

/**
 * Runtime file patterns to scan for (matching SFG20 conventions)
 */
const RUNTIME_PATTERNS = [
  /\.runtime\.(ts|tsx)$/,
  /startup-main\.(ts|tsx)$/,
  /\.app\.(ts|tsx)$/,
  /\.lazy\.(ts|tsx)$/,
];

/**
 * Scanned runtime files cache
 */
const scannedFiles = new Set<string>();

/**
 * Scan for runtime files and load them
 * Uses Vite's import.meta.glob to automatically discover files
 *
 * Execution order (matching SFG20):
 * 1. *.app.ts files load first (app-level configuration)
 * 2. startup-main.ts files load next (plugin initialization)
 * 3. *.runtime.ts files load when routes become active
 * 4. *.lazy.ts files load on demand
 */
export async function scanRuntimeFiles(): Promise<void> {
  try {
    // Load app-level config first
    // Patterns are relative to this file's location (src/lib/plugins/)
    // "../../" goes up to src/, then "**/*.app.{ts,tsx}" matches all app files
    const appModules = import.meta.glob(
      ["../../**/*.app.{ts,tsx}", "../../**/startup-main.{ts,tsx}"],
      { eager: true }
    );

    // Load runtime files (eager for now, can be lazy later)
    // Pattern is relative to this file's location (src/lib/plugins/)
    // "../../" goes up to src/, then "**/*.runtime.{ts,tsx}" matches all runtime files
    const runtimeModules = import.meta.glob(["../../**/*.runtime.{ts,tsx}"], {
      eager: true,
    });

    // Track loaded files
    Object.keys(appModules).forEach((path) => {
      if (!scannedFiles.has(path)) {
        scannedFiles.add(path);
        console.log(`Loaded app/startup file: ${path}`);
      }
    });

    Object.keys(runtimeModules).forEach((path) => {
      if (!scannedFiles.has(path)) {
        scannedFiles.add(path);
        // Access the module to ensure it's executed
        // With eager: true, the module is already executed, but we access it to be sure
        const module = runtimeModules[path];
        if (module && typeof module === "object") {
          // Try to access default export or any exports to ensure execution
          try {
            // Accessing the module ensures side effects run
            if ("default" in module) {
              module.default;
            }
          } catch (e) {
            // Ignore errors
          }
        }
        console.log(
          `✅ Loaded runtime file: ${path}`,
          Object.keys(module || {})
        );
      }
    });

    console.log(
      `📦 Total runtime files loaded: ${Object.keys(runtimeModules).length}`
    );
  } catch (error) {
    console.error("Error scanning runtime files:", error);
  }
}

/**
 * Check if a file path matches runtime patterns
 */
export function isRuntimeFile(path: string): boolean {
  return RUNTIME_PATTERNS.some((pattern) => pattern.test(path));
}

/**
 * Lazy load a plugin file on demand
 */
export async function loadLazyPlugin(path: string): Promise<void> {
  try {
    // Pattern relative to this file's location
    const lazyModules = import.meta.glob("../../**/*.lazy.{ts,tsx}", {
      eager: false,
    });

    if (lazyModules[path]) {
      await lazyModules[path]();
      console.log(`Loaded lazy plugin: ${path}`);
    }
  } catch (error) {
    console.error(`Failed to load lazy plugin: ${path}`, error);
  }
}
