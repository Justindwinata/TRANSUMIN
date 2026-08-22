import 'package:dio/dio.dart';

class RetryInterceptor extends Interceptor {
  final int maxRetries;
  final Duration baseDelay;
  final Set<int> retryableStatusCodes;

  RetryInterceptor({
    this.maxRetries = 3,
    this.baseDelay = const Duration(seconds: 1),
    this.retryableStatusCodes = const {408, 429, 500, 502, 503, 504},
  });

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) async {
    final requestOptions = err.requestOptions;
    final retryCount = requestOptions.extra['retry_count'] as int? ?? 0;

    if (retryCount >= maxRetries) {
      return handler.next(err);
    }

    final isRetryable = retryableStatusCodes.contains(err.response?.statusCode) ||
        err.type == DioExceptionType.connectionTimeout ||
        err.type == DioExceptionType.receiveTimeout ||
        err.type == DioExceptionType.sendTimeout;

    if (!isRetryable) {
      return handler.next(err);
    }

    final delay = baseDelay * (1 << retryCount);

    await Future.delayed(delay);

    final newOptions = Options(
      method: requestOptions.method,
      headers: requestOptions.headers,
      extra: {'retry_count': retryCount + 1},
    );

    try {
      final response = await Dio(BaseOptions(
        baseUrl: requestOptions.baseUrl,
        connectTimeout: requestOptions.connectTimeout,
        receiveTimeout: requestOptions.receiveTimeout,
      )).request<dynamic>(
        requestOptions.path,
        data: requestOptions.data,
        queryParameters: requestOptions.queryParameters,
        options: newOptions,
      );

      handler.resolve(response);
    } catch (e) {
      handler.next(err);
    }
  }
}