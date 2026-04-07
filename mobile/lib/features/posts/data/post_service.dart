import '../../../core/network/api_client.dart';
import '../../../core/network/api_exception.dart';
import 'models/post.dart';

class PostService {
  PostService({ApiClient? apiClient})
    : _apiClient = apiClient ?? ApiClient(),
      _ownsApiClient = apiClient == null;

  final ApiClient _apiClient;
  final bool _ownsApiClient;

  Future<List<Post>> fetchPosts({int page = 1, int limit = 20}) async {
    final response = await _apiClient.get(
      '/posts',
      queryParameters: {'page': page, 'limit': limit},
    );

    final postsJson = response['posts'];
    if (postsJson is! List) {
      throw ApiException(message: 'The server returned an invalid posts list.');
    }

    return postsJson
        .whereType<Map>()
        .map((post) => Post.fromJson(Map<String, dynamic>.from(post)))
        .toList(growable: false);
  }

  void close() {
    if (_ownsApiClient) {
      _apiClient.close();
    }
  }
}
