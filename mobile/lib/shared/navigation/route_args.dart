import '../models/post.dart';

class PostDetailArgs {
  const PostDetailArgs({required this.postId, this.initialPost});

  final String postId;
  final PostModel? initialPost;
}

class WritingScreenArgs {
  const WritingScreenArgs({this.initialPost});

  final PostModel? initialPost;
}

class SearchScreenArgs {
  const SearchScreenArgs({this.initialQuery = ''});

  final String initialQuery;
}

class VerifyEmailArgs {
  const VerifyEmailArgs({this.initialToken});

  final String? initialToken;
}

class ResetPasswordArgs {
  const ResetPasswordArgs({this.initialToken});

  final String? initialToken;
}
