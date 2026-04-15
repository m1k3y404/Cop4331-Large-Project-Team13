import 'package:flutter/material.dart';

import '../../../app/app_scope.dart';
import '../../../app/router/app_router.dart';
import '../../../shared/navigation/route_args.dart';
import '../../../shared/utils/error_formatting.dart';
import '../../../shared/widgets/top_bar.dart';

class WritingScreen extends StatefulWidget {
  const WritingScreen({super.key, this.args});

  final WritingScreenArgs? args;

  @override
  State<WritingScreen> createState() => _WritingScreenState();
}

class _WritingScreenState extends State<WritingScreen> {
  final TextEditingController _titleController = TextEditingController();
  final TextEditingController _bodyController = TextEditingController();

  bool _didInitialize = false;
  bool _isSubmitting = false;

  bool get _isEditing => widget.args?.initialPost != null;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (_didInitialize) {
      return;
    }

    final initialPost = widget.args?.initialPost;
    if (initialPost != null) {
      _titleController.text = initialPost.title;
      _bodyController.text = initialPost.content;
    } else {
      _titleController.text = 'Untitled post';
    }
    _didInitialize = true;
  }

  @override
  void dispose() {
    _titleController.dispose();
    _bodyController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    final title = _titleController.text.trim();
    final content = _bodyController.text.trim();
    final session = AppScope.of(context).sessionController.state;

    if (!session.isSignedIn || session.username == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please log in before publishing.')),
      );
      return;
    }

    if (title.isEmpty || content.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Title and content are required.')),
      );
      return;
    }

    if (_isEditing && !widget.args!.initialPost!.isOwnedBy(session.username)) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Only the original creator can edit this post.'),
        ),
      );
      return;
    }

    setState(() {
      _isSubmitting = true;
    });

    try {
      final repository = AppScope.of(context).postsRepository;
      if (_isEditing) {
        await repository.updatePost(
          id: widget.args!.initialPost!.id,
          title: title,
          content: content,
          creator: session.username!,
        );
      } else {
        await repository.createPost(
          title: title,
          content: content,
          creator: session.username!,
        );
      }

      if (!mounted) {
        return;
      }

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(_isEditing ? 'Post updated.' : 'Post created.')),
      );
      Navigator.of(context).pop(true);
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
          _isSubmitting = false;
        });
      }
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
                  title: _isEditing ? 'Edit post' : 'New post',
                  subtitle: _isEditing
                      ? 'Update an existing post using the backend edit endpoint.'
                      : 'Compose a new post and send it straight to the backend.',
                  isAuthReady: session.isLoaded,
                  isLoggedIn: session.isLoaded && session.isSignedIn,
                  username: session.username,
                  onBackPressed: () => Navigator.of(context).maybePop(),
                  onLoginPressed: () =>
                      Navigator.of(context).pushNamed(AppRouter.loginRoute),
                  onRegisterPressed: () =>
                      Navigator.of(context).pushNamed(AppRouter.registerRoute),
                ),
                const SizedBox(height: 24),
                if (!session.isSignedIn)
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(20),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'You need a local session to publish',
                            style: Theme.of(context).textTheme.headlineMedium,
                          ),
                          const SizedBox(height: 10),
                          const Text(
                            'Log in first so the app knows which username to send as the post creator.',
                          ),
                          const SizedBox(height: 16),
                          Wrap(
                            spacing: 10,
                            runSpacing: 10,
                            children: [
                              ElevatedButton(
                                onPressed: () => Navigator.of(
                                  context,
                                ).pushNamed(AppRouter.loginRoute),
                                child: const Text('Login'),
                              ),
                              OutlinedButton(
                                onPressed: () => Navigator.of(
                                  context,
                                ).pushNamed(AppRouter.registerRoute),
                                child: const Text('Register'),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  )
                else
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(20),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            _isEditing
                                ? 'Update your draft'
                                : 'Write your next post',
                            style: Theme.of(context).textTheme.headlineMedium,
                          ),
                          const SizedBox(height: 8),
                          Text(
                            'Posting as ${session.username}',
                            style: Theme.of(context).textTheme.bodyMedium,
                          ),
                          const SizedBox(height: 20),
                          TextField(
                            controller: _titleController,
                            decoration: const InputDecoration(
                              labelText: 'Title',
                              border: OutlineInputBorder(),
                            ),
                          ),
                          const SizedBox(height: 16),
                          TextField(
                            controller: _bodyController,
                            minLines: 12,
                            maxLines: 18,
                            textAlignVertical: TextAlignVertical.top,
                            keyboardType: TextInputType.multiline,
                            decoration: const InputDecoration(
                              labelText: 'Content',
                              alignLabelWithHint: true,
                              border: OutlineInputBorder(),
                            ),
                          ),
                          const SizedBox(height: 20),
                          ElevatedButton(
                            onPressed: _isSubmitting ? null : _submit,
                            child: Text(
                              _isSubmitting
                                  ? 'Saving...'
                                  : _isEditing
                                  ? 'Update post'
                                  : 'Publish post',
                            ),
                          ),
                        ],
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
