import 'package:http/http.dart' as http;

import '../shared/api/api_client.dart';
import '../shared/repositories/comments_repository.dart';
import '../shared/repositories/posts_repository.dart';
import '../shared/repositories/users_repository.dart';
import '../shared/session/session_controller.dart';
import '../shared/session/session_store.dart';

class AppServices {
  AppServices({
    required this.postsRepository,
    required this.commentsRepository,
    required this.usersRepository,
    required this.sessionController,
    void Function()? onDispose,
  }) : _onDispose = onDispose;

  factory AppServices.create({
    http.Client? httpClient,
    SessionStore? sessionStore,
  }) {
    final client = httpClient ?? http.Client();
    final sessionController = SessionController(
      sessionStore ?? createDefaultSessionStore(),
    );
    final apiClient = ApiClient(
      httpClient: client,
      authTokenProvider: () => sessionController.state.authToken,
    );

    return AppServices(
      postsRepository: ApiPostsRepository(apiClient),
      commentsRepository: ApiCommentsRepository(apiClient),
      usersRepository: ApiUsersRepository(apiClient),
      sessionController: sessionController,
      onDispose: client.close,
    );
  }

  final PostsRepository postsRepository;
  final CommentsRepository commentsRepository;
  final UsersRepository usersRepository;
  final SessionController sessionController;
  final void Function()? _onDispose;

  void dispose() {
    sessionController.dispose();
    _onDispose?.call();
  }
}
