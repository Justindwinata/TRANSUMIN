import { ProviderReadiness, SecurityScanProvider, SecurityScanProviderType, SecurityScanRequest, SecurityScanResult } from './types';
import { DisabledSecurityScanProvider } from './disabled-provider';
import { StrixCliProvider } from './strix-cli-provider';
import { StrixManagedProvider } from './strix-managed-provider';

export class SecurityScanExecutor {
  private providers: Map<SecurityScanProviderType, SecurityScanProvider>;
  private selectedProvider: SecurityScanProvider;

  constructor(apiToken?: string) {
    const providerArray: Array<[SecurityScanProviderType, SecurityScanProvider]> = [
      [SecurityScanProviderType.STRIX_MANAGED, new StrixManagedProvider(apiToken)],
      [SecurityScanProviderType.STRIX_CLI, new StrixCliProvider()],
      [SecurityScanProviderType.DISABLED, new DisabledSecurityScanProvider()],
    ];
    this.providers = new Map(providerArray);

    this.selectedProvider = this.providers.get(SecurityScanProviderType.DISABLED)!;
  }

  async selectBestProvider(): Promise<SecurityScanProvider> {
    for (const [type, provider] of this.providers) {
      if (type === SecurityScanProviderType.DISABLED) continue;
      const readiness = await provider.validateCredentials();
      if (readiness.ready) {
        this.selectedProvider = provider;
        return provider;
      }
    }
    this.selectedProvider = this.providers.get(SecurityScanProviderType.DISABLED)!;
    return this.selectedProvider;
  }

  async executeScan(request: SecurityScanRequest): Promise<SecurityScanResult> {
    await this.selectBestProvider();
    return this.selectedProvider.executeScan(request);
  }

  getSelectedProvider(): SecurityScanProvider {
    return this.selectedProvider;
  }

  async getProviderReadiness(): Promise<ProviderReadiness[]> {
    const results: ProviderReadiness[] = [];
    for (const [type, provider] of this.providers) {
      if (type === SecurityScanProviderType.DISABLED) continue;
      results.push(await provider.validateCredentials());
    }
    return results;
  }
}