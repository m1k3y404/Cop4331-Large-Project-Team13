import '../api/api_client.dart';
import '../models/post.dart';
import '../models/score_filter.dart';

abstract class PostsRepository {
  Future<PagedPostsResponse> fetchLatestPosts({int page = 1, int limit = 20});
  Future<PagedPostsResponse> filterPosts(
    List<ScoreFilter> filters, {
    int page = 1,
    int limit = 20,
  });
  Future<List<PostModel>> searchPosts(String query);
  Future<List<PostModel>> fetchPostsByUser(String username);
  Future<PostModel> fetchPost(String id);
  Future<PostModel> createPost({
    required String title,
    required String content,
    required String creator,
  });
  Future<PostModel> updatePost({
    required String id,
    required String title,
    required String content,
    required String creator,
  });
  Future<void> deletePost(String id);
}

class ApiPostsRepository implements PostsRepository {
  ApiPostsRepository(this._client);

  final ApiClient _client;

  @override
  Future<PagedPostsResponse> fetchLatestPosts({
    int page = 1,
    int limit = 20,
  }) async {
    final response = await _client.get(
      '/api/posts',
      queryParameters: {'page': '$page', 'limit': '$limit'},
    );

    return PagedPostsResponse.fromJson(response as Map<String, dynamic>);
  }

  @override
  Future<PagedPostsResponse> filterPosts(
    List<ScoreFilter> filters, {
    int page = 1,
    int limit = 20,
  }) async {
    final queryParameters = <String, String>{
      'page': '$page',
      'limit': '$limit',
    };
    if (filters.isNotEmpty) {
      queryParameters['scoreFilters'] = ScoreFilter.encodeForQuery(filters);
    }

    final response = await _client.get(
      '/api/posts/filter-by-scores',
      queryParameters: queryParameters,
    );

    return PagedPostsResponse.fromJson(response as Map<String, dynamic>);
  }

  @override
  Future<List<PostModel>> searchPosts(String query) async {
    final response = await _client.get(
      '/api/posts/search',
      queryParameters: {'q': query},
    );

    return _parsePostList(response);
  }

  @override
  Future<List<PostModel>> fetchPostsByUser(String username) async {
    final response = await _client.get('/api/posts/user/$username');
    return _parsePostList(response);
  }

  @override
  Future<PostModel> fetchPost(String id) async {
    final response = await _client.get('/api/posts/$id');
    return PostModel.fromJson(response as Map<String, dynamic>);
  }

  @override
  Future<PostModel> createPost({
    required String title,
    required String content,
    required String creator,
  }) async {
    final response = await _client.post(
      '/api/posts',
      body: {'title': title, 'content': content, 'creator': creator},
    );

    return PostModel.fromJson(response as Map<String, dynamic>);
  }

  @override
  Future<PostModel> updatePost({
    required String id,
    required String title,
    required String content,
    required String creator,
  }) async {
    final response = await _client.put(
      '/api/posts/$id',
      body: {'title': title, 'content': content, 'creator': creator},
    );

    return PostModel.fromJson(response as Map<String, dynamic>);
  }

  @override
  Future<void> deletePost(String id) async {
    await _client.delete('/api/posts/$id');
  }

  List<PostModel> _parsePostList(dynamic response) {
    final rawList = response as List<dynamic>? ?? const [];
    return rawList
        .whereType<Map<String, dynamic>>()
        .map(PostModel.fromJson)
        .toList();
  }
}
