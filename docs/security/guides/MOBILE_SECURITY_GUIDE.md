# Mobile Security Domain Guide

Practical examples for Flutter/Dart app security testing using `conducting-mobile-app-penetration-test`.

## TRANSUM-IN Mobile Stack

- **Framework**: Flutter (Dart)
- **State Management**: Riverpod
- **Networking**: Dio
- **Storage**: flutter_secure_storage, SharedPreferences
- **Auth**: JWT tokens

## Skills Used

- `conducting-mobile-app-penetration-test`

## Common Security Tests

### Test 1: Secure Storage Audit

**Objective**: Verify sensitive data is encrypted at rest.

**Test**:

```dart
// test/security/storage_test.dart

void main() {
  group('Secure Storage Tests', () {
    test('JWT tokens stored in secure storage', () async {
      const storage = FlutterSecureStorage();
      
      await storage.write(key: 'access_token', value: 'test-jwt-token');
      
      // Verify it's not in SharedPreferences
      final prefs = await SharedPreferences.getInstance();
      expect(prefs.getString('access_token'), isNull);
      
      // Verify it IS in secure storage
      final retrieved = await storage.read(key: 'access_token');
      expect(retrieved, equals('test-jwt-token'));
    });
    
    test('PII not stored in plaintext', () async {
      const storage = FlutterSecureStorage();
      
      // Simulate app saving user profile
      await storage.write(key: 'user_email', value: 'user@example.com');
      await storage.write(key: 'user_phone', value: '+1234567890');
      
      // Check SharedPreferences doesn't have PII
      final prefs = await SharedPreferences.getInstance();
      final keys = prefs.getKeys();
      
      expect(keys.contains('user_email'), isFalse);
      expect(keys.contains('user_phone'), isFalse);
    });
  });
}
```

### Test 2: Certificate Pinning Verification

**Objective**: Ensure app validates server certificates.

```dart
// test/security/cert_pinning_test.dart

void main() {
  group('Certificate Pinning Tests', () {
    test('rejects self-signed certificate', () async {
      final dio = Dio();
      
      // Configure with self-signed cert (should fail)
      dio.options.headers['Authorization'] = 'Bearer test-token';
      
      try {
        await dio.get('https://self-signed.badssl.com/');
        fail('Should have thrown on self-signed cert');
      } on DioException catch (e) {
        expect(e.type, equals(DioExceptionType.badCertificate));
      }
    });
    
    test('accepts valid certificate', () async {
      final dio = Dio();
      dio.options.headers['Authorization'] = 'Bearer test-token';
      
      // Should succeed with valid cert
      final response = await dio.get('https://api.transum-in.local/health');
      expect(response.statusCode, equals(200));
    });
  });
}
```

### Test 3: Network Traffic Inspection

**Objective**: Verify no sensitive data in URL params.

```dart
// test/security/network_test.dart

void main() {
  group('Network Security Tests', () {
    test('tokens not in URL query parameters', () async {
      final dio = Dio();
      dio.interceptors.add(InterceptorsWrapper(
        onRequest: (options, handler) {
          final uri = options.uri;
          final queryParams = uri.queryParameters;
          
          // Tokens should never be in query string
          expect(queryParams.containsKey('token'), isFalse);
          expect(queryParams.containsKey('access_token'), isFalse);
          expect(queryParams.containsKey('jwt'), isFalse);
          
          handler.next(options);
        },
      ));
      
      await dio.get('https://api.example.com/endpoint', 
        queryParameters: {'page': '1'} // No tokens here
      );
    });
    
    test('API responses don\'t leak excess data', () async {
      final dio = Dio();
      dio.options.headers['Authorization'] = 'Bearer valid-token';
      
      final response = await dio.get('https://api.example.com/users/123');
      
      // Response should only have expected fields
      expect(response.data, containsPair('id', 123));
      expect(response.data, containsPair('name', 'Test User'));
      
      // Should NOT have internal/admin fields
      expect(response.data, isNot(containsPair('role', 'admin')));
      expect(response.data, isNot(containsPair('internalId', any)));
      expect(response.data, isNot(containsPair('passwordHash', any)));
    });
  });
}
```

### Test 4: Deep Link Security

**Objective**: Verify deep links don't bypass auth.

```dart
// test/security/deep_link_test.dart

void main() {
  group('Deep Link Security Tests', () {
    test('protected routes require authentication', () async {
      final app = MyApp();
      await tester.pumpWidget(app);
      
      // Try to navigate to protected route via deep link
      await tester.pumpAndSettle(const Duration(seconds: 1));
      
      // Should redirect to login
      expect(find.byType(LoginScreen), findsOneWidget);
    });
    
    test('deep link parameters validated', () async {
      final uri = Uri.parse('transum://journey/123?token=malicious');
      
      // App should validate token before accessing journey
      final result = await handleDeepLink(uri);
      
      expect(result.isValid, isFalse);
    });
  });
}
```

### Test 5: Root/Jailbreak Detection

```dart
// test/security/device_integrity_test.dart

void main() {
  group('Device Integrity Tests', () {
    test('detects rooted/jailbroken devices', () async {
      final detector = DeviceIntegrityDetector();
      
      // Mock root detection
      when(detector.isRooted).thenReturn(true);
      
      final result = await detector.check();
      
      expect(result.isCompromised, isTrue);
      expect(result.warnings, contains('Device appears to be rooted'));
    });
    
    test('allows on secure device', () async {
      final detector = DeviceIntegrityDetector();
      when(detector.isRooted).thenReturn(false);
      
      final result = await detector.check();
      
      expect(result.isCompromised, isFalse);
    });
  });
}
```

## Strix Integration for Mobile

```bash
# Static analysis via Strix
strix -t ./apps/mobile --instruction "
Flutter app with Riverpod + Dio
Test: Secure storage, cert pinning, deep links, root detection
Token storage: flutter_secure_storage
Network: Dio with custom interceptors
"

# Dynamic analysis (requires test build)
strix -t https://staging.transum-in.local/api \
  -t ./apps/mobile/build/ios/ipa/Runner.ipa \
  --instruction "
Mobile app talking to API
Test mobile-to-API auth flow
Verify cert pinning bypass resistance
"
```

## Remediation Checklist

- [ ] All tokens in `flutter_secure_storage` (not SharedPreferences)
- [ ] Certificate pinning implemented and tested
- [ ] Deep links validate auth before navigation
- [ ] Root/jailbreak detection with graceful degradation
- [ ] No PII in logs or analytics
- [ ] API responses filtered for client needs
- [ ] Biometric auth tied to Keystore/Keychain operations
- [ ] Obfuscation enabled for release builds
- [ ] Debug banner disabled in release