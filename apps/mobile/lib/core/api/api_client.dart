import 'package:dio/dio.dart';

class ApiClient {
  final Dio _dio;

  ApiClient(this._dio);

  Future<Map<String, dynamic>> get(
    String path, {
    Map<String, dynamic>? queryParameters,
    Map<String, dynamic>? headers,
  }) async {
    final response = await _dio.get(
      path,
      queryParameters: queryParameters,
      options: Options(headers: headers),
    );
    if (response.data is Map) return response.data as Map<String, dynamic>;
    return {'data': response.data};
  }

  Future<Map<String, dynamic>> post(
    String path, {
    dynamic data,
    Map<String, dynamic>? headers,
  }) async {
    final response = await _dio.post(
      path,
      data: data,
      options: Options(headers: headers),
    );
    if (response.data is Map) return response.data as Map<String, dynamic>;
    return {'data': response.data};
  }

  Future<Map<String, dynamic>> patch(
    String path, {
    dynamic data,
    Map<String, dynamic>? headers,
  }) async {
    final response = await _dio.patch(
      path,
      data: data,
      options: Options(headers: headers),
    );
    if (response.data is Map) return response.data as Map<String, dynamic>;
    return {'data': response.data};
  }

  Future<void> delete(String path, {Map<String, dynamic>? headers}) async {
    await _dio.delete(path, options: Options(headers: headers));
  }

  Future<List<Map<String, dynamic>>> searchPlaces(
    String query, {
    String? token,
  }) async {
    final response = await get(
      '/places/search',
      queryParameters: {'q': query},
      headers: {if (token != null) 'Authorization': 'Bearer $token'},
    );
    return List<Map<String, dynamic>>.from(response['results'] ?? []);
  }

  Future<Map<String, dynamic>?> reverseGeocode(
    double lat,
    double lon, {
    String? token,
  }) async {
    final response = await get(
      '/places/reverse',
      queryParameters: {'lat': lat.toString(), 'lon': lon.toString()},
      headers: {if (token != null) 'Authorization': 'Bearer $token'},
    );
    return response['result'] as Map<String, dynamic>?;
  }
}
