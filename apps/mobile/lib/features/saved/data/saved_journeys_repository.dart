import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/core/api/api_providers.dart';
import 'package:mobile/features/auth/auth_provider.dart';

class SavedJourney {
  final String id;
  final String userId;
  final String originName;
  final String destName;
  final String payloadJson;
  final String? label;
  final DateTime createdAt;

  SavedJourney({
    required this.id,
    required this.userId,
    required this.originName,
    required this.destName,
    required this.payloadJson,
    this.label,
    required this.createdAt,
  });

  factory SavedJourney.fromJson(Map<String, dynamic> json) {
    return SavedJourney(
      id: json['id'] as String,
      userId: json['userId'] as String,
      originName: json['originName'] as String,
      destName: json['destName'] as String,
      payloadJson: json['payloadJson'] as String,
      label: json['label'] as String?,
      createdAt: DateTime.parse(json['createdAt'] as String),
    );
  }
}

class SavedJourneysRepository {
  final Ref _ref;

  SavedJourneysRepository(this._ref);

  Future<List<SavedJourney>> list() async {
    final token = _ref.read(authProvider).accessToken;
    final response = await _ref
        .read(apiClientProvider)
        .get('/saved-journeys', headers: {'Authorization': 'Bearer $token'});

    final journeys = (response as List?)?.cast<Map<String, dynamic>>() ?? [];
    return journeys.map((j) => SavedJourney.fromJson(j)).toList();
  }

  Future<SavedJourney> create({
    required String originName,
    required String destName,
    required String payloadJson,
    String? label,
  }) async {
    final token = _ref.read(authProvider).accessToken;
    final response = await _ref
        .read(apiClientProvider)
        .post(
          '/saved-journeys',
          data: {
            'originName': originName,
            'destName': destName,
            'payloadJson': payloadJson,
            if (label != null) 'label': label,
          },
          headers: {'Authorization': 'Bearer $token'},
        );

    return SavedJourney.fromJson(response);
  }

  Future<SavedJourney> get(String id) async {
    final token = _ref.read(authProvider).accessToken;
    final response = await _ref
        .read(apiClientProvider)
        .get(
          '/saved-journeys/$id',
          headers: {'Authorization': 'Bearer $token'},
        );

    return SavedJourney.fromJson(response);
  }

  Future<void> update(
    String id, {
    String? originName,
    String? destName,
    String? payloadJson,
    String? label,
  }) async {
    final token = _ref.read(authProvider).accessToken;
    final data = <String, dynamic>{};
    if (originName != null) data['originName'] = originName;
    if (destName != null) data['destName'] = destName;
    if (payloadJson != null) data['payloadJson'] = payloadJson;
    if (label != null) data['label'] = label;

    await _ref
        .read(apiClientProvider)
        .patch(
          '/saved-journeys/$id',
          data: data,
          headers: {'Authorization': 'Bearer $token'},
        );
  }

  Future<void> delete(String id) async {
    final token = _ref.read(authProvider).accessToken;
    await _ref
        .read(apiClientProvider)
        .delete(
          '/saved-journeys/$id',
          headers: {'Authorization': 'Bearer $token'},
        );
  }
}

final savedJourneysRepositoryProvider = Provider<SavedJourneysRepository>((
  ref,
) {
  return SavedJourneysRepository(ref);
});
