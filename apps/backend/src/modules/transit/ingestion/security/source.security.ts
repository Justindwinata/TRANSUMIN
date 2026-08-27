export interface SourceValidationRules {
  allowedDomains: string[];
  maxFileSizeBytes: number;
  allowedMimeTypes: string[];
  requireHttps: boolean;
  timeoutMs: number;
}

export class SourceSecurityValidator {
  static DEFAULT_RULES: SourceValidationRules = {
    allowedDomains: ['gtfs.transjakarta.co.id', 'data.jakarta.go.id', 'data.go.id'],
    maxFileSizeBytes: 500 * 1024 * 1024, // 500MB
    allowedMimeTypes: ['application/zip', 'text/csv', 'application/json'],
    requireHttps: true,
    timeoutMs: 60000,
  };

  static validateSourceUrl(url: string, rules: SourceValidationRules = SourceSecurityValidator.DEFAULT_RULES): { valid: boolean; error?: string } {
    try {
      const parsed = new URL(url);

      if (rules.requireHttps && parsed.protocol !== 'https:') {
        return { valid: false, error: 'HTTPS required' };
      }

      if (!rules.allowedDomains.includes(parsed.hostname)) {
        return { valid: false, error: `Domain not in whitelist: ${parsed.hostname}` };
      }

      if (parsed.pathname.includes('..') || parsed.pathname.includes('\\')) {
        return { valid: false, error: 'Path traversal detected' };
      }

      return { valid: true };
    } catch (err) {
      return { valid: false, error: 'Invalid URL format' };
    }
  }

  static validateFileSize(sizeBytes: number, maxBytes: number = SourceSecurityValidator.DEFAULT_RULES.maxFileSizeBytes): { valid: boolean; error?: string } {
    if (sizeBytes > maxBytes) {
      return { valid: false, error: `File too large: ${sizeBytes} > ${maxBytes}` };
    }
    return { valid: true };
  }

  static validateMimeType(mimeType: string, allowed: string[] = SourceSecurityValidator.DEFAULT_RULES.allowedMimeTypes): { valid: boolean; error?: string } {
    if (!allowed.includes(mimeType)) {
      return { valid: false, error: `MIME type not allowed: ${mimeType}` };
    }
    return { valid: true };
  }

  static validateArchivePath(extractPath: string): { valid: boolean; error?: string } {
    if (extractPath.includes('..') || extractPath.includes('~') || extractPath.startsWith('/')) {
      return { valid: false, error: 'Archive path traversal detected' };
    }
    return { valid: true };
  }
}
