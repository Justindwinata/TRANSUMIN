import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'core/theme/app_theme.dart';
import 'features/home/ui/home_screen.dart';
import 'features/auth/auth_provider.dart';
import 'core/network/network_monitor.dart';

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
      ref.read(networkMonitorProvider.future).then((monitor) {
        ref.read(networkStatusProvider.notifier).setMonitor(monitor);
      });
    });
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);
    final networkStatus = ref.watch(networkStatusProvider);

    return MaterialApp(
      title: 'TRANSUM-IN',
      theme: AppTheme.lightTheme,
      home:
          authState.isLoading
              ? const Scaffold(body: Center(child: CircularProgressIndicator()))
              : Stack(
                children: [
                  const HomeScreen(),
                  if (!networkStatus.isOnline)
                    Positioned(
                      bottom: 0,
                      left: 0,
                      right: 0,
                      child: Material(
                        color: Colors.red[800],
                        child: Padding(
                          padding: const EdgeInsets.all(16),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: const [
                              Icon(Icons.wifi_off, color: Colors.white),
                              SizedBox(width: 8),
                              Text(
                                'Tidak ada koneksi internet',
                                style: TextStyle(
                                  color: Colors.white,
                                  fontSize: 14,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                ],
              ),
    );
  }
}
