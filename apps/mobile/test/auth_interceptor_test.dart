import 'package:flutter_test/flutter_test.dart';
import 'package:dio/dio.dart';
import 'package:mobile/core/api/auth_interceptor.dart';

class _NoopErrorInterceptorHandler extends ErrorInterceptorHandler {
  @override
  void next(DioException err) {
    // no-op to prevent unhandled async errors in tests
  }
}

void main() {
  group('AuthInterceptor', () {
    late AuthInterceptor interceptor;
    String Function() tokenProvider;
    bool unauthorizedCalled = false;

    setUp(() {
      unauthorizedCalled = false;
      tokenProvider = () => 'test-token';
      interceptor = AuthInterceptor(
        tokenProvider,
        onUnauthorized: () => unauthorizedCalled = true,
      );
    });

    test('should inject Bearer token in headers', () {
      final options = RequestOptions(path: '/test');
      final handler = RequestInterceptorHandler();

      interceptor.onRequest(options, handler);

      expect(options.headers['Authorization'], 'Bearer test-token');
    });

    test('should not add Authorization header if token is null', () {
      final provider = () => null;
      final interceptor = AuthInterceptor(provider);
      final options = RequestOptions(path: '/test');
      final handler = RequestInterceptorHandler();

      interceptor.onRequest(options, handler);

      expect(options.headers['Authorization'], isNull);
    });

    test('should not add Authorization header if token is empty', () {
      final provider = () => '';
      final interceptor = AuthInterceptor(provider);
      final options = RequestOptions(path: '/test');
      final handler = RequestInterceptorHandler();

      interceptor.onRequest(options, handler);

      expect(options.headers['Authorization'], isNull);
    });

    test('should call onUnauthorized on 401 response', () {
      final dioException = DioException(
        requestOptions: RequestOptions(path: '/test'),
        response: Response(
          requestOptions: RequestOptions(path: '/test'),
          statusCode: 401,
        ),
        type: DioExceptionType.badResponse,
      );

      final handler = _NoopErrorInterceptorHandler();
      interceptor.onError(dioException, handler);

      expect(unauthorizedCalled, true);
    });

    test('should not call onUnauthorized on 500 response', () {
      final dioException = DioException(
        requestOptions: RequestOptions(path: '/test'),
        response: Response(
          requestOptions: RequestOptions(path: '/test'),
          statusCode: 500,
        ),
        type: DioExceptionType.badResponse,
      );

      final handler = _NoopErrorInterceptorHandler();
      interceptor.onError(dioException, handler);

      expect(unauthorizedCalled, false);
    });
  });
}
