import { StrixCliProvider, SecurityScanProviderType } from '../src/core/security/scan';

describe('StrixCliProvider - Credential Readiness Tests', () => {
  it('should report not ready when Docker is unavailable', async () => {
    const provider = new StrixCliProvider();
    const readiness = await provider.validateCredentials();

    expect(readiness.ready).toBe(false);
    expect(readiness.provider).toBe(SecurityScanProviderType.STRIX_CLI);
  });

  it('should report not ready when STRIX_LLM is missing', async () => {
    const originalLLM = process.env.STRIX_LLM;
    const originalKey = process.env.LLM_API_KEY;
    delete process.env.STRIX_LLM;
    delete process.env.LLM_API_KEY;

    const provider = new StrixCliProvider();
    const readiness = await provider.validateCredentials();

    expect(readiness.ready).toBe(false);

    if (originalLLM) process.env.STRIX_LLM = originalLLM;
    if (originalKey) process.env.LLM_API_KEY = originalKey;
  });

  it('should report not ready when LLM_API_KEY is missing', async () => {
    const originalLLM = process.env.STRIX_LLM;
    const originalKey = process.env.LLM_API_KEY;
    process.env.STRIX_LLM = 'openai/gpt-4';
    delete process.env.LLM_API_KEY;

    const provider = new StrixCliProvider();
    const readiness = await provider.validateCredentials();

    expect(readiness.ready).toBe(false);

    if (originalLLM) process.env.STRIX_LLM = originalLLM;
    if (originalKey) process.env.LLM_API_KEY = originalKey;
  });

  it('should never claim ready without Docker', async () => {
    const provider = new StrixCliProvider();
    const readiness = await provider.validateCredentials();

    expect(readiness.ready).toBe(false);
  });
});