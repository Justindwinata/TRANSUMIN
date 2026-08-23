import 'package:dio/dio.dart';

class AuthInterceptor extends Interceptor {
  final String? Function() tokenProvider;
  final Function()? onUnauthorized;

  AuthInterceptor(this.tokenProvider, {this.onUnauthorized});

  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    final token = tokenProvider();
    if (token != null && token.isNotEmpty) {
      options.headers['Authorization'] = 'Bearer $token';
    }
    handler.next(options);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    if (err.response?.statusCode == 401) {
      onUnauthorized?.call();
    }
    handler.next(err);
  }
}
