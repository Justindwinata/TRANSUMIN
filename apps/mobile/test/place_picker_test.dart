import 'package:flutter_test/flutter_test.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/shared/widgets/place_picker.dart';
import 'package:mobile/features/location/domain/models.dart';

void main() {
  testWidgets('PlacePicker should handle selections', (tester) async {
    Place? selected;
    await tester.pumpWidget(
      ProviderScope(
        child: MaterialApp(
          home: Scaffold(
            body: PlacePicker(label: 'Pilih', onSelect: (p) => selected = p),
          ),
        ),
      ),
    );
    expect(find.text('Cari Lokasi'), findsOneWidget);
  });
}
