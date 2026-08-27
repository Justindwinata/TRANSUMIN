import { Injectable, Logger } from '@nestjs/common';
import {
  RealtimeProvider,
  RealtimeSourceStatus,
  RealtimeVehiclePosition,
  RealtimeTripUpdate,
  RealtimeServiceAlert,
  createDisabledRealtimeProvider,
  DisabledRealtimeProvider,
} from './realtime.types';

@Injectable()
export class RealtimeManager {
  private readonly logger = new Logger(RealtimeManager.name);
  private providers: Map<string, RealtimeProvider> = new Map();
  private disabledProvider: DisabledRealtimeProvider;

  constructor() {
    this.disabledProvider = createDisabledRealtimeProvider();
    this.providers.set('disabled', this.disabledProvider);
  }

  registerProvider(provider: RealtimeProvider): void {
    this.providers.set(provider.name, provider);
    this.logger.log(`Registered realtime provider: ${provider.name}`);
  }

  getProvider(name: string): RealtimeProvider {
    return this.providers.get(name) ?? this.disabledProvider;
  }

  getAllProviders(): RealtimeProvider[] {
    return Array.from(this.providers.values());
  }

  getActiveProviders(): RealtimeProvider[] {
    return Array.from(this.providers.values()).filter(p => p.isHealthy());
  }

  async getVehiclePositions(): Promise<RealtimeVehiclePosition[]> {
    const activeProviders = this.getActiveProviders();
    if (activeProviders.length === 0) {
      return [];
    }

    const results: RealtimeVehiclePosition[] = [];
    for (const provider of activeProviders) {
      if (!provider.getVehiclePositions) continue;
      try {
        const positions = await provider.getVehiclePositions();
        results.push(...positions);
      } catch (error) {
        this.logger.error(`Error fetching vehicle positions from ${provider.name}:`, error);
        provider.status = RealtimeSourceStatus.ERROR;
      }
    }
    return results;
  }

  async getTripUpdates(): Promise<RealtimeTripUpdate[]> {
    const activeProviders = this.getActiveProviders();
    if (activeProviders.length === 0) {
      return [];
    }

    const results: RealtimeTripUpdate[] = [];
    for (const provider of activeProviders) {
      if (!provider.getTripUpdates) continue;
      try {
        const updates = await provider.getTripUpdates();
        results.push(...updates);
      } catch (error) {
        this.logger.error(`Error fetching trip updates from ${provider.name}:`, error);
        provider.status = RealtimeSourceStatus.ERROR;
      }
    }
    return results;
  }

  async getServiceAlerts(): Promise<RealtimeServiceAlert[]> {
    const activeProviders = this.getActiveProviders();
    if (activeProviders.length === 0) {
      return [];
    }

    const results: RealtimeServiceAlert[] = [];
    for (const provider of activeProviders) {
      if (!provider.getServiceAlerts) continue;
      try {
        const alerts = await provider.getServiceAlerts();
        results.push(...alerts);
      } catch (error) {
        this.logger.error(`Error fetching service alerts from ${provider.name}:`, error);
        provider.status = RealtimeSourceStatus.ERROR;
      }
    }
    return results;
  }

  getSystemStatus(): { providers: Array<{ name: string; status: RealtimeSourceStatus; lastUpdate?: Date }> } {
    return {
      providers: Array.from(this.providers.values()).map(p => ({
        name: p.name,
        status: p.status,
        lastUpdate: p.lastUpdate,
      })),
    };
  }
}