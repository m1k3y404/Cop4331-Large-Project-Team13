import 'package:flutter/material.dart';

import '../../../app/app_scope.dart';
import '../../../app/router/app_router.dart';
import '../../../shared/models/post.dart';
import '../../../shared/navigation/route_args.dart';
import '../../../shared/utils/error_formatting.dart';
import '../../../shared/widgets/post_card.dart';
import '../../../shared/widgets/top_bar.dart';

class SearchScreen extends StatefulWidget {
  const SearchScreen({super.key, this.args});

  final SearchScreenArgs? args;

  @override
  State<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen> {
  late final TextEditingController _queryController;

  List<PostModel> _results = const [];
  bool _isLoading = false;
  bool _didSearch = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _queryController = TextEditingController(
      text: widget.args?.initialQuery ?? '',
    );
    if (_queryController.text.trim().isNotEmpty) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        _search();
      });
    }
  }

  @override
  void dispose() {
    _queryController.dispose();
    super.dispose();
  }

  Future<void> _search() async {
    final query = _queryController.text.trim();
    if (query.isEmpty) {
      setState(() {
        _didSearch = true;
        _results = const [];
        _error = null;
      });
      return;
    }

    setState(() {
      _isLoading = true;
      _didSearch = true;
      _error = null;
    });

    try {
      final results = await AppScope.of(
        context,
      ).postsRepository.searchPosts(query);
      if (!mounted) {
        return;
      }
      setState(() {
        _results = results;
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
    await Navigator.of(context).pushNamed(
      AppRouter.postDetailRoute,
      arguments: PostDetailArgs(postId: post.id, initialPost: post),
    );
  }

  Future<void> _editPost(PostModel post) async {
    final result = await Navigator.of(context).pushNamed(
      AppRouter.editPostRoute,
      arguments: WritingScreenArgs(initialPost: post),
    );
    if (result == true && mounted) {
      await _search();
    }
  }

  Future<void> _deletePost(PostModel post) async {
    try {
      await AppScope.of(context).postsRepository.deletePost(post.id);
      if (!mounted) {
        return;
      }
      setState(() {
        _results = _results.where((item) => item.id != post.id).toList();
      });
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('Post deleted.')));
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
                  title: 'Search posts',
                  subtitle:
                      'Run the backend search endpoint across titles, content, and tags.',
                  isLoggedIn: session.isSignedIn,
                  username: session.username,
                  onBackPressed: () => Navigator.of(context).maybePop(),
                ),
                const SizedBox(height: 20),
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(20),
                    child: Column(
                      children: [
                        TextField(
                          controller: _queryController,
                          textInputAction: TextInputAction.search,
                          onSubmitted: (_) => _search(),
                          decoration: const InputDecoration(
                            hintText: 'Search term',
                            border: OutlineInputBorder(),
                          ),
                        ),
                        const SizedBox(height: 12),
                        ElevatedButton(
                          onPressed: _isLoading ? null : _search,
                          child: Text(_isLoading ? 'Searching...' : 'Search'),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 20),
                if (_error != null)
                  Text(_error!)
                else if (_isLoading)
                  const Padding(
                    padding: EdgeInsets.symmetric(vertical: 48),
                    child: Center(child: CircularProgressIndicator()),
                  )
                else if (!_didSearch)
                  const Text('Enter a query to start searching.')
                else if (_results.isEmpty)
                  const Text('No posts matched your query.')
                else
                  ..._results.map(
                    (post) => Padding(
                      padding: const EdgeInsets.only(bottom: 14),
                      child: PostCard(
                        post: post,
                        onTap: () => _openPost(post),
                        onEdit: post.isOwnedBy(session.username)
                            ? () => _editPost(post)
                            : null,
                        onDelete: post.isOwnedBy(session.username)
                            ? () => _deletePost(post)
                            : null,
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
