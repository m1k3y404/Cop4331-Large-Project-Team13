import 'package:flutter/material.dart';

import '../../../core/network/api_exception.dart';
import '../../posts/data/post_service.dart';

class WritingScreen extends StatefulWidget {
  const WritingScreen({super.key, this.username});

  final String? username;

  @override
  State<WritingScreen> createState() => _WritingScreenState();
}

class _WritingScreenState extends State<WritingScreen> {
  final TextEditingController _titleController = TextEditingController();
  final TextEditingController _bodyController = TextEditingController();
  final PostService _postService = PostService();

  bool _isSubmitting = false;

  @override
  void initState() {
    super.initState();
    _titleController.text = 'Untitled post';
  }

  @override
  void dispose() {
    _titleController.dispose();
    _bodyController.dispose();
    _postService.close();
    super.dispose();
  }

  Future<void> _submitPost() async {
    final title = _titleController.text.trim();
    final content = _bodyController.text.trim();
    final creator = widget.username?.trim().isNotEmpty == true
        ? widget.username!.trim()
        : 'user';

    if (title.isEmpty) {
      _showMessage('Please enter a title.');
      return;
    }

    if (content.isEmpty) {
      _showMessage('Please write something before publishing.');
      return;
    }

    setState(() {
      _isSubmitting = true;
    });

    try {
      await _postService.createPost(
        title: title,
        content: content,
        creator: creator,
      );

      if (!mounted) {
        return;
      }

      _showMessage('Post published successfully.');
      Navigator.of(context).pop();
    } catch (error) {
      if (!mounted) {
        return;
      }

      final message = error is ApiException
          ? error.message
          : 'Unable to publish your post right now.';
      _showMessage(message);
    } finally {
      if (mounted) {
        setState(() {
          _isSubmitting = false;
        });
      }
    }
  }

  void _clearDraft() {
    _titleController.text = 'Untitled post';
    _bodyController.clear();
  }

  void _showMessage(String message) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(message)));
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Writing'),
        actions: const [
          Padding(
            padding: EdgeInsets.only(right: 16),
            child: Center(
              child: Text(
                'Draft',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: Color(0xFF6B625B),
                ),
              ),
            ),
          ),
        ],
      ),
      bottomNavigationBar: SafeArea(
        top: false,
        child: Padding(
          padding: const EdgeInsets.fromLTRB(20, 8, 20, 20),
          child: Row(
            children: [
              Expanded(
                child: OutlinedButton(
                  onPressed: _isSubmitting ? null : _clearDraft,
                  child: const Text('Clear'),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: ElevatedButton(
                  onPressed: _isSubmitting ? null : _submitPost,
                  child: Text(_isSubmitting ? 'Submitting...' : 'Submit Post'),
                ),
              ),
            ],
          ),
        ),
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(20, 12, 20, 20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('New blog post', style: theme.textTheme.headlineMedium),
              const SizedBox(height: 8),
              Text(
                'Start drafting below, then submit your post to publish it.',
                style: theme.textTheme.bodyMedium,
              ),
              const SizedBox(height: 20),
              TextField(
                controller: _titleController,
                decoration: const InputDecoration(
                  labelText: 'Title',
                  border: OutlineInputBorder(),
                ),
                style: const TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.w600,
                  color: Color(0xFF1F1A17),
                ),
              ),
              const SizedBox(height: 16),
              Expanded(
                child: TextField(
                  controller: _bodyController,
                  expands: true,
                  maxLines: null,
                  minLines: null,
                  textAlignVertical: TextAlignVertical.top,
                  keyboardType: TextInputType.multiline,
                  decoration: const InputDecoration(
                    hintText: 'Write your story here...',
                    alignLabelWithHint: true,
                    border: OutlineInputBorder(),
                    contentPadding: EdgeInsets.all(16),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
