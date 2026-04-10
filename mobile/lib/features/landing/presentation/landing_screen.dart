import 'package:flutter/material.dart';

import '../../../app/router/app_router.dart';
import '../../../core/network/api_exception.dart';
import '../../../shared/widgets/top_bar.dart';
import '../../posts/data/models/post.dart';
import '../../posts/data/post_service.dart';

class LandingScreen extends StatefulWidget {
  const LandingScreen({super.key});

  @override
  State<LandingScreen> createState() => _LandingScreenState();
}

class _LandingScreenState extends State<LandingScreen> {
  final PostService _postService = PostService();

  bool _isLoggedIn = false;
  bool _isLoadingPosts = true;
  String _username = 'user';
  String? _postsError;
  List<Post> _posts = const [];

  @override
  void initState() {
    super.initState();
    _loadPosts();
  }

  @override
  void dispose() {
    _postService.close();
    super.dispose();
  }

  Future<void> _handleLogin() async {
    final username = await Navigator.of(
      context,
    ).pushNamed<String?>(AppRouter.authRoute);
    if (!mounted || username == null || username.isEmpty) {
      return;
    }

    setState(() {
      _isLoggedIn = true;
      _username = username;
    });
  }

  Future<void> _handleStartWriting() async {
    if (!_isLoggedIn) {
      await _handleLogin();
      if (!_isLoggedIn || !mounted) {
        return;
      }
    }

    Navigator.of(context).pushNamed(AppRouter.writingRoute, arguments: _username);
  }

  Future<void> _loadPosts() async {
    setState(() {
      _isLoadingPosts = true;
      _postsError = null;
    });

    try {
      final posts = await _postService.fetchPosts();
      if (!mounted) {
        return;
      }

      setState(() {
        _posts = posts;
        _isLoadingPosts = false;
      });
    } catch (error) {
      if (!mounted) {
        return;
      }

      setState(() {
        _postsError = _toErrorMessage(error);
        _isLoadingPosts = false;
      });
    }
  }

  String _toErrorMessage(Object error) {
    if (error is ApiException) {
      return error.message;
    }

    return 'Something went wrong while loading posts.';
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      body: SafeArea(
        child: LayoutBuilder(
          builder: (context, constraints) {
            final horizontalPadding = constraints.maxWidth >= 900 ? 64.0 : 24.0;
            final verticalSpacing = constraints.maxWidth >= 900 ? 56.0 : 32.0;
            final isWide = constraints.maxWidth >= 900;

            return SingleChildScrollView(
              padding: EdgeInsets.symmetric(
                horizontal: horizontalPadding,
                vertical: 24,
              ),
              child: Center(
                child: ConstrainedBox(
                  constraints: const BoxConstraints(maxWidth: 1100),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      TopBar(
                        isLoggedIn: _isLoggedIn,
                        username: _username,
                        onLoginPressed: () {
                          _handleLogin();
                        },
                      ),
                      SizedBox(height: verticalSpacing),
                      Wrap(
                        spacing: 32,
                        runSpacing: 32,
                        crossAxisAlignment: WrapCrossAlignment.center,
                        children: [
                          SizedBox(
                            width: isWide
                                ? (constraints.maxWidth -
                                          (horizontalPadding * 2) -
                                          32) /
                                      2
                                : double.infinity,
                            child: _HeroSection(
                              theme: theme,
                              onStartWritingPressed: _handleStartWriting,
                            ),
                          ),
                          SizedBox(
                            width: isWide
                                ? (constraints.maxWidth -
                                          (horizontalPadding * 2) -
                                          32) /
                                      2
                                : double.infinity,
                            child: _PreviewCard(
                              featuredPost: _posts.isEmpty
                                  ? null
                                  : _posts.first,
                            ),
                          ),
                        ],
                      ),
                      SizedBox(height: verticalSpacing),
                      _PostsSection(
                        posts: _posts,
                        isLoading: _isLoadingPosts,
                        errorMessage: _postsError,
                        onRetry: _loadPosts,
                      ),
                    ],
                  ),
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}

class _HeroSection extends StatelessWidget {
  const _HeroSection({
    required this.theme,
    required this.onStartWritingPressed,
  });

  final ThemeData theme;
  final VoidCallback onStartWritingPressed;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          decoration: BoxDecoration(
            color: const Color(0xFFEDE3D4),
            borderRadius: BorderRadius.circular(999),
          ),
          child: const Text(
            'Blogging with a more controllable algorithm',
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: Color(0xFF7A5324),
            ),
          ),
        ),
        const SizedBox(height: 24),
        Text(
          'Post blogs, auto-tag them with AI, and tune the feed you actually want.',
          style: theme.textTheme.displayLarge,
        ),
        const SizedBox(height: 20),
        Text(
          'Tilt is a blogging app where users control their algorithm better. An LLM auto-tags posts so users can shape what kinds of posts show up alongside core features like publishing, comments, and a feed.',
          style: theme.textTheme.bodyLarge,
        ),
        const SizedBox(height: 28),
        Wrap(
          spacing: 12,
          runSpacing: 12,
          children: [
            ElevatedButton(
              onPressed: () {
                onStartWritingPressed();
              },
              child: const Text('Start writing'),
            ),
            OutlinedButton(
              onPressed: () {
                Navigator.of(context).pushNamed(AppRouter.authRoute);
              },
              child: const Text('Login or sign up'),
            ),
          ],
        ),
      ],
    );
  }
}

class _PreviewCard extends StatelessWidget {
  const _PreviewCard({this.featuredPost});

  final Post? featuredPost;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(28),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              featuredPost == null
                  ? 'Featured draft'
                  : 'Latest post from the API',
              style: theme.textTheme.bodyMedium?.copyWith(
                fontWeight: FontWeight.w600,
                color: const Color(0xFF7A5324),
              ),
            ),
            const SizedBox(height: 16),
            Text(
              featuredPost?.title ??
                  'Designing a feed that listens to readers, not just engagement.',
              style: theme.textTheme.headlineMedium,
            ),
            const SizedBox(height: 16),
            Text(
              featuredPost?.preview ??
                  'Tilt pairs normal blogging features with LLM-generated tags so readers can guide the recommendation mix around the topics they care about most.',
              style: theme.textTheme.bodyLarge,
            ),
            const SizedBox(height: 24),
            const Divider(color: Color(0xFFE7DED1)),
            const SizedBox(height: 24),
            Row(
              children: [
                Container(
                  width: 48,
                  height: 48,
                  decoration: const BoxDecoration(
                    color: Color(0xFF1F1A17),
                    shape: BoxShape.circle,
                  ),
                  alignment: Alignment.center,
                  child: const Text(
                    'B',
                    style: TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        featuredPost?.creator ?? 'Blog app preview',
                        style: theme.textTheme.bodyLarge?.copyWith(
                          fontWeight: FontWeight.w600,
                          color: const Color(0xFF1F1A17),
                        ),
                      ),
                      Text(
                        featuredPost == null
                            ? 'Landing page only for now'
                            : '${featuredPost!.commentCount} comments',
                        style: theme.textTheme.bodyMedium,
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _PostsSection extends StatelessWidget {
  const _PostsSection({
    required this.posts,
    required this.isLoading,
    required this.errorMessage,
    required this.onRetry,
  });

  final List<Post> posts;
  final bool isLoading;
  final String? errorMessage;
  final Future<void> Function() onRetry;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Latest posts', style: theme.textTheme.headlineMedium),
        const SizedBox(height: 8),
        Text(
          'These cards load from your backend with a GET request to `/api/posts` as soon as the app opens.',
          style: theme.textTheme.bodyMedium,
        ),
        const SizedBox(height: 20),
        if (isLoading)
          const Card(
            child: Padding(
              padding: EdgeInsets.all(24),
              child: Center(child: CircularProgressIndicator()),
            ),
          )
        else if (errorMessage != null)
          Card(
            child: Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Could not load posts',
                    style: theme.textTheme.titleLarge?.copyWith(
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(errorMessage!, style: theme.textTheme.bodyMedium),
                  const SizedBox(height: 16),
                  FilledButton(
                    onPressed: () {
                      onRetry();
                    },
                    child: const Text('Try again'),
                  ),
                ],
              ),
            ),
          )
        else if (posts.isEmpty)
          Card(
            child: Padding(
              padding: const EdgeInsets.all(24),
              child: Text(
                'The API request succeeded, but there are no posts yet.',
                style: theme.textTheme.bodyLarge,
              ),
            ),
          )
        else
          Column(
            children: posts
                .map(
                  (post) => Padding(
                    padding: const EdgeInsets.only(bottom: 16),
                    child: _PostCard(post: post),
                  ),
                )
                .toList(growable: false),
          ),
      ],
    );
  }
}

class _PostCard extends StatelessWidget {
  const _PostCard({required this.post});

  final Post post;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              post.title,
              style: theme.textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.w700,
                color: const Color(0xFF1F1A17),
              ),
            ),
            const SizedBox(height: 12),
            Text(post.preview, style: theme.textTheme.bodyLarge),
            const SizedBox(height: 16),
            Wrap(
              spacing: 12,
              runSpacing: 12,
              children: [
                _PostMetaChip(label: post.creator),
                _PostMetaChip(label: '${post.commentCount} comments'),
                if (post.createdAt != null)
                  _PostMetaChip(label: _formatDate(post.createdAt!)),
              ],
            ),
            if (post.tags.isNotEmpty) ...[
              const SizedBox(height: 16),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: post.tags
                    .map((tag) => Chip(label: Text('#$tag')))
                    .toList(growable: false),
              ),
            ],
          ],
        ),
      ),
    );
  }

  String _formatDate(DateTime date) {
    final monthNames = <String>[
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];

    return '${monthNames[date.month - 1]} ${date.day}, ${date.year}';
  }
}

class _PostMetaChip extends StatelessWidget {
  const _PostMetaChip({required this.label});

  final String label;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: const Color(0xFFF4EEE6),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        label,
        style: const TextStyle(
          fontSize: 13,
          fontWeight: FontWeight.w600,
          color: Color(0xFF6B625B),
        ),
      ),
    );
  }
}
