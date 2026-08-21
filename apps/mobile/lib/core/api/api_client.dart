import 'package:dio/dio.dart';

class ApiClient {
  final Dio _dio;
  
  ApiClient(this._dio);
  
  Future<Map<String, dynamic>> get(String path, {Map<String, dynamic>? queryParameters}) async {
    final response = await _dio.get(path, queryParameters: queryParameters);
    return response.data as Map<String, dynamic>;
  }
  
  Future<Map<String, dynamic>> post(String path, {dynamic data}) async {
    final response = await _dio.post(path, data: data);
    return response.data as Map<String, dynamic>;
  }

  /// Search for places matching query text
  Future<List<Map<String, dynamic>>> searchPlaces(String query) async {
    final response = await get('/places/search', queryParameters: {'q': query});
    return List<Map<String, dynamic>>.from(response['results'] ?? []);
  }

  /// Reverse geocode coordinates
  Future<Map<String, dynamic>?> reverseGeocode(double lat, double lon) async {
    final response = await get('/places/reverse', queryParameters: {
      'lat': lat.toString(),
      'lon': lon.toString(),
    });
    return response['result'] as Map<String, dynamic>?;
  }
}
