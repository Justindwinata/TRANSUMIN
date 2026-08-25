import 'package:flutter_test/flutter_test.dart';
import 'package:flutter/material.dart';
import 'package:mobile/features/transit/ui/service_alert_widget.dart';
import 'package:mobile/features/transit/domain/service_alert.dart';

void main() {
  testWidgets('ServiceAlertWidget shows provenance label for official alerts', (tester) async {
    final alert = ServiceAlert(
      id: 'al-1',
      title: 'Penutupan Jalur',
      description: 'Jalur 1 ditutup untuk pemeliharaan',
      startsAt: DateTime.now(),
      severity: AlertSeverity.major,
      status: AlertStatus.active,
      source: 'official',
      isDevelopmentData: false,
    );

    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: ServiceAlertWidget(alert: alert),
        ),
      ),
    );

    expect(find.text('Data resmi'), findsOneWidget);
    expect(find.text('Penutupan Jalur'), findsOneWidget);
  });

  testWidgets('ServiceAlertWidget shows demo label for fixture alerts', (tester) async {
    final alert = ServiceAlert(
      id: 'al-2',
      title: 'Demo Alert',
      description: 'This is a demo',
      startsAt: DateTime.now(),
      severity: AlertSeverity.info,
      status: AlertStatus.active,
      source: 'fixture',
      isDevelopmentData: true,
    );

    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: ServiceAlertWidget(alert: alert),
        ),
      ),
    );

    expect(find.text('Data demo'), findsOneWidget);
  });

  testWidgets('ServiceAlertWidget shows direct label for live alerts', (tester) async {
    final alert = ServiceAlert(
      id: 'al-3',
      title: 'Live Disruption',
      description: 'Current issue',
      startsAt: DateTime.now(),
      severity: AlertSeverity.critical,
      status: AlertStatus.active,
      source: 'live',
      isDevelopmentData: false,
    );

    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: ServiceAlertWidget(alert: alert),
        ),
      ),
    );

    expect(find.text('Data langsung'), findsOneWidget);
  });

  testWidgets('ServiceAlertWidget shows simulation label for development alerts', (tester) async {
    final alert = ServiceAlert(
      id: 'al-4',
      title: 'Simulation',
      description: 'Dev data',
      startsAt: DateTime.now(),
      severity: AlertSeverity.minor,
      status: AlertStatus.active,
      source: 'development',
      isDevelopmentData: true,
    );

    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: ServiceAlertWidget(alert: alert),
        ),
      ),
    );

    expect(find.text('Data simulasi'), findsOneWidget);
  });

  testWidgets('ServiceAlertWidget distinguishes fixture from official via source label', (tester) async {
    final officialAlert = ServiceAlert(
      id: 'official',
      title: 'Official',
      description: 'Officiel',
      startsAt: DateTime.now(),
      source: 'official',
    );

    final fixtureAlert = ServiceAlert(
      id: 'fixture',
      title: 'Fixture',
      description: 'Demo',
      startsAt: DateTime.now(),
      source: 'fixture',
      isDevelopmentData: true,
    );

    await tester.pumpWidget(MaterialApp(home: Scaffold(body: ServiceAlertWidget(alert: officialAlert))));
    expect(find.text('Data resmi'), findsOneWidget);

    await tester.pumpWidget(MaterialApp(home: Scaffold(body: ServiceAlertWidget(alert: fixtureAlert))));
    expect(find.text('Data demo'), findsOneWidget);
  });
}
