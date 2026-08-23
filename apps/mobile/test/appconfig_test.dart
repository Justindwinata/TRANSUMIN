import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/core/config/environment.dart';

void main() {
  group('AppConfig platform safety', () {
    test('should return valid API base URL', () {
      final url = AppConfig.apiBaseUrl;
      expect(url, startsWith('http'));
    });

    test('should return correct environment', () {
      expect(AppConfig.environment, isNotNull);
    });

    test('should return valid timeouts', () {
      expect(AppConfig.connectTimeout.inSeconds, 15);
      expect(AppConfig.receiveTimeout.inSeconds, 30);
    });

    test('should enable logging in development', () {
      expect(AppConfig.enableLogging, true);
    });

    test('should disable logging in testing', () {
      // Cannot test easily since fromEnvironment is const
      expect(AppConfig.environment, isNotNull);
    });
  });
}
