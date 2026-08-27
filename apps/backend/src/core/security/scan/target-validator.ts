import { SecurityTargetEnvironment } from './types';

export interface TargetValidationResult {
  allowed: boolean;
  environment: SecurityTargetEnvironment;
  reason: string;
}

export class TargetValidator {
  private allowedStagingUrls: string[] = [];

  constructor(allowedStagingUrls: string[] = []) {
    this.allowedStagingUrls = allowedStagingUrls;
  }

  validateTarget(target: string, targetType: string): TargetValidationResult {
    if (!target || typeof target !== 'string') {
      return {
        allowed: false,
        environment: SecurityTargetEnvironment.PRODUCTION,
        reason: 'Target is empty or invalid',
      };
    }

    const trimmed = target.trim();

    // Local targets (checked first to avoid false positives)
    if (
      trimmed === './' ||
      trimmed.startsWith('./') ||
      trimmed.startsWith('/') ||
      trimmed.includes('localhost') ||
      trimmed.includes('127.0.0.1') ||
      trimmed.includes('0.0.0.0')
    ) {
      return {
        allowed: true,
        environment: SecurityTargetEnvironment.LOCAL,
        reason: 'Local repository or development target approved',
      };
    }

    // Staging targets
    if (this.isStagingTarget(trimmed)) {
      return {
        allowed: true,
        environment: SecurityTargetEnvironment.STAGING,
        reason: 'Staging target approved via allowlist',
      };
    }

    // Check for production indicators or unapproved external domains
    if (this.isProductionTarget(trimmed)) {
      return {
        allowed: false,
        environment: SecurityTargetEnvironment.PRODUCTION,
        reason: 'Production targets are blocked by default for security scans',
      };
    }

    // Default: block unknown external URLs
    return {
      allowed: false,
      environment: SecurityTargetEnvironment.PRODUCTION,
      reason: `Target '${trimmed}' is not in the approved allowlist for security testing`,
    };
  }

  private isProductionTarget(target: string): boolean {
    const lower = target.toLowerCase();
    const prodKeywords = ['prod.', 'production', 'api.transumin.com', 'transumin.com'];
    for (const kw of prodKeywords) {
      if (lower.includes(kw)) {
        return true;
      }
    }
    return false;
  }

  private isStagingTarget(target: string): boolean {
    const lower = target.toLowerCase();
    if (lower.includes('staging') || lower.includes('dev')) {
      return true;
    }
    if (lower.includes('test') && !lower.includes('prod.')) {
      return true;
    }
    return this.allowedStagingUrls.some((url) => lower.startsWith(url.toLowerCase()));
  }
}
