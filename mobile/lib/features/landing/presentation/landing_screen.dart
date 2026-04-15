import 'package:flutter/material.dart';

import '../../../app/app_scope.dart';
import '../../../app/router/app_router.dart';
import '../../../shared/models/post.dart';
import '../../../shared/models/score_filter.dart';
import '../../../shared/navigation/route_args.dart';
import '../../../shared/utils/error_formatting.dart';
import '../../../shared/widgets/post_card.dart';
import '../../../shared/widgets/top_bar.dart';

class LandingScreen extends StatefulWidget {
  const LandingScreen({super.key});

  @override
  State<LandingScreen> createState() => _LandingScreenState();
}

class _LandingScreenState extends State<LandingScreen> {
  static const int _pageSize = 10;

  final TextEditingController _searchController = TextEditingController();

  List<PostModel> _posts = const [];
  List<ScoreFilter> _activeFilters = const [];
  bool _isLoading = true;
  bool _isLoadingMore = false;
  String? _error;
  int _page = 1;
  int _total = 0;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadPosts(reset: true);
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  bool get _hasMore => _posts.length < _total;

  Future<void> _loadPosts({required bool reset}) async {
    if (reset) {
      setState(() {
        _isLoading = true;
        _error = null;
      });
    } else {
      setState(() {
        _isLoadingMore = true;
        _error = null;
      });
    }

    final repository = AppScope.of(context).postsRepository;
    final nextPage = reset ? 1 : _page + 1;

    try {
      final response = _activeFilters.isEmpty
          ? await repository.fetchLatestPosts(page: nextPage, limit: _pageSize)
          : await repository.filterPosts(
              _activeFilters,
              page: nextPage,
              limit: _pageSize,
            );

      if (!mounted) {
        return;
      }

      setState(() {
        _posts = reset ? response.posts : [..._posts, ...response.posts];
        _page = response.page;
        _total = response.total;
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
          _isLoadingMore = false;
        });
      }
    }
  }

  Future<void> _openWriter() async {
    final result = await Navigator.of(
      context,
    ).pushNamed(AppRouter.writingRoute);
    if (result == true && mounted) {
      await _loadPosts(reset: true);
    }
  }

  Future<void> _openSearch() async {
    await Navigator.of(context).pushNamed(
      AppRouter.searchRoute,
      arguments: SearchScreenArgs(initialQuery: _searchController.text.trim()),
    );
  }

  Future<void> _openMyPosts() async {
    final result = await Navigator.of(
      context,
    ).pushNamed(AppRouter.myPostsRoute);
    if (result == true && mounted) {
      await _loadPosts(reset: true);
    }
  }

  Future<void> _openLogin() async {
    final result = await Navigator.of(context).pushNamed(AppRouter.loginRoute);
    if (result == true && mounted) {
      setState(() {});
    }
  }

  Future<void> _openRegister() async {
    await Navigator.of(context).pushNamed(AppRouter.registerRoute);
  }

  Future<void> _openPost(PostModel post) async {
    final result = await Navigator.of(context).pushNamed(
      AppRouter.postDetailRoute,
      arguments: PostDetailArgs(postId: post.id, initialPost: post),
    );
    if (result == true && mounted) {
      await _loadPosts(reset: true);
    }
  }

  Future<void> _editPost(PostModel post) async {
    final result = await Navigator.of(context).pushNamed(
      AppRouter.editPostRoute,
      arguments: WritingScreenArgs(initialPost: post),
    );
    if (result == true && mounted) {
      await _loadPosts(reset: true);
    }
  }

  Future<void> _deletePost(PostModel post) async {
    final repository = AppScope.of(context).postsRepository;
    final confirmed =
        await showDialog<bool>(
          context: context,
          builder: (context) {
            return AlertDialog(
              title: const Text('Delete post?'),
              content: Text(
                'This will remove "${post.title}" and all of its comments.',
              ),
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
      await _loadPosts(reset: true);
    } catch (error) {
      if (!mounted) {
        return;
      }
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text(formatErrorMessage(error))));
    }
  }

  Future<void> _signOut() async {
    await AppScope.of(context).sessionController.signOut();
    if (!mounted) {
      return;
    }
    ScaffoldMessenger.of(
      context,
    ).showSnackBar(const SnackBar(content: Text('Signed out.')));
    setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    final services = AppScope.of(context);

    return AnimatedBuilder(
      animation: services.sessionController,
      builder: (context, _) {
        final latestSession = services.sessionController.state;

        return Scaffold(
          body: SafeArea(
            child: RefreshIndicator(
              onRefresh: () => _loadPosts(reset: true),
              child: ListView(
                padding: const EdgeInsets.fromLTRB(20, 24, 20, 32),
                children: [
                  TopBar(
                    title: 'Inkly',
                    subtitle:
                        'Mobile branch build: browse, write, search, and manage every post flow.',
                    isAuthReady: latestSession.isLoaded,
                    isLoggedIn:
                        latestSession.isLoaded && latestSession.isSignedIn,
                    username: latestSession.username,
                    onCreatePressed: _openWriter,
                    onMyPostsPressed: _openMyPosts,
                    onSearchPressed: _openSearch,
                    onLoginPressed: _openLogin,
                    onRegisterPressed: _openRegister,
                    onSignOutPressed: _signOut,
                  ),
                  const SizedBox(height: 24),
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(24),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Latest posts, score queries, and JWT login',
                            style: Theme.of(context).textTheme.headlineMedium,
                          ),
                          const SizedBox(height: 10),
                          Text(
                            latestSession.isSignedIn
                                ? 'You are signed in as ${latestSession.username}. Create posts, leave comments, and manage your own content from here.'
                                : 'Sign in when you want to publish or comment. You can still browse the feed and run score-range queries right away.',
                            style: Theme.of(context).textTheme.bodyLarge,
                          ),
                          const SizedBox(height: 20),
                          TextField(
                            controller: _searchController,
                            textInputAction: TextInputAction.search,
                            onSubmitted: (_) => _openSearch(),
                            decoration: InputDecoration(
                              hintText:
                                  'Search posts by title, content, or tags',
                              suffixIcon: IconButton(
                                onPressed: _openSearch,
                                icon: const Icon(Icons.search),
                              ),
                              border: const OutlineInputBorder(),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 20),
                  _ScoreFilterPanel(
                    activeFilters: _activeFilters,
                    onApply: (filters) {
                      setState(() {
                        _activeFilters = filters;
                      });
                      _loadPosts(reset: true);
                    },
                    onClear: () {
                      setState(() {
                        _activeFilters = const [];
                      });
                      _loadPosts(reset: true);
                    },
                  ),
                  const SizedBox(height: 20),
                  Text(
                    _activeFilters.isEmpty ? 'Recent posts' : 'Filtered posts',
                    style: Theme.of(context).textTheme.headlineMedium,
                  ),
                  const SizedBox(height: 12),
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
                              'Could not load posts',
                              style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                            const SizedBox(height: 10),
                            Text(_error!),
                            const SizedBox(height: 12),
                            ElevatedButton(
                              onPressed: () => _loadPosts(reset: true),
                              child: const Text('Try again'),
                            ),
                          ],
                        ),
                      ),
                    )
                  else if (_posts.isEmpty)
                    Card(
                      child: Padding(
                        padding: const EdgeInsets.all(20),
                        child: Text(
                          _activeFilters.isEmpty
                              ? 'No posts are available yet.'
                              : 'No posts match the selected score ranges.',
                        ),
                      ),
                    )
                  else
                    ..._posts.map(
                      (post) => Padding(
                        padding: const EdgeInsets.only(bottom: 14),
                        child: PostCard(
                          post: post,
                          onTap: () => _openPost(post),
                          onEdit: post.isOwnedBy(latestSession.username)
                              ? () => _editPost(post)
                              : null,
                          onDelete: post.isOwnedBy(latestSession.username)
                              ? () => _deletePost(post)
                              : null,
                        ),
                      ),
                    ),
                  if (_hasMore)
                    Padding(
                      padding: const EdgeInsets.only(top: 8),
                      child: Center(
                        child: ElevatedButton(
                          onPressed: _isLoadingMore
                              ? null
                              : () => _loadPosts(reset: false),
                          child: Text(
                            _isLoadingMore ? 'Loading...' : 'Load more',
                          ),
                        ),
                      ),
                    ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }
}

class _ScoreFilterPanel extends StatefulWidget {
  const _ScoreFilterPanel({
    required this.activeFilters,
    required this.onApply,
    required this.onClear,
  });

  final List<ScoreFilter> activeFilters;
  final ValueChanged<List<ScoreFilter>> onApply;
  final VoidCallback onClear;

  @override
  State<_ScoreFilterPanel> createState() => _ScoreFilterPanelState();
}

class _ScoreFilterPanelState extends State<_ScoreFilterPanel> {
  late final List<_FilterControllers> _rows;

  @override
  void initState() {
    super.initState();
    _rows = widget.activeFilters.isEmpty
        ? [_FilterControllers()]
        : widget.activeFilters.map(_FilterControllers.fromFilter).toList();
  }

  @override
  void dispose() {
    for (final row in _rows) {
      row.dispose();
    }
    super.dispose();
  }

  void _addRow() {
    setState(() {
      _rows.add(_FilterControllers());
    });
  }

  void _removeRow(int index) {
    if (_rows.length == 1) {
      _rows[index].clear();
      setState(() {});
      return;
    }

    final row = _rows.removeAt(index);
    row.dispose();
    setState(() {});
  }

  void _clearAll() {
    for (final row in _rows) {
      row.dispose();
    }
    setState(() {
      _rows
        ..clear()
        ..add(_FilterControllers());
    });
    widget.onClear();
  }

  void _applyFilters() {
    final filters = <ScoreFilter>[];

    for (final row in _rows) {
      final label = row.labelController.text.trim();
      final min = double.tryParse(row.minController.text.trim());
      final max = double.tryParse(row.maxController.text.trim());

      if (label.isEmpty && min == null && max == null) {
        continue;
      }

      if (label.isEmpty || min == null || max == null) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text(
              'Each score filter needs a label, min, and max value.',
            ),
          ),
        );
        return;
      }

      if (min < 0 || min > 1 || max < 0 || max > 1) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Score ranges must stay between 0 and 1.'),
          ),
        );
        return;
      }

      filters.add(ScoreFilter(label: label, min: min, max: max));
    }

    widget.onApply(filters);
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Score-range query widget',
              style: Theme.of(context).textTheme.headlineMedium,
            ),
            const SizedBox(height: 8),
            Text(
              'Build one or more score filters using labels like optimism or nsfw. Values are inclusive and can be entered in either order.',
              style: Theme.of(context).textTheme.bodyMedium,
            ),
            const SizedBox(height: 16),
            ...List.generate(_rows.length, (index) {
              final row = _rows[index];
              return Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: Row(
                  children: [
                    Expanded(
                      flex: 3,
                      child: TextField(
                        controller: row.labelController,
                        decoration: const InputDecoration(
                          labelText: 'Score label',
                          border: OutlineInputBorder(),
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: TextField(
                        controller: row.minController,
                        keyboardType: const TextInputType.numberWithOptions(
                          decimal: true,
                        ),
                        decoration: const InputDecoration(
                          labelText: 'Min',
                          border: OutlineInputBorder(),
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: TextField(
                        controller: row.maxController,
                        keyboardType: const TextInputType.numberWithOptions(
                          decimal: true,
                        ),
                        decoration: const InputDecoration(
                          labelText: 'Max',
                          border: OutlineInputBorder(),
                        ),
                      ),
                    ),
                    IconButton(
                      onPressed: () => _removeRow(index),
                      icon: const Icon(Icons.remove_circle_outline),
                    ),
                  ],
                ),
              );
            }),
            Wrap(
              spacing: 10,
              runSpacing: 10,
              children: [
                OutlinedButton(
                  onPressed: _addRow,
                  child: const Text('Add filter'),
                ),
                ElevatedButton(
                  onPressed: _applyFilters,
                  child: const Text('Apply filters'),
                ),
                TextButton(onPressed: _clearAll, child: const Text('Clear')),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _FilterControllers {
  _FilterControllers({String label = '', String min = '', String max = ''})
    : labelController = TextEditingController(text: label),
      minController = TextEditingController(text: min),
      maxController = TextEditingController(text: max);

  factory _FilterControllers.fromFilter(ScoreFilter filter) {
    return _FilterControllers(
      label: filter.label,
      min: filter.min.toString(),
      max: filter.max.toString(),
    );
  }

  final TextEditingController labelController;
  final TextEditingController minController;
  final TextEditingController maxController;

  void clear() {
    labelController.clear();
    minController.clear();
    maxController.clear();
  }

  void dispose() {
    labelController.dispose();
    minController.dispose();
    maxController.dispose();
  }
}
