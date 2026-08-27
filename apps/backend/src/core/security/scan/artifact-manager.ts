import * as fs from 'fs/promises';
import * as path from 'path';
import { createHash } from 'crypto';

export interface ArtifactValidationResult {
  valid: boolean;
  filePath: string;
  sizeBytes: number;
  checksum: string;
  reason?: string;
}

export class ArtifactManager {
  private maxSizeBytes: number;
  private allowedDirs: string[];

  constructor(maxSizeBytes = 50 * 1024 * 1024, allowedDirs = ['strix_runs', 'security/strix']) {
    this.maxSizeBytes = maxSizeBytes;
    this.allowedDirs = allowedDirs;
  }

  async validateAndStoreArtifact(filePath: string, content: string | Buffer): Promise<ArtifactValidationResult> {
    const resolvedPath = path.resolve(filePath);

    // Path traversal check
    const isAllowedDir = this.allowedDirs.some((dir) => {
      const resolvedDir = path.resolve(dir);
      return resolvedPath.startsWith(resolvedDir);
    });

    if (!isAllowedDir) {
      throw new Error(`Path traversal violation: file path '${filePath}' is outside approved directories`);
    }

    const buffer = Buffer.isBuffer(content) ? content : Buffer.from(content, 'utf8');
    const sizeBytes = buffer.length;

    if (sizeBytes > this.maxSizeBytes) {
      throw new Error(`Artifact size limit exceeded: ${sizeBytes} bytes (max ${this.maxSizeBytes} bytes)`);
    }

    const checksum = createHash('sha256').update(buffer).digest('hex');

    // Ensure directory exists
    await fs.mkdir(path.dirname(resolvedPath), { recursive: true });
    await fs.writeFile(resolvedPath, buffer);

    return {
      valid: true,
      filePath: resolvedPath,
      sizeBytes,
      checksum,
    };
  }

  async readArtifact(filePath: string): Promise<string> {
    const resolvedPath = path.resolve(filePath);
    const isAllowedDir = this.allowedDirs.some((dir) => {
      const resolvedDir = path.resolve(dir);
      return resolvedPath.startsWith(resolvedDir);
    });

    if (!isAllowedDir) {
      throw new Error(`Path traversal violation: file path '${filePath}' is outside approved directories`);
    }

    return fs.readFile(resolvedPath, 'utf8');
  }
}
