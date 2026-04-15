import '../api/api_client.dart';
import '../models/comment.dart';

abstract class CommentsRepository {
  Future<List<CommentModel>> fetchComments(String postId);
  Future<CommentModel> createComment({
    required String postId,
    required String creator,
    required String content,
  });
  Future<void> deleteComment(String id);
}

class ApiCommentsRepository implements CommentsRepository {
  ApiCommentsRepository(this._client);

  final ApiClient _client;

  @override
  Future<List<CommentModel>> fetchComments(String postId) async {
    final response = await _client.get('/api/comments/$postId');
    final rawList = response as List<dynamic>? ?? const [];
    return rawList
        .whereType<Map<String, dynamic>>()
        .map(CommentModel.fromJson)
        .toList();
  }

  @override
  Future<CommentModel> createComment({
    required String postId,
    required String creator,
    required String content,
  }) async {
    final response = await _client.post(
      '/api/comments',
      body: {'postId': postId, 'creator': creator, 'content': content},
    );

    return CommentModel.fromJson(response as Map<String, dynamic>);
  }

  @override
  Future<void> deleteComment(String id) async {
    await _client.delete('/api/comments/$id');
  }
}
