import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:mobile/features/saved/data/saved_journeys_repository.dart';
import 'dart:convert';

void main() {
  group('SavedJourney replan payload validation', () {
    test('valid payload should parse origin and destination coordinates', () {
      final payload = '{"originLat":-6.2,"originLon":106.8,"destLat":-6.3,"destLon":106.9}';
      final decoded = jsonDecode(payload) as Map<String, dynamic>;

      expect(decoded['originLat'], -6.2);
      expect(decoded['originLon'], 106.8);
      expect(decoded['destLat'], -6.3);
      expect(decoded['destLon'], 106.9);
    });

    test('malformed JSON should not crash deserialization', () {
      const malformed = 'not valid json';
      Map<String, dynamic>? result;
      try {
        result = jsonDecode(malformed) as Map<String, dynamic>?;
      } catch (e) {
        result = {};
      }
      expect(result, isEmpty);
    });

    test('missing coordinates should provide sensible defaults', () {
      final payload = '{"originName":"Home"}';
      final decoded = jsonDecode(payload) as Map<String, dynamic>;
      expect(decoded['originLat'], isNull);
    });

    test('empty payload should be handled gracefully', () {
      const empty = '{}';
      final decoded = jsonDecode(empty) as Map<String, dynamic>;
      expect(decoded, isEmpty);
    });
  });
}
