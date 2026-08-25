import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/core/data/freshness_model.dart';

void main() {
  group('FreshnessModel', () {
    test('getFreshnessState identifies fresh data within 24h', () {
      final now = DateTime.now();
      final retrievedAt = now.subtract(const Duration(hours: 12));
      final state = getFreshnessState(retrievedAt, null);
      expect(state, 'fresh');
    });

    test('getFreshnessState identifies recent data within 7 days', () {
      final now = DateTime.now();
      final retrievedAt = now.subtract(const Duration(days: 3));
      final state = getFreshnessState(retrievedAt, null);
      expect(state, 'recent');
    });

    test('getFreshnessState identifies stale data older than 7 days', () {
      final now = DateTime.now();
      final retrievedAt = now.subtract(const Duration(days: 10));
      final state = getFreshnessState(retrievedAt, null);
      expect(state, 'stale');
    });

    test('getFreshnessState identifies unknown state when timestamp is null', () {
      final state = getFreshnessState(null, null);
      expect(state, 'unknown');
    });

    test('getFreshnessLabel returns appropriate Indonesian label', () {
      expect(getFreshnessLabel('fresh'), 'Data terbaru');
      expect(getFreshnessLabel('recent'), 'Data terbaru');
      expect(getFreshnessLabel('stale'), 'Data mungkin tidak terkini');
      expect(getFreshnessLabel('unknown'), 'Status data tidak tersedia');
      expect(getFreshnessLabel('unavailable'), 'Data tidak tersedia');
    });

    test('getFreshnessMessage returns human-readable Indonesian text', () {
      final retrievedAt = DateTime.now();
      expect(getFreshnessMessage('fresh', retrievedAt: retrievedAt), 'Data diperbarui hari ini');
      expect(getFreshnessMessage('stale'), 'Data mungkin tidak mencerminkan situasi terkini');
      expect(getFreshnessMessage('unknown'), 'Kami tidak dapat memastikan kapan data ini diperbarui');
    });

    test('isFreshEnoughForRouting validates states correctly', () {
      expect(isFreshEnoughForRouting('fresh'), true);
      expect(isFreshEnoughForRouting('recent'), true);
      expect(isFreshEnoughForRouting('stale'), false);
      expect(isFreshEnoughForRouting('unknown'), false);
      expect(isFreshEnoughForRouting('unavailable'), false);
    });
  });
}
