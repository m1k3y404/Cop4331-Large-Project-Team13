import 'package:flutter/material.dart';

import '../../../app/app_scope.dart';
import '../../../app/router/app_router.dart';
import '../../../shared/models/post.dart';
import '../../../shared/navigation/route_args.dart';
import '../../../shared/utils/error_formatting.dart';
import '../../../shared/widgets/post_card.dart';
import '../../../shared/widgets/top_bar.dart';

class MyPostsScreen extends StatefulWidget {
  const MyPostsScreen({super.key});

  @override
  State<MyPostsScreen> createState() => _MyPostsScreenState();
}

class _MyPostsScreenState extends State<MyPostsScreen> {
  List<PostModel> _posts = const [];
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadPosts();
    });
  }

  Future<void> _loadPosts() async {
    final session = AppScope.of(context).sessionController.state;
    if (!session.isSignedIn || session.username == null) {
      setState(() {
        _posts = const [];
        _isLoading = false;
        _error = null;
      });
      return;
    }

    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final posts = await AppScope.of(
        context,
      ).postsRepository.fetchPostsByUser(session.username!);
      if (!mounted) {
        return;
      }
      setState(() {
        _posts = posts;
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

  Future<void> _openPost(PostModel post) async {
    final result = await Navigator.of(context).pushNamed(
      AppRouter.postDetailRoute,
      arguments: PostDetailArgs(postId: post.id, initialPost: post),
    );
    if (result == true && mounted) {
      await _loadPosts();
      if (!mounted) {
        return;
      }
      Navigator.of(context).pop(true);
    }
  }

  Future<void> _editPost(PostModel post) async {
    final result = await Navigator.of(context).pushNamed(
      AppRouter.editPostRoute,
      arguments: WritingScreenArgs(initialPost: post),
    );
    if (result == true && mounted) {
      await _loadPosts();
    }
  }

  Future<void> _deletePost(PostModel post) async {
    try {
      await AppScope.of(context).postsRepository.deletePost(post.id);
      if (!mounted) {
        return;
      }
      setState(() {
        _posts = _posts.where((item) => item.id != post.id).toList();
      });
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

  @override
  Widget build(BuildContext context) {
    final services = AppScope.of(context);

    return AnimatedBuilder(
      animation: services.sessionController,
      builder: (context, _) {
        final session = services.sessionController.state;

        return Scaffold(
          body: SafeArea(
            child: ListView(
              padding: const EdgeInsets.fromLTRB(20, 20, 20, 32),
              children: [
                TopBar(
                  title: 'My posts',
                  subtitle:
                      'Everything returned by the user-specific posts endpoint.',
                  isLoggedIn: session.isSignedIn,
                  username: session.username,
                  onBackPressed: () => Navigator.of(context).maybePop(),
                ),
                const SizedBox(height: 20),
                if (!session.isSignedIn)
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(20),
                      child: Wrap(
                        spacing: 10,
                        runSpacing: 10,
                        children: [
                          const Text('Log in to load your posts.'),
                          TextButton(
                            onPressed: () => Navigator.of(
                              context,
                            ).pushNamed(AppRouter.loginRoute),
                            child: const Text('Login'),
                          ),
                        ],
                      ),
                    ),
                  )
                else if (_isLoading)
                  const Padding(
                    padding: EdgeInsets.symmetric(vertical: 48),
                    child: Center(child: CircularProgressIndicator()),
                  )
                else if (_error != null)
                  Text(_error!)
                else if (_posts.isEmpty)
                  const Text('No posts found for your account yet.')
                else
                  ..._posts.map(
                    (post) => Padding(
                      padding: const EdgeInsets.only(bottom: 14),
                      child: PostCard(
                        post: post,
                        onTap: () => _openPost(post),
                        onEdit: () => _editPost(post),
                        onDelete: () => _deletePost(post),
                      ),
                    ),
                  ),
              ],
            ),
          ),
        );
      },
    );
  }
}
