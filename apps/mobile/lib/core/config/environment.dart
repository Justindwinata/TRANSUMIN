import 'dart:io' show Platform;

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

    if (Platform.isAndroid) {
      return 'http://10.0.2.2:3000';
    } else if (Platform.isIOS) {
      return 'http://localhost:3000';
    }
    return 'http://localhost:3000';
  }

  static bool get enableLogging => environment != Environment.testing;

  static Duration get connectTimeout => const Duration(seconds: 15);
  static Duration get receiveTimeout => const Duration(seconds: 30);
}
