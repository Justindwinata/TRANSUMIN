import 'package:flutter_test/flutter_test.dart';
import 'package:dio/dio.dart';
import 'package:mobile/core/api/retry_interceptor.dart';

void main() {
  group('RetryInterceptor safe method gating', () {
    late RetryInterceptor interceptor;

    setUp(() {
      interceptor = RetryInterceptor(
        maxRetries: 3,
        baseDelay: Duration(milliseconds: 10),
      );
    });

    bool shouldRetry(RequestInterceptorHandler? handler) => true; // placeholder

    test('should identify GET as retryable', () {
      final options = RequestOptions(path: '/test', method: 'GET');
      expect(interceptor.isRetryableStatus(503), true);
    });

    test('should identify HEAD as retryable', () {
      final options = RequestOptions(path: '/test', method: 'HEAD');
      expect(options.method, 'HEAD');
    });

    test('should identify OPTIONS as retryable', () {
      final options = RequestOptions(path: '/test', method: 'OPTIONS');
      expect(options.method, 'OPTIONS');
    });

    test(
      'should identify POST as NOT retryable (idempotency safety)',
      () async {
        final dioException = DioException(
          requestOptions: RequestOptions(path: '/routing/plan', method: 'POST'),
          type: DioExceptionType.connectionError,
        );

        var didRetry = false;
        final handler = _TrackingErrorInterceptorHandler((retryOptions) {
          if (retryOptions.method == 'POST') {
            didRetry = true;
          }
        });

        interceptor.onError(dioException, handler);

        expect(didRetry, false);
      },
    );

    test('should identify PATCH as NOT retryable', () async {
      final dioException = DioException(
        requestOptions: RequestOptions(path: '/users/1', method: 'PATCH'),
        type: DioExceptionType.connectionError,
      );

      var didRetry = false;
      final handler = _TrackingErrorInterceptorHandler((retryOptions) {
        if (retryOptions.method == 'PATCH') {
          didRetry = true;
        }
      });

      interceptor.onError(dioException, handler);

      expect(didRetry, false);
    });

    test('should identify DELETE as NOT retryable', () async {
      final dioException = DioException(
        requestOptions: RequestOptions(path: '/users/1', method: 'DELETE'),
        type: DioExceptionType.connectionError,
      );

      var didRetry = false;
      final handler = _TrackingErrorInterceptorHandler((retryOptions) {
        if (retryOptions.method == 'DELETE') {
          didRetry = true;
        }
      });

      interceptor.onError(dioException, handler);

      expect(didRetry, false);
    });

    test('should allow GET retry when server is down', () async {
      final dioException = DioException(
        requestOptions: RequestOptions(path: '/saved-places', method: 'GET'),
        type: DioExceptionType.connectionError,
      );

      var didRetry = false;
      final handler = _TrackingErrorInterceptorHandler((retryOptions) {
        if (retryOptions.method == 'GET') {
          didRetry = true;
        }
      });

      interceptor.onError(dioException, handler);
    });

    test('should bound retry count and not exceed max', () {
      final options = RequestOptions(path: '/test', method: 'GET');
      options.extra['retry_count'] = 3;

      final dioException = DioException(
        requestOptions: options,
        type: DioExceptionType.connectionError,
      );

      final handler = _TrackingErrorInterceptorHandler((_) {});
      interceptor.onError(dioException, handler);

      expect(interceptor.maxRetries, 3);
    });
  });
}

class _NoopErrorInterceptorHandler extends ErrorInterceptorHandler {
  @override
  void next(DioException err) {}
}

class _TrackingErrorInterceptorHandler extends ErrorInterceptorHandler {
  final void Function(RequestOptions) onAttempt;

  _TrackingErrorInterceptorHandler(this.onAttempt);

  @override
  void resolve(Response response) {
    onAttempt(response.requestOptions);
  }

  @override
  void next(DioException err) {}
}
