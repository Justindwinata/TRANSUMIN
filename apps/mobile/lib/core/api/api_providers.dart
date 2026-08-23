import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:dio/dio.dart';
import 'api_client.dart';
import 'auth_interceptor.dart';
import 'retry_interceptor.dart';
import 'package:mobile/features/auth/auth_provider.dart';
import 'package:mobile/core/config/environment.dart';

final dioProvider = Provider<Dio>((ref) {
  final dio = Dio(
    BaseOptions(
      baseUrl: AppConfig.apiBaseUrl,
      connectTimeout: AppConfig.connectTimeout,
      receiveTimeout: AppConfig.receiveTimeout,
    ),
  );

  dio.interceptors.add(AuthInterceptor(() {
    return ref.read(authProvider).accessToken;
  }, onUnauthorized: () {
    ref.read(authProvider.notifier).logout();
  }));

  dio.interceptors.add(RetryInterceptor(
    maxRetries: 3,
    baseDelay: const Duration(seconds: 1),
  ));

  if (AppConfig.enableLogging) {
    dio.interceptors.add(
      LogInterceptor(
        requestBody: true,
        responseBody: true,
        error: true,
        requestHeader: false,
        responseHeader: false,
      ),
    );
  }

  return dio;
});

final apiClientProvider = Provider<ApiClient>((ref) {
  return ApiClient(ref.watch(dioProvider));
});
