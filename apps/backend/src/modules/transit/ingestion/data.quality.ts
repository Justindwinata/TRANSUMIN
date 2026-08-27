export interface DataQualityMetrics {
  totalRecords: number;
  validRecords: number;
  rejectedRecords: number;
  rejectionRate: number;
  coverageByType: {
    agencies: number;
    routes: number;
    stops: number;
    trips: number;
    stopTimes: number;
    calendars: number;
    transfers: number;
    shapes: number;
    calendarDates: number;
  };
  validationIssues: {
    orphanReferences: number;
    invalidCoordinates: number;
    duplicateIds: number;
    invalidTimes: number;
  };
  warnings: string[];
}

export class DataQualityAnalyzer {
  static analyze(
    recordsFetched: Record<string, number>,
    recordsAccepted: Record<string, number>,
    rejections: Record<string, number>,
    validationDetails?: { warnings: string[] },
  ): DataQualityMetrics {
    const totalRecords = Object.values(recordsFetched).reduce((sum, count) => sum + count, 0);
    const validRecords = Object.values(recordsAccepted).reduce((sum, count) => sum + count, 0);
    const rejectedRecords = totalRecords - validRecords;
    const rejectionRate = totalRecords > 0 ? rejectedRecords / totalRecords : 0;

    return {
      totalRecords,
      validRecords,
      rejectedRecords,
      rejectionRate,
      coverageByType: {
        agencies: recordsAccepted.agencies ?? 0,
        routes: recordsAccepted.routes ?? 0,
        stops: recordsAccepted.stops ?? 0,
        trips: recordsAccepted.trips ?? 0,
        stopTimes: recordsAccepted.stopTimes ?? 0,
        calendars: recordsAccepted.calendars ?? 0,
        transfers: recordsAccepted.transfers ?? 0,
        shapes: recordsAccepted.shapes ?? 0,
        calendarDates: recordsAccepted.calendarDates ?? 0,
      },
      validationIssues: {
        orphanReferences: rejections.orphans ?? 0,
        invalidCoordinates: rejections.invalidCoordinates ?? 0,
        duplicateIds: rejections.duplicateIds ?? 0,
        invalidTimes: rejections.invalidTimes ?? 0,
      },
      warnings: validationDetails?.warnings ?? [],
    };
  }

  static summary(metrics: DataQualityMetrics): string {
    const rejectionPct = (metrics.rejectionRate * 100).toFixed(2);
    return `Ingested ${metrics.validRecords}/${metrics.totalRecords} records (${rejectionPct}% rejected). ` +
      `Routes: ${metrics.coverageByType.routes}, Stops: ${metrics.coverageByType.stops}, ` +
      `Trips: ${metrics.coverageByType.trips}, StopTimes: ${metrics.coverageByType.stopTimes}`;
  }
}
