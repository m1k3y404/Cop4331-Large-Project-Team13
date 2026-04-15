import 'package:flutter/material.dart';

import '../../../app/app_scope.dart';
import '../../../app/router/app_router.dart';
import '../../../shared/models/comment.dart';
import '../../../shared/models/post.dart';
import '../../../shared/navigation/route_args.dart';
import '../../../shared/utils/date_formatting.dart';
import '../../../shared/utils/error_formatting.dart';
import '../../../shared/widgets/top_bar.dart';

class PostDetailScreen extends StatefulWidget {
  const PostDetailScreen({super.key, required this.args});

  final PostDetailArgs args;

  @override
  State<PostDetailScreen> createState() => _PostDetailScreenState();
}

class _PostDetailScreenState extends State<PostDetailScreen> {
  final TextEditingController _commentController = TextEditingController();

  PostModel? _post;
  List<CommentModel> _comments = const [];
  bool _isLoading = true;
  bool _isSubmittingComment = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _post = widget.args.initialPost;
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadData();
    });
  }

  @override
  void dispose() {
    _commentController.dispose();
    super.dispose();
  }

  Future<void> _loadData() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    final services = AppScope.of(context);

    try {
      final results = await Future.wait<dynamic>([
        services.postsRepository.fetchPost(widget.args.postId),
        services.commentsRepository.fetchComments(widget.args.postId),
      ]);

      if (!mounted) {
        return;
      }

      setState(() {
        _post = results[0] as PostModel;
        _comments = results[1] as List<CommentModel>;
      });
    } catch (error) {
      if (!mounted) {
        return;
      }
      setState(() {
        _error = formatErrorMessage(error);
      });
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  Future<void> _editPost() async {
    final post = _post;
    if (post == null) {
      return;
    }

    final result = await Navigator.of(context).pushNamed(
      AppRouter.editPostRoute,
      arguments: WritingScreenArgs(initialPost: post),
    );

    if (result == true && mounted) {
      await _loadData();
    }
  }

  Future<void> _deletePost() async {
    final post = _post;
    final repository = AppScope.of(context).postsRepository;
    if (post == null) {
      return;
    }

    final confirmed =
        await showDialog<bool>(
          context: context,
          builder: (context) {
            return AlertDialog(
              title: const Text('Delete post?'),
              content: Text('Delete "${post.title}" and its comments?'),
              actions: [
                TextButton(
                  onPressed: () => Navigator.of(context).pop(false),
                  child: const Text('Cancel'),
                ),
                ElevatedButton(
                  onPressed: () => Navigator.of(context).pop(true),
                  child: const Text('Delete'),
                ),
              ],
            );
          },
        ) ??
        false;

    if (!confirmed) {
      return;
    }

    try {
      await repository.deletePost(post.id);
      if (!mounted) {
        return;
      }
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('Post deleted.')));
      Navigator.of(context).pop(true);
    } catch (error) {
      if (!mounted) {
        return;
      }
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text(formatErrorMessage(error))));
    }
  }

  Future<void> _addComment() async {
    final session = AppScope.of(context).sessionController.state;
    final post = _post;
    final content = _commentController.text.trim();

    if (post == null) {
      return;
    }

    if (!session.isSignedIn || session.username == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please log in before commenting.')),
      );
      return;
    }

    if (content.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Comment content is required.')),
      );
      return;
    }

    setState(() {
      _isSubmittingComment = true;
    });

    try {
      final comment = await AppScope.of(context).commentsRepository
          .createComment(
            postId: post.id,
            creator: session.username!,
            content: content,
          );

      if (!mounted) {
        return;
      }

      _commentController.clear();
      setState(() {
        _comments = [..._comments, comment];
      });
    } catch (error) {
      if (!mounted) {
        return;
      }
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text(formatErrorMessage(error))));
    } finally {
      if (mounted) {
        setState(() {
          _isSubmittingComment = false;
        });
      }
    }
  }

  Future<void> _deleteComment(CommentModel comment) async {
    try {
      await AppScope.of(context).commentsRepository.deleteComment(comment.id);
      if (!mounted) {
        return;
      }
      setState(() {
        _comments = _comments.where((item) => item.id != comment.id).toList();
      });
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('Comment deleted.')));
    } catch (error) {
      if (!mounted) {
        return;
      }
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text(formatErrorMessage(error))));
    }
  }

  @override
  Widget build(BuildContext context) {
    final services = AppScope.of(context);

    return AnimatedBuilder(
      animation: services.sessionController,
      builder: (context, _) {
        final session = services.sessionController.state;
        final post = _post;

        return Scaffold(
          body: SafeArea(
            child: ListView(
              padding: const EdgeInsets.fromLTRB(20, 20, 20, 32),
              children: [
                TopBar(
                  title: 'Post detail',
                  subtitle:
                      'Full post content, scores, comments, and owner actions.',
                  isAuthReady: session.isLoaded,
                  isLoggedIn: session.isLoaded && session.isSignedIn,
                  username: session.username,
                  onBackPressed: () => Navigator.of(context).maybePop(),
                  onLoginPressed: () =>
                      Navigator.of(context).pushNamed(AppRouter.loginRoute),
                  onRegisterPressed: () =>
                      Navigator.of(context).pushNamed(AppRouter.registerRoute),
                ),
                const SizedBox(height: 20),
                if (_isLoading)
                  const Padding(
                    padding: EdgeInsets.symmetric(vertical: 48),
                    child: Center(child: CircularProgressIndicator()),
                  )
                else if (_error != null)
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(20),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Could not load post',
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          const SizedBox(height: 8),
                          Text(_error!),
                          const SizedBox(height: 12),
                          ElevatedButton(
                            onPressed: _loadData,
                            child: const Text('Try again'),
                          ),
                        ],
                      ),
                    ),
                  )
                else if (post == null)
                  const Card(
                    child: Padding(
                      padding: EdgeInsets.all(20),
                      child: Text('Post not found.'),
                    ),
                  )
                else ...[
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(24),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            post.title,
                            style: Theme.of(context).textTheme.displayLarge,
                          ),
                          const SizedBox(height: 16),
                          Wrap(
                            spacing: 10,
                            runSpacing: 10,
                            children: [
                              _DetailChip(label: 'by ${post.creator}'),
                              _DetailChip(
                                label: formatShortDate(post.createdAt),
                              ),
                              _DetailChip(
                                label: post.isAnalyzed
                                    ? 'Analyzed'
                                    : 'Pending analysis',
                              ),
                              if (post.commentCount != null)
                                _DetailChip(
                                  label: '${post.commentCount} comments',
                                ),
                            ],
                          ),
                          const SizedBox(height: 20),
                          Text(
                            post.content,
                            style: Theme.of(context).textTheme.bodyLarge,
                          ),
                          const SizedBox(height: 20),
                          Text(
                            'Scores',
                            style: Theme.of(context).textTheme.headlineMedium,
                          ),
                          const SizedBox(height: 10),
                          if (post.scores.isEmpty)
                            const Text(
                              'No analyzer scores are stored for this post yet.',
                            )
                          else
                            Wrap(
                              spacing: 10,
                              runSpacing: 10,
                              children: post.scores.entries.map((entry) {
                                return _DetailChip(
                                  label:
                                      '${entry.key}: ${(entry.value * 100).round()}%',
                                );
                              }).toList(),
                            ),
                          if (post.isOwnedBy(session.username)) ...[
                            const SizedBox(height: 20),
                            Wrap(
                              spacing: 10,
                              runSpacing: 10,
                              children: [
                                OutlinedButton(
                                  onPressed: _editPost,
                                  child: const Text('Edit post'),
                                ),
                                TextButton(
                                  onPressed: _deletePost,
                                  child: const Text('Delete post'),
                                ),
                              ],
                            ),
                          ],
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 20),
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(20),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Comments',
                            style: Theme.of(context).textTheme.headlineMedium,
                          ),
                          const SizedBox(height: 16),
                          if (session.isSignedIn)
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                TextField(
                                  controller: _commentController,
                                  minLines: 3,
                                  maxLines: 5,
                                  decoration: const InputDecoration(
                                    labelText: 'Add a comment',
                                    alignLabelWithHint: true,
                                    border: OutlineInputBorder(),
                                  ),
                                ),
                                const SizedBox(height: 12),
                                ElevatedButton(
                                  onPressed: _isSubmittingComment
                                      ? null
                                      : _addComment,
                                  child: Text(
                                    _isSubmittingComment
                                        ? 'Posting...'
                                        : 'Post comment',
                                  ),
                                ),
                              ],
                            )
                          else
                            Wrap(
                              spacing: 10,
                              runSpacing: 10,
                              children: [
                                const Text('Log in to leave a comment.'),
                                TextButton(
                                  onPressed: () => Navigator.of(
                                    context,
                                  ).pushNamed(AppRouter.loginRoute),
                                  child: const Text('Login'),
                                ),
                              ],
                            ),
                          const SizedBox(height: 20),
                          if (_comments.isEmpty)
                            const Text('No comments yet.')
                          else
                            ..._comments.map(
                              (comment) => Padding(
                                padding: const EdgeInsets.only(bottom: 12),
                                child: Container(
                                  padding: const EdgeInsets.all(16),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFFFFFCF6),
                                    borderRadius: BorderRadius.circular(18),
                                    border: Border.all(
                                      color: const Color(0xFFE7DED1),
                                    ),
                                  ),
                                  child: Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Row(
                                        children: [
                                          Expanded(
                                            child: Text(
                                              '${comment.creator} • ${formatShortDate(comment.createdAt)}',
                                              style: const TextStyle(
                                                fontSize: 13,
                                                fontWeight: FontWeight.w600,
                                                color: Color(0xFF6B625B),
                                              ),
                                            ),
                                          ),
                                          if (comment.creator ==
                                              session.username)
                                            TextButton(
                                              onPressed: () =>
                                                  _deleteComment(comment),
                                              child: const Text('Delete'),
                                            ),
                                        ],
                                      ),
                                      const SizedBox(height: 8),
                                      Text(comment.content),
                                    ],
                                  ),
                                ),
                              ),
                            ),
                        ],
                      ),
                    ),
                  ),
                ],
              ],
            ),
          ),
        );
      },
    );
  }
}

class _DetailChip extends StatelessWidget {
  const _DetailChip({required this.label});

  final String label;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: const Color(0xFFF1E7D7),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        label,
        style: const TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.w600,
          color: Color(0xFF7A5324),
        ),
      ),
    );
  }
}
