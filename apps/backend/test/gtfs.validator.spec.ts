import { GtfsValidator } from '../src/modules/transit/ingestion/validators/gtfs.validator';

describe('GtfsValidator', () => {
  describe('validateCoordinates', () => {
    it('should accept valid Jabodetabek coordinates', () => {
      expect(GtfsValidator.validateCoordinates(-6.2, 106.8)).toBe(true);
      expect(GtfsValidator.validateCoordinates(-6.5, 106.8)).toBe(true);
      expect(GtfsValidator.validateCoordinates(-5.8, 107.2)).toBe(true);
    });

    it('should reject coordinates outside Jabodetabek bounds', () => {
      expect(GtfsValidator.validateCoordinates(-8.0, 106.8)).toBe(false);
      expect(GtfsValidator.validateCoordinates(-5.0, 106.8)).toBe(false);
      expect(GtfsValidator.validateCoordinates(-6.2, 105.0)).toBe(false);
      expect(GtfsValidator.validateCoordinates(-6.2, 108.0)).toBe(false);
    });
  });

  describe('validateTime', () => {
    it('should accept valid GTFS times', () => {
      expect(GtfsValidator.validateTime('08:30:00')).toBe(true);
      expect(GtfsValidator.validateTime('25:30:00')).toBe(true);
      expect(GtfsValidator.validateTime('27:59:59')).toBe(true);
      expect(GtfsValidator.validateTime('00:00:00')).toBe(true);
    });

    it('should reject invalid times', () => {
      expect(GtfsValidator.validateTime('25:61:00')).toBe(false);
      expect(GtfsValidator.validateTime('25:00:61')).toBe(false);
      expect(GtfsValidator.validateTime('abc')).toBe(false);
      expect(GtfsValidator.validateTime('08:30')).toBe(false);
      expect(GtfsValidator.validateTime('')).toBe(false);
    });
  });

  describe('validateAgency', () => {
    it('should accept valid agency', () => {
      const result = GtfsValidator.validateAgency({
        agency_name: 'TransJakarta',
        agency_url: 'https://transjakarta.co.id',
        agency_timezone: 'Asia/Jakarta',
      });
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject agency without name', () => {
      const result = GtfsValidator.validateAgency({
        agency_name: '',
        agency_url: 'https://transjakarta.co.id',
        agency_timezone: 'Asia/Jakarta',
      });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Agency name is required');
    });

    it('should reject agency without timezone', () => {
      const result = GtfsValidator.validateAgency({
        agency_name: 'TransJakarta',
        agency_url: 'https://transjakarta.co.id',
        agency_timezone: '',
      });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Agency timezone is required');
    });
  });

  describe('validateRoute', () => {
    it('should accept valid route', () => {
      const result = GtfsValidator.validateRoute({
        route_id: 'R1',
        agency_id: 'transjakarta',
        route_short_name: '1',
        route_long_name: 'Blok M - Kota',
        route_type: '3',
      }, new Set(['transjakarta']));
      expect(result.isValid).toBe(true);
    });

    it('should reject route without route_id', () => {
      const result = GtfsValidator.validateRoute({
        route_id: '',
        agency_id: 'transjakarta',
        route_short_name: '1',
        route_long_name: 'Blok M - Kota',
        route_type: '3',
      }, new Set(['transjakarta']));
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Route ID is required');
    });

    it('should reject route with unknown agency', () => {
      const result = GtfsValidator.validateRoute({
        route_id: 'R1',
        agency_id: 'unknown',
        route_short_name: '1',
        route_long_name: 'Blok M - Kota',
        route_type: '3',
      }, new Set(['transjakarta']));
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Route references unknown agency_id: unknown');
    });

    it('should reject non-numeric route_type', () => {
      const result = GtfsValidator.validateRoute({
        route_id: 'R1',
        agency_id: 'transjakarta',
        route_short_name: '1',
        route_long_name: 'Blok M - Kota',
        route_type: 'abc',
      }, new Set(['transjakarta']));
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Route type is required and must be numeric');
    });
  });

  describe('validateStop', () => {
    const stopIdSet = new Set(['S1', 'S2']);

    it('should accept valid stop within Jabodetabek', () => {
      const result = GtfsValidator.validateStop({
        stop_id: 'S1',
        stop_name: 'Monas',
        stop_lat: '-6.175',
        stop_lon: '106.827',
      }, stopIdSet);
      expect(result.isValid).toBe(true);
    });

    it('should reject stop with invalid coordinates', () => {
      const result = GtfsValidator.validateStop({
        stop_id: 'S1',
        stop_name: 'Monas',
        stop_lat: 'invalid',
        stop_lon: '106.827',
      }, stopIdSet);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Stop coordinates must be valid numbers');
    });

    it('should warn for coordinates outside Jabodetabek', () => {
      const result = GtfsValidator.validateStop({
        stop_id: 'S1',
        stop_name: 'Far Away',
        stop_lat: '-8.0',
        stop_lon: '106.8',
      }, stopIdSet);
      expect(result.isValid).toBe(true);
      expect(result.warnings.some(w => w.includes('outside Jabodetabek bounds'))).toBe(true);
    });
  });

  describe('validateTrip', () => {
    it('should accept valid trip', () => {
      const result = GtfsValidator.validateTrip({
        trip_id: 'T1',
        route_id: 'R1',
        service_id: 'SVC1',
        trip_headsign: 'Kota',
        direction_id: '0',
        shape_id: 'SHAPE1',
      }, new Set(['R1']), new Set(['SVC1']), new Set(['SHAPE1']));
      expect(result.isValid).toBe(true);
    });

    it('should reject trip with unknown route', () => {
      const result = GtfsValidator.validateTrip({
        trip_id: 'T1',
        route_id: 'UNKNOWN',
        service_id: 'SVC1',
        trip_headsign: 'Kota',
      }, new Set(['R1']), new Set(['SVC1']), new Set());
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Trip references unknown route_id: UNKNOWN');
    });

    it('should reject invalid direction_id', () => {
      const result = GtfsValidator.validateTrip({
        trip_id: 'T1',
        route_id: 'R1',
        service_id: 'SVC1',
        direction_id: '2',
      }, new Set(['R1']), new Set(['SVC1']), new Set());
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Direction ID must be 0 or 1');
    });
  });

  describe('validateStopTime', () => {
    const tripIdSet = new Set(['T1']);
    const stopIdSet = new Set(['S1']);

    it('should accept valid stop time', () => {
      const result = GtfsValidator.validateStopTime({
        trip_id: 'T1',
        stop_id: 'S1',
        arrival_time: '08:30:00',
        departure_time: '08:31:00',
        stop_sequence: '1',
      }, tripIdSet, stopIdSet);
      expect(result.isValid).toBe(true);
    });

    it('should reject stop time with unknown trip', () => {
      const result = GtfsValidator.validateStopTime({
        trip_id: 'UNKNOWN',
        stop_id: 'S1',
        arrival_time: '08:30:00',
        departure_time: '08:31:00',
        stop_sequence: '1',
      }, new Set(['T1']), new Set(['S1']));
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('StopTime references unknown trip_id: UNKNOWN');
    });

    it('should reject invalid arrival_time', () => {
      const result = GtfsValidator.validateStopTime({
        trip_id: 'T1',
        stop_id: 'S1',
        arrival_time: 'invalid',
        departure_time: '08:31:00',
        stop_sequence: '1',
      }, new Set(['T1']), new Set(['S1']));
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('StopTime arrival_time is required and must be valid HH:MM:SS');
    });

    it('should reject invalid stop_sequence', () => {
      const result = GtfsValidator.validateStopTime({
        trip_id: 'T1',
        stop_id: 'S1',
        arrival_time: '08:30:00',
        departure_time: '08:31:00',
        stop_sequence: 'abc',
      }, new Set(['T1']), new Set(['S1']));
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('StopTime stop_sequence is required and must be numeric');
    });
  });

  describe('validateCalendar', () => {
    it('should accept valid calendar', () => {
      const result = GtfsValidator.validateCalendar({
        service_id: 'SVC1',
        monday: '1',
        tuesday: '1',
        wednesday: '1',
        thursday: '1',
        friday: '1',
        saturday: '0',
        sunday: '0',
        start_date: '20240101',
        end_date: '20241231',
      });
      expect(result.isValid).toBe(true);
    });

    it('should reject invalid days', () => {
      const result = GtfsValidator.validateCalendar({
        service_id: 'SVC1',
        monday: '2',
        tuesday: '1',
        wednesday: '1',
        thursday: '1',
        friday: '1',
        saturday: '0',
        sunday: '0',
        start_date: '20240101',
        end_date: '20241231',
      });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Calendar monday must be 0 or 1');
    });

    it('should reject invalid date format', () => {
      const result = GtfsValidator.validateCalendar({
        service_id: 'SVC1',
        monday: '1',
        tuesday: '1',
        wednesday: '1',
        thursday: '1',
        friday: '1',
        saturday: '0',
        sunday: '0',
        start_date: '2024-01-01',
        end_date: '20241231',
      });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Calendar start_date must be YYYYMMDD');
    });
  });

  describe('validateTransfer', () => {
    const stopIdSet = new Set(['S1', 'S2']);

    it('should accept valid transfer', () => {
      const result = GtfsValidator.validateTransfer({
        from_stop_id: 'S1',
        to_stop_id: 'S2',
        transfer_type: '0',
        min_transfer_time: '300',
      }, new Set(['S1', 'S2']));
      expect(result.isValid).toBe(true);
    });

    it('should reject transfer with unknown from_stop', () => {
      const result = GtfsValidator.validateTransfer({
        from_stop_id: 'UNKNOWN',
        to_stop_id: 'S2',
        transfer_type: '0',
      }, new Set(['S1', 'S2']));
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Transfer from_stop_id references unknown stop: UNKNOWN');
    });

    it('should reject invalid transfer_type', () => {
      const result = GtfsValidator.validateTransfer({
        from_stop_id: 'S1',
        to_stop_id: 'S2',
        transfer_type: '4',
      }, new Set(['S1', 'S2']));
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Transfer type must be 0, 1, 2, or 3');
    });
  });

  describe('validateAll', () => {
    it('should return overall valid when all entities valid', () => {
      const result = GtfsValidator.validateAll(
        [{ agency_id: 'transjakarta', agency_name: 'TJ', agency_url: 'x', agency_timezone: 'Asia/Jakarta' }],
        [{ route_id: 'R1', agency_id: 'transjakarta', route_short_name: '1', route_long_name: 'x', route_type: '3' }],
        [{ stop_id: 'S1', stop_name: 'S1', stop_lat: -6.2, stop_lon: 106.8 }, { stop_id: 'S2', stop_name: 'S2', stop_lat: -6.2, stop_lon: 106.8 }],
        [{ trip_id: 'T1', route_id: 'R1', service_id: 'S1', trip_headsign: 'x', direction_id: 0 }],
        [{ trip_id: 'T1', stop_id: 'S1', arrival_time: '08:00:00', departure_time: '08:01:00', stop_sequence: 1 }],
        [{ service_id: 'S1', monday: '1', tuesday: '1', wednesday: '1', thursday: '1', friday: '1', saturday: '0', sunday: '0', start_date: '20240101', end_date: '20241231' }],
        [{ from_stop_id: 'S1', to_stop_id: 'S2', transfer_type: 0 }],
        new Set(),
      );
      console.log('DEBUG overall:', JSON.stringify(result.overall, null, 2));
      expect(result.overall.isValid).toBe(true);
    });

    it('should return overall invalid when any entity invalid', () => {
      const result = GtfsValidator.validateAll(
        [{ agency_name: '', agency_url: 'x', agency_timezone: 'Asia/Jakarta' }],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        new Set(),
      );
      expect(result.overall.isValid).toBe(false);
      expect(result.overall.errors.length).toBeGreaterThan(0);
    });

    it('should collect all errors and warnings', () => {
      const result = GtfsValidator.validateAll(
        [{ agency_id: 'transjakarta', agency_name: 'TJ', agency_url: 'x', agency_timezone: 'Asia/Jakarta' }],
        [{ route_id: 'R1', agency_id: 'transjakarta', route_short_name: '', route_long_name: 'x', route_type: '3' }], // warning: no short name
        [{ stop_id: 'S1', stop_name: '', stop_lat: -8.0, stop_lon: 106.8 }], // warning: outside bounds
        [],
        [],
        [],
        [],
        new Set(),
      );
      expect(result.overall.isValid).toBe(true);
      expect(result.overall.warnings.length).toBeGreaterThan(0);
    });
  });
});