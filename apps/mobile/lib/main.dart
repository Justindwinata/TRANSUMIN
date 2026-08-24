import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'core/theme/app_theme.dart';
import 'features/home/ui/home_screen.dart';
import 'features/auth/auth_provider.dart';
import 'core/network/network_monitor.dart';
import 'features/profile/data/user_preferences_repository.dart';
import 'features/notifications/data/notification_repository.dart';
import 'features/notifications/ui/notification_center_screen.dart';

final sharedPreferencesProvider = Provider<SharedPreferences>(
  (ref) =>
      throw UnimplementedError('SharedPreferences must be overridden in main'),
);

final userPreferencesRepositoryProvider = Provider<UserPreferencesRepository>((
  ref,
) {
  final prefs = ref.watch(sharedPreferencesProvider);
  return UserPreferencesRepository(prefs);
});

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  final prefs = await SharedPreferences.getInstance();
  runApp(
    ProviderScope(
      overrides: [sharedPreferencesProvider.overrideWithValue(prefs)],
      child: const TransumInApp(),
    ),
  );
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
    final isOnline = ref.watch(networkStatusProvider.notifier).isOnline;

    return MaterialApp(
      title: 'TRANSUM-IN',
      theme: AppTheme.lightTheme,
      home:
          authState.isLoading
              ? const Scaffold(body: Center(child: CircularProgressIndicator()))
              : Stack(
                children: [
                   // Notification badge placeholder: will be added via overlay widget later
                   if (!isOnline)
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
                   // Notification badge overlay
                   Positioned(
                     top: 0,
                     right: 0,
                     child: Consumer(
                       builder: (context, ref, _) {
                         final count = ref.watch(unreadNotificationCountProvider);
                         return count > 0
                             ? IconButton(
                                 icon: Stack(
                                   children: [
                                     const Icon(Icons.notifications),
                                     Positioned(
                                       right: 0,
                                       child: CircleAvatar(
                                         radius: 8,
                                         backgroundColor: Colors.red,
                                         child: Text(
                                           count.toString(),
                                           style: const TextStyle(
                                             fontSize: 10,
                                             color: Colors.white,
                                           ),
                                         ),
                                       ),
                                     ),
                                   ],
                                 ),
                                 onPressed: () => Navigator.push(
                                   context,
                                   MaterialPageRoute(builder: (_) => const NotificationCenterScreen()),
                                 ),
                               )
                             : const SizedBox.shrink();
                       },
                     ),
                   ),
                 ],
               ),
             );

                ],
              ),
    );
  }
}
