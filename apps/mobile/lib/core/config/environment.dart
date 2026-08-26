import 'package:flutter/foundation.dart'
    show kIsWeb, defaultTargetPlatform, TargetPlatform;

enum Environment { development, production, testing }

class AppConfig {
  static Environment get environment {
    const env = String.fromEnvironment('ENV', defaultValue: 'development');
    switch (env) {
      case 'production':
        return Environment.production;
      case 'testing':
        return Environment.testing;
      default:
        return Environment.development;
    }
  }

  static String get apiBaseUrl {
    const fromEnv = String.fromEnvironment('API_BASE_URL', defaultValue: '');
    if (fromEnv.isNotEmpty) return fromEnv;

    if (kIsWeb) {
      return 'http://localhost:3000';
    }

    switch (defaultTargetPlatform) {
      case TargetPlatform.android:
        return 'http://10.0.2.2:3000';
      case TargetPlatform.iOS:
      case TargetPlatform.macOS:
        return 'http://localhost:3000';
      default:
        return 'http://localhost:3000';
    }
  }

  static TargetPlatform get defaultPlatform => defaultTargetPlatform;

  static bool get enableLogging =>
      environment != Environment.testing &&
      environment != Environment.production;

  static Duration get connectTimeout => const Duration(seconds: 15);
  static Duration get receiveTimeout => const Duration(seconds: 30);
}
