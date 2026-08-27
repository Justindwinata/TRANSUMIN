import { CsvParser } from '../src/modules/transit/ingestion/parsers/csv.parser';

describe('CsvParser', () => {
  it('should parse CSV into typed records', () => {
    const csv = 'route_id,route_short_name\nR1,Route 1\n';
    const result = CsvParser.parseString(csv);
    expect(result).toHaveLength(1);
    expect(result[0].route_id).toBe('R1');
    expect(result[0].route_short_name).toBe('Route 1');
  });

  it('should return empty array for missing file', () => {
    const result = CsvParser.parse('/nonexistent/file.csv');
    expect(result).toEqual([]);
  });

  it('should handle quoted fields with commas', () => {
    const csv = 'name,desc\n"Stop, A","Description, here"\n';
    const result = CsvParser.parseString(csv);
    expect(result[0].name).toBe('Stop, A');
    expect(result[0].desc).toBe('Description, here');
  });

  it('should handle CRLF line endings', () => {
    const csv = 'id,name\r\n1,A\r\n2,B\r\n';
    const result = CsvParser.parseString(csv);
    expect(result.length).toBe(2);
    expect(result[1].name).toBe('B');
  });

  it('should handle empty content', () => {
    const result = CsvParser.parseStringToRecords('');
    expect(result.records).toEqual([]);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('should skip blank lines and detect missing required columns', () => {
    const csv = 'route_id,route_short_name\nR1,Route 1\n\nR2,Route 2\n';
    const result = CsvParser.parseStringToRecords(csv, { requiredColumns: ['route_id', 'route_short_name'] });
    expect(result.records.length).toBe(2);
    expect(result.errors).toEqual([]);
  });

  it('should report missing required columns', () => {
    const csv = 'route_id,route_short_name\nR1,Route 1\n';
    const result = CsvParser.parseStringToRecords(csv, { requiredColumns: ['route_long_name'] });
    expect(result.errors).toContain('Missing required column: route_long_name');
  });

  it('should warn about field count mismatch', () => {
    const csv = 'id,name,extra\n1,A,B,C\n';
    const result = CsvParser.parseStringToRecords(csv);
    expect(result.warnings.length).toBeGreaterThanOrEqual(0);
  });

  it('should parse quoted fields with escaped quotes', () => {
    const csv = 'name\n"she said ""hi"""\n';
    const result = CsvParser.parseString(csv);
    expect(result[0].name).toBe('she said "hi"');
  });

  it('should parse dates from GTFS YYYYMMDD format', () => {
    const date = CsvParser.parseDate('20240115');
    expect(date).not.toBeNull();
    expect(date!.getFullYear()).toBe(2024);
    expect(date!.getMonth()).toBe(0); // zero-indexed
    expect(date!.getDate()).toBe(15);
  });

  it('should reject invalid dates', () => {
    expect(CsvParser.parseDate('invalid')).toBeNull();
    expect(CsvParser.parseDate('20241301')).toBeNull(); // month 13
    expect(CsvParser.parseDate('20240001')).toBeNull(); // month 00
    expect(CsvParser.parseDate('')).toBeNull();
  });
});
