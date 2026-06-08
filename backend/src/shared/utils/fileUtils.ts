/**
 * Shared File Utilities
 * Common file-system helpers used across modules.
 */

import * as fs from 'fs';
import * as path from 'path';

/**
 * Ensure a directory exists, creating it (and parents) recursively if needed.
 */
export function ensureDir(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Ensure the uploads subdirectory exists under the current working directory.
 * @param subPath - relative path segments under 'uploads' (e.g. 'blog', 'cards')
 */
export function ensureUploadsDir(...subPath: string[]): string {
  const dir = path.resolve(process.cwd(), 'uploads', ...subPath);
  ensureDir(dir);
  return dir;
}
