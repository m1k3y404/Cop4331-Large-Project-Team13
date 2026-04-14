import 'package:mobile/app/app_services.dart';
import 'package:mobile/shared/models/api_message.dart';
import 'package:mobile/shared/models/comment.dart';
import 'package:mobile/shared/models/post.dart';
import 'package:mobile/shared/models/score_filter.dart';
import 'package:mobile/shared/models/session_state.dart';
import 'package:mobile/shared/repositories/comments_repository.dart';
import 'package:mobile/shared/repositories/posts_repository.dart';
import 'package:mobile/shared/repositories/users_repository.dart';
import 'package:mobile/shared/session/session_controller.dart';
import 'package:mobile/shared/session/session_store.dart';

PostModel buildPost({
  String id = 'post-1',
  String title = 'A backend post',
  String content = 'Post content from the fake repository.',
  String creator = 'writer',
  Map<String, double>? scores,
  bool isAnalyzed = true,
  int? commentCount = 2,
}) {
  return PostModel(
    id: id,
    title: title,
    content: content,
    creator: creator,
    scores: scores ?? const {'optimism': 0.7},
    isAnalyzed: isAnalyzed,
    createdAt: DateTime(2026, 4, 13),
    updatedAt: DateTime(2026, 4, 13),
    commentCount: commentCount,
  );
}

CommentModel buildComment({
  String id = 'comment-1',
  String postId = 'post-1',
  String creator = 'reader',
  String content = 'Great post!',
}) {
  return CommentModel(
    id: id,
    postId: postId,
    creator: creator,
    content: content,
    createdAt: DateTime(2026, 4, 13),
  );
}

class FakePostsRepository implements PostsRepository {
  FakePostsRepository({
    List<PostModel>? latestPosts,
    List<PostModel>? filteredPosts,
    List<PostModel>? searchResults,
    List<PostModel>? userPosts,
    Map<String, PostModel>? postsById,
  }) : latestPosts = latestPosts ?? [buildPost()],
       filteredPosts = filteredPosts ?? [buildPost(title: 'Filtered post')],
       searchResults = searchResults ?? [buildPost(title: 'Search result')],
       userPosts = userPosts ?? [buildPost(title: 'My post')],
       postsById = postsById ?? {'post-1': buildPost()};

  final List<PostModel> latestPosts;
  final List<PostModel> filteredPosts;
  final List<PostModel> searchResults;
  final List<PostModel> userPosts;
  final Map<String, PostModel> postsById;

  List<ScoreFilter> lastFilters = const [];

  @override
  Future<PostModel> createPost({
    required String title,
    required String content,
    required String creator,
  }) async {
    return buildPost(title: title, content: content, creator: creator);
  }

  @override
  Future<void> deletePost(String id) async {}

  @override
  Future<PostModel> fetchPost(String id) async {
    return postsById[id] ?? buildPost(id: id);
  }

  @override
  Future<List<PostModel>> fetchPostsByUser(String username) async {
    return userPosts;
  }

  @override
  Future<PagedPostsResponse> fetchLatestPosts({
    int page = 1,
    int limit = 20,
  }) async {
    return PagedPostsResponse(
      posts: latestPosts,
      total: latestPosts.length,
      page: page,
      limit: limit,
    );
  }

  @override
  Future<PagedPostsResponse> filterPosts(
    List<ScoreFilter> filters, {
    int page = 1,
    int limit = 20,
  }) async {
    lastFilters = filters;
    return PagedPostsResponse(
      posts: filteredPosts,
      total: filteredPosts.length,
      page: page,
      limit: limit,
    );
  }

  @override
  Future<List<PostModel>> searchPosts(String query) async {
    return searchResults;
  }

  @override
  Future<PostModel> updatePost({
    required String id,
    required String title,
    required String content,
    required String creator,
  }) async {
    return buildPost(id: id, title: title, content: content, creator: creator);
  }
}

class FakeCommentsRepository implements CommentsRepository {
  FakeCommentsRepository({List<CommentModel>? comments})
    : comments = comments ?? [buildComment()];

  List<CommentModel> comments;

  @override
  Future<CommentModel> createComment({
    required String postId,
    required String creator,
    required String content,
  }) async {
    final comment = buildComment(
      id: 'comment-${comments.length + 1}',
      postId: postId,
      creator: creator,
      content: content,
    );
    comments = [...comments, comment];
    return comment;
  }

  @override
  Future<void> deleteComment(String id) async {
    comments = comments.where((comment) => comment.id != id).toList();
  }

  @override
  Future<List<CommentModel>> fetchComments(String postId) async {
    return comments.where((comment) => comment.postId == postId).toList();
  }
}

class FakeUsersRepository implements UsersRepository {
  @override
  Future<ApiMessage> forgotPassword(String email) async {
    return const ApiMessage(error: '', message: 'Reset link sent.');
  }

  @override
  Future<ApiMessage> login({
    required String username,
    required String password,
  }) async {
    return const ApiMessage(error: '');
  }

  @override
  Future<ApiMessage> register({
    required String username,
    required String email,
    required String password,
  }) async {
    return const ApiMessage(error: '', message: 'Account created.');
  }

  @override
  Future<ApiMessage> resetPassword({
    required String token,
    required String newPassword,
  }) async {
    return const ApiMessage(error: '', message: 'Password reset.');
  }

  @override
  Future<ApiMessage> verifyEmail(String token) async {
    return const ApiMessage(error: '', message: 'Email verified.');
  }
}

Future<AppServices> createTestServices({
  String? username,
  FakePostsRepository? postsRepository,
  FakeCommentsRepository? commentsRepository,
  FakeUsersRepository? usersRepository,
}) async {
  final store = MemorySessionStore();
  if (username != null) {
    await store.write(
      SessionState(username: username, isSignedIn: true, isLoaded: true),
    );
  }

  return AppServices(
    postsRepository: postsRepository ?? FakePostsRepository(),
    commentsRepository: commentsRepository ?? FakeCommentsRepository(),
    usersRepository: usersRepository ?? FakeUsersRepository(),
    sessionController: SessionController(store),
  );
}
