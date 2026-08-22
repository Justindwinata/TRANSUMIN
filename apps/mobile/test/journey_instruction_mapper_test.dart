import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/features/routing/domain/models.dart';
import 'package:mobile/features/routing/presentation/journey_instruction_mapper.dart';

void main() {
  group('JourneyInstructionMapper', () {
    test('should generate start instruction', () {
      final route = RouteAlternative(
        id: '1',
        origin: JourneyPoint(latitude: -6.2, longitude: 106.8, name: 'Rumah'),
        destination: JourneyPoint(latitude: -6.3, longitude: 106.9, name: 'Kantor'),
        departureTime: '08:00:00',
        arrivalTime: '09:00:00',
        totalDurationSeconds: 3600,
        transitDurationSeconds: 3000,
        walkingDurationSeconds: 600,
        walkingDistanceMeters: 800,
        waitingDurationSeconds: 0,
        transferCount: 0,
        fareText: 'Rp 5000',
        segments: [],
      );

      final instructions = JourneyInstructionMapper.fromJourney(route);

      expect(instructions.length, 1);
      expect(instructions[0].kind, InstructionKind.start);
      expect(instructions[0].title, 'Mulai dari Rumah');
    });

    test('should generate walk, transit, and arrive instructions', () {
      final route = RouteAlternative(
        id: '1',
        origin: JourneyPoint(latitude: -6.2, longitude: 106.8, name: 'Home'),
        destination: JourneyPoint(latitude: -6.3, longitude: 106.9, name: 'Office'),
        departureTime: '08:00:00',
        arrivalTime: '09:00:00',
        totalDurationSeconds: 3600,
        transitDurationSeconds: 3000,
        walkingDurationSeconds: 600,
        walkingDistanceMeters: 800,
        waitingDurationSeconds: 0,
        transferCount: 0,
        fareText: 'Rp 5000',
        segments: [
          JourneySegment(
            type: 'WALK',
            durationSeconds: 300,
            distanceMeters: 400,
            instruction: 'Walk to station',
            fromName: 'Home',
            toName: 'Stasiun UI',
            fromLat: -6.2,
            fromLon: 106.8,
            toLat: -6.3,
            toLon: 106.7,
          ),
          JourneySegment(
            type: 'TRANSIT',
            durationSeconds: 1200,
            instruction: 'Ride KRL',
            fromName: 'Stasiun UI',
            toName: 'Stasiun Manggarai',
            fromLat: -6.3,
            fromLon: 106.7,
            toLat: -6.4,
            toLon: 106.9,
            routeShortName: 'KRL',
            routeLongName: 'KRL Commuter Line',
            routeColor: 'BA1A1A',
            serviceType: 'KRL',
            agencyName: 'KAI Commuter',
            tripHeadsign: 'Bogor',
            departureTime: '08:05:00',
            arrivalTime: '08:25:00',
            intermediateStopsCount: 3,
          ),
          JourneySegment(
            type: 'WALK',
            durationSeconds: 300,
            distanceMeters: 400,
            instruction: 'Walk to office',
            fromName: 'Stasiun Manggarai',
            toName: 'Office',
            fromLat: -6.4,
            fromLon: 106.9,
            toLat: -6.3,
            toLon: 106.9,
          ),
        ],
      );

      final instructions = JourneyInstructionMapper.fromJourney(route);

      expect(instructions.length, 1 + route.segments.length + 2);
      expect(instructions[0].kind, InstructionKind.start);

      final walkIns = instructions.where((i) => i.kind == InstructionKind.walk);
      expect(walkIns.length, 2);

      final boardIns = instructions.where((i) => i.kind == InstructionKind.board);
      expect(boardIns.length, 1);
      expect(boardIns.first.routeName, 'KRL');

      final rideIns = instructions.where((i) => i.kind == InstructionKind.ride);
      expect(rideIns.length, 1);
      expect(rideIns.first.stopName, 'Stasiun Manggarai');
    });

    test('should handle transfer segments', () {
      final route = RouteAlternative(
        id: '1',
        origin: JourneyPoint(latitude: -6.2, longitude: 106.8, name: 'A'),
        destination: JourneyPoint(latitude: -6.4, longitude: 107.0, name: 'B'),
        departureTime: '08:00:00',
        arrivalTime: '09:30:00',
        totalDurationSeconds: 5400,
        transitDurationSeconds: 4200,
        walkingDurationSeconds: 1200,
        walkingDistanceMeters: 1500,
        waitingDurationSeconds: 0,
        transferCount: 1,
        fareText: 'Rp 5000',
        segments: [
          JourneySegment(
            type: 'TRANSIT',
            durationSeconds: 900,
            instruction: 'Ride KRL',
            fromName: 'Stasiun UI',
            toName: 'Stasiun Pasar Minggu',
            fromLat: -6.2,
            fromLon: 106.8,
            toLat: -6.3,
            toLon: 106.8,
            routeShortName: 'KRL',
            tripHeadsign: 'Bogor',
          ),
          JourneySegment(
            type: 'TRANSFER',
            durationSeconds: 300,
            instruction: 'Transfer to TransJakarta',
            fromName: 'Stasiun Pasar Minggu',
            toName: 'Stasiun Pasar Minggu',
            fromLat: -6.3,
            fromLon: 106.8,
          ),
          JourneySegment(
            type: 'TRANSIT',
            durationSeconds: 900,
            instruction: 'Ride TransJakarta',
            fromName: 'Stasiun Pasar Minggu',
            toName: 'Blok M',
            fromLat: -6.3,
            fromLon: 106.8,
            toLat: -6.4,
            toLon: 106.9,
            routeShortName: 'TJ1',
            tripHeadsign: 'Blok M',
          ),
        ],
      );

      final instructions = JourneyInstructionMapper.fromJourney(route);

      final transferIns = instructions.where((i) => i.kind == InstructionKind.transfer);
      expect(transferIns.length, 1);
      expect(transferIns.first.title, 'Transfer');

      final boardIns = instructions.where((i) => i.kind == InstructionKind.board);
      expect(boardIns.length, 2);

      final alightIns = instructions.where((i) => i.kind == InstructionKind.alight);
      expect(alightIns.length, 2);
    });

    test('should gracefully handle missing optional data', () {
      final route = RouteAlternative(
        id: '1',
        origin: JourneyPoint(latitude: -6.2, longitude: 106.8),
        destination: JourneyPoint(latitude: -6.3, longitude: 106.9),
        departureTime: '08:00:00',
        arrivalTime: '09:00:00',
        totalDurationSeconds: 3600,
        transitDurationSeconds: 3000,
        walkingDurationSeconds: 600,
        walkingDistanceMeters: 800,
        waitingDurationSeconds: 0,
        transferCount: 0,
        fareText: 'Tarif tidak tersedia',
        segments: [
          JourneySegment(
            type: 'TRANSIT',
            durationSeconds: 3000,
            instruction: 'Ride transit',
            fromName: '',
            toName: '',
          ),
        ],
      );

      final instructions = JourneyInstructionMapper.fromJourney(route);

      expect(instructions.length, 4);
      expect(instructions[1].kind, InstructionKind.board);
      expect(instructions[1].title, 'Naik Transit');
    });

    test('should format duration labels correctly', () {
      final route = RouteAlternative(
        id: '1',
        origin: JourneyPoint(latitude: -6.2, longitude: 106.8, name: 'A'),
        destination: JourneyPoint(latitude: -6.3, longitude: 106.9, name: 'B'),
        departureTime: '08:00:00',
        arrivalTime: '09:00:00',
        totalDurationSeconds: 3600,
        transitDurationSeconds: 3000,
        walkingDurationSeconds: 600,
        walkingDistanceMeters: 800,
        waitingDurationSeconds: 0,
        transferCount: 0,
        fareText: 'Rp 5000',
        segments: [],
      );

      final instructions = JourneyInstructionMapper.fromJourney(route);

      expect(instructions[0].subtitle, '08:00');
    });
  });
}
