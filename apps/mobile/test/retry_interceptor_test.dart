import 'package:flutter_test/flutter_test.dart';
import 'package:dio/dio.dart';
import 'package:mobile/core/api/retry_interceptor.dart';

void main() {
  group('RetryInterceptor', () {
    late RetryInterceptor interceptor;

    setUp(() {
      interceptor = RetryInterceptor(
        maxRetries: 3,
        baseDelay: Duration(milliseconds: 10),
      );
    });

    test('interceptor can be created', () {
      expect(interceptor.maxRetries, 3);
      expect(interceptor.baseDelay, Duration(milliseconds: 10));
    });

    test('should identify retryable status codes', () {
      expect(interceptor.isRetryableStatus(408), true); // Request Timeout
      expect(interceptor.isRetryableStatus(429), true); // Too Many Requests
      expect(interceptor.isRetryableStatus(500), true); // Internal Server Error
      expect(interceptor.isRetryableStatus(502), true); // Bad Gateway
      expect(interceptor.isRetryableStatus(503), true); // Service Unavailable
      expect(interceptor.isRetryableStatus(504), true); // Gateway Timeout
      expect(interceptor.isRetryableStatus(400), false); // Bad Request
      expect(interceptor.isRetryableStatus(401), false); // Unauthorized
      expect(interceptor.isRetryableStatus(404), false); // Not Found
    });

    test('should identify retryable exception types', () {
      expect(
        interceptor.isRetryableException(DioExceptionType.connectionTimeout),
        true,
      );
      expect(
        interceptor.isRetryableException(DioExceptionType.receiveTimeout),
        true,
      );
      expect(
        interceptor.isRetryableException(DioExceptionType.sendTimeout),
        true,
      );
      expect(
        interceptor.isRetryableException(DioExceptionType.connectionError),
        true,
      );
      expect(interceptor.isRetryableException(DioExceptionType.cancel), false);
      expect(
        interceptor.isRetryableException(DioExceptionType.badResponse),
        false,
      );
      expect(interceptor.isRetryableException(DioExceptionType.unknown), false);
    });

    test('should calculate exponential backoff delay', () {
      final interceptor = RetryInterceptor(
        maxRetries: 3,
        baseDelay: Duration(seconds: 1),
      );

      expect(
        interceptor.calculateDelay(0),
        Duration(seconds: 1),
      ); // 2^0 * 1s = 1s
      expect(
        interceptor.calculateDelay(1),
        Duration(seconds: 2),
      ); // 2^1 * 1s = 2s
      expect(
        interceptor.calculateDelay(2),
        Duration(seconds: 4),
      ); // 2^2 * 1s = 4s
      expect(
        interceptor.calculateDelay(3),
        Duration(seconds: 8),
      ); // capped at maxRetries
    });
  });
}
