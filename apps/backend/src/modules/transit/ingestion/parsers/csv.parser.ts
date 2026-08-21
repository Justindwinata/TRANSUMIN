import * as fs from 'fs';
import * as path from 'path';

export class CsvParser {
  static parse<T extends Record<string, string>>(filePath: string): T[] {
    const content = fs.readFileSync(filePath, 'utf8');
    return CsvParser.parseString<T>(content);
  }

  static parseString<T extends Record<string, string>>(content: string): T[] {
    const lines = content.split(/\r?\n/).filter(line => line.trim());
    if (lines.length === 0) return [];
    const headers = lines[0].split(',').map(h => h.trim());
    const records: T[] = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',');
      const record: Record<string, string> = {};
      headers.forEach((header, idx) => {
        record[header] = values[idx]?.trim() ?? '';
      });
      records.push(record as T);
    }
    return records;
  }
}
