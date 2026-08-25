import 'package:flutter_test/flutter_test.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:mobile/main.dart';
import 'package:mobile/shared/widgets/place_picker.dart';
import 'package:mobile/features/location/domain/models.dart';
import 'package:mobile/features/history/state/journey_history_notifier.dart';
import 'package:mobile/features/history/data/offline_queue.dart';
import 'package:mobile/features/saved/state/saved_places_notifier.dart';
import 'package:mobile/features/saved/data/saved_places_repository.dart';

class _FakeOfflineQueue implements OfflineQueue {
  @override
  List<OfflineAction> load() => [];
  @override
  Future<void> enqueue(OfflineAction action) async {}
  @override
  Future<void> remove(String id) async {}
  @override
  Future<void> clear() async {}
}

class _FakeSavedPlacesRepository implements SavedPlacesRepository {
  @override
  Future<List<SavedPlace>> list() async => [];
  @override
  Future<SavedPlace> create(String n, String a, double lt, double ln) async => throw UnimplementedError();
  @override
  Future<void> update(String i, String? n, String? a, double? lt, double? ln) async {}
  @override
  Future<void> delete(String id) async {}
}

class _FakeSavedPlacesNotifier extends SavedPlacesNotifier {
  _FakeSavedPlacesNotifier() : super(_FakeSavedPlacesRepository());
  @override
  Future<void> load() async {}
}

class _FakeJourneyHistoryNotifier extends JourneyHistoryNotifier {
  _FakeJourneyHistoryNotifier() : super(HistoryPersistenceDummy(), _FakeOfflineQueue());
  @override
  Future<void> load() async {}
}

void main() {
  testWidgets('PlacePicker should handle selections', (tester) async {
    SharedPreferences.setMockInitialValues({});
    final prefs = await SharedPreferences.getInstance();

    Place? selected;
    await tester.pumpWidget(
      ProviderScope(
        overrides: [
          sharedPreferencesProvider.overrideWithValue(prefs),
          savedPlacesProvider.overrideWith((ref) => _FakeSavedPlacesNotifier()),
          journeyHistoryProvider.overrideWith((ref) => _FakeJourneyHistoryNotifier()),
        ],
        child: MaterialApp(
          home: Scaffold(
            body: PlacePicker(label: 'Pilih', onSelect: (p) => selected = p),
          ),
        ),
      ),
    );
    await tester.pumpAndSettle();
    expect(find.text('Cari Lokasi'), findsOneWidget);
  });
}
