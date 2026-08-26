import { Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class ValidationService {
  validateEmail(email: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new BadRequestException('Invalid email format');
    }
  }

  validatePassword(password: string): void {
    if (password.length < 8) {
      throw new BadRequestException('Password must be at least 8 characters');
    }
    if (!/[a-z]/.test(password)) {
      throw new BadRequestException('Password must contain lowercase letters');
    }
    if (!/[A-Z]/.test(password)) {
      throw new BadRequestException('Password must contain uppercase letters');
    }
    if (!/[0-9]/.test(password)) {
      throw new BadRequestException('Password must contain numbers');
    }
  }

  validateCoordinates(lat: number, lon: number): void {
    if (lat < -90 || lat > 90) {
      throw new BadRequestException('Latitude must be between -90 and 90');
    }
    if (lon < -180 || lon > 180) {
      throw new BadRequestException('Longitude must be between -180 and 180');
    }
  }

  validateUrl(url: string, allowedProtocols: string[] = ['https', 'http']): void {
    try {
      const parsed = new URL(url);
      if (!allowedProtocols.includes(parsed.protocol.replace(':', ''))) {
        throw new BadRequestException(`URL protocol must be one of: ${allowedProtocols.join(', ')}`);
      }
      if (this.isPrivateIP(parsed.hostname)) {
        throw new BadRequestException('Private/internal IP addresses are not allowed');
      }
    } catch (e) {
      throw new BadRequestException('Invalid URL format');
    }
  }

  private isPrivateIP(hostname: string): boolean {
    const privateRanges = [
      /^localhost$/i,
      /^127\./,
      /^10\./,
      /^172\.(1[6-9]|2[0-9]|3[01])\./,
      /^192\.168\./,
      /^::1$/,
      /^fc00:/i,
      /^fe80:/i,
    ];
    return privateRanges.some(range => range.test(hostname));
  }

  validatePaginationLimit(limit: number, maxLimit: number = 100): number {
    if (limit < 1) return 1;
    if (limit > maxLimit) return maxLimit;
    return limit;
  }
}
