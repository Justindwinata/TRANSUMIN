import * as fs from 'fs';

export interface ParseOptions {
  requiredColumns?: string[];
}

export interface ParseResult<T extends Record<string, string>> {
  records: T[];
  errors: string[];
  warnings: string[];
}

export class CsvParser {
  static parse<T extends Record<string, string>>(filePath: string, options?: ParseOptions): T[] {
    return CsvParser.parseWithDiagnostics<T>(filePath, options).records;
  }

  static parseString<T extends Record<string, string>>(content: string, options?: ParseOptions): T[] {
    return CsvParser.parseStringToRecords<T>(content, options).records;
  }

  static parseWithDiagnostics<T extends Record<string, string>>(
    filePath: string,
    options?: ParseOptions,
  ): ParseResult<T> {
    if (!fs.existsSync(filePath)) {
      return { records: [], errors: [`File not found: ${filePath}`], warnings: [] };
    }

    const content = fs.readFileSync(filePath, 'utf8');
    return CsvParser.parseStringToRecords<T>(content, options);
  }

  static parseStringToRecords<T extends Record<string, string>>(
    content: string,
    options?: ParseOptions,
  ): ParseResult<T> {
    const errors: string[] = [];
    const warnings: string[] = [];
    const records: T[] = [];

    if (!content || content.trim() === '') {
      return { records: [], errors: ['Empty content'], warnings };
    }

    const lines = CsvParser.splitLines(content);
    if (lines.length === 0) {
      return { records, errors, warnings };
    }

    const headers = CsvParser.parseLine(lines[0]);
    if (headers.length === 0) {
      return { records, errors: ['No headers found'], warnings };
    }

    const headerSet = new Set(headers);

    if (options?.requiredColumns) {
      for (const col of options.requiredColumns) {
        if (!headerSet.has(col)) {
          errors.push(`Missing required column: ${col}`);
        }
      }
    }

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (line.trim() === '') continue;

      const values = CsvParser.parseLine(line);
      if (values.length === 0) continue;

      if (values.length < headers.length) {
        warnings.push(`Row ${i + 1}: has ${values.length} fields, expected ${headers.length}`);
      }

      const record: Record<string, string> = {};
      headers.forEach((header, idx) => {
        record[header] = values[idx]?.trim() ?? '';
      });

      records.push(record as T);
    }

    return { records, errors, warnings };
  }

  private static splitLines(content: string): string[] {
    const lines: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < content.length; i++) {
      const char = content[i];

      if (char === '"') {
        if (inQuotes && content[i + 1] === '"') {
          current += '""';
          i++;
        } else {
          inQuotes = !inQuotes;
          current += char;
        }
      } else if ((char === '\n' || char === '\r') && !inQuotes) {
        if (char === '\r' && content[i + 1] === '\n') {
          i++;
        }
        if (current.length > 0) {
          lines.push(current);
        }
        current = '';
      } else {
        current += char;
      }
    }

    if (current.length > 0) {
      lines.push(current);
    }

    return lines;
  }

  private static parseLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"' && !inQuotes) {
        inQuotes = true;
      } else if (char === '"' && inQuotes) {
        if (line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }

    result.push(current.trim());
    return result;
  }

  static parseDate(yyyymmdd: string): Date | null {
    if (!/^\d{8}$/.test(yyyymmdd)) return null;
    const year = parseInt(yyyymmdd.slice(0, 4), 10);
    const month = parseInt(yyyymmdd.slice(4, 6), 10);
    const day = parseInt(yyyymmdd.slice(6, 8), 10);
    if (month < 1 || month > 12 || day < 1 || day > 31) return null;
    return new Date(year, month - 1, day);
  }
}
