import { DataQualityAnalyzer, DataQualityMetrics } from '../src/modules/transit/ingestion/data.quality';

describe('DataQualityAnalyzer', () => {
  it('should analyze ingestion metrics correctly', () => {
    const metrics = DataQualityAnalyzer.analyze(
      { agencies: 1, routes: 10, stops: 50, trips: 100, stopTimes: 500, calendars: 2, transfers: 5, shapes: 0, calendarDates: 0 },
      { agencies: 1, routes: 9, stops: 48, trips: 95, stopTimes: 490, calendars: 2, transfers: 5 },
      { orphans: 3, invalidCoordinates: 2, duplicateIds: 1, invalidTimes: 0 },
      { warnings: ['Some warning'] },
    );

    expect(metrics.totalRecords).toBe(668);
    expect(metrics.validRecords).toBe(650);
    expect(metrics.rejectionRate).toBeCloseTo(0.027, 2);
    expect(metrics.coverageByType.routes).toBe(9);
    expect(metrics.validationIssues.orphanReferences).toBe(3);
    expect(metrics.warnings).toContain('Some warning');
  });

  it('should generate summary text', () => {
    const metrics: DataQualityMetrics = {
      totalRecords: 100,
      validRecords: 90,
      rejectedRecords: 10,
      rejectionRate: 0.1,
      coverageByType: { agencies: 1, routes: 5, stops: 20, trips: 50, stopTimes: 200, calendars: 1, transfers: 2, shapes: 0, calendarDates: 0 },
      validationIssues: { orphanReferences: 5, invalidCoordinates: 3, duplicateIds: 2, invalidTimes: 0 },
      warnings: [],
    };

    const summary = DataQualityAnalyzer.summary(metrics);
    expect(summary).toContain('90/100');
    expect(summary).toContain('Routes: 5');
  });
});
