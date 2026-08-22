import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'core/theme/app_theme.dart';
import 'features/home/ui/home_screen.dart';
import 'features/auth/auth_provider.dart';

void main() {
  runApp(const ProviderScope(child: TransumInApp()));
}

class TransumInApp extends ConsumerStatefulWidget {
  const TransumInApp({Key? key}) : super(key: key);

  @override
  ConsumerState<TransumInApp> createState() => _TransumInAppState();
}

class _TransumInAppState extends ConsumerState<TransumInApp> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(authProvider.notifier).initialize();
    });
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);

    return MaterialApp(
      title: 'TRANSUM-IN',
      theme: AppTheme.lightTheme,
      home: authState.isLoading
          ? const Scaffold(
              body: Center(
                child: CircularProgressIndicator(),
              ),
            )
          : const HomeScreen(),
    );
  }
}
