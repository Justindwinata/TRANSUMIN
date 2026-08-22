import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'core/theme/app_theme.dart';
import 'features/home/ui/home_screen.dart';

void main() {
  runApp(const ProviderScope(child: TransumInApp()));
}

class TransumInApp extends ConsumerWidget {
  const TransumInApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return MaterialApp(
      title: 'TRANSUM-IN',
      theme: AppTheme.lightTheme,
      home: const HomeScreen(),
    );
  }
}
