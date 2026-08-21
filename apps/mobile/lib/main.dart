import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'core/theme/app_theme.dart';

void main() {
  runApp(const ProviderScope(child: TransumInApp()));
}

class TransumInApp extends StatelessWidget {
  const TransumInApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'TRANSUM-IN',
      theme: AppTheme.lightTheme,
      home: const Scaffold(
        body: Center(
          child: Text('TRANSUM-IN — Biar Naik Transum Nggak Bingung'),
        ),
      ),
    );
  }
}
