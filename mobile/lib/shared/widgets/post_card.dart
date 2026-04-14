import 'package:flutter/material.dart';

import '../models/post.dart';
import '../utils/date_formatting.dart';

class PostCard extends StatelessWidget {
  const PostCard({
    super.key,
    required this.post,
    required this.onTap,
    this.onEdit,
    this.onDelete,
  });

  final PostModel post;
  final VoidCallback onTap;
  final VoidCallback? onEdit;
  final VoidCallback? onDelete;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final scoreEntries = post.scores.entries.toList()
      ..sort((left, right) => right.value.compareTo(left.value));

    return Card(
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(24),
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(post.title, style: theme.textTheme.headlineMedium),
              const SizedBox(height: 10),
              Text(post.previewText, style: theme.textTheme.bodyLarge),
              const SizedBox(height: 18),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: [
                  _MetaChip(label: 'by ${post.creator}'),
                  _MetaChip(label: formatShortDate(post.createdAt)),
                  if (post.commentCount != null)
                    _MetaChip(label: '${post.commentCount} comments'),
                  _MetaChip(
                    label: post.isAnalyzed ? 'Analyzed' : 'Pending analysis',
                  ),
                  ...scoreEntries
                      .take(3)
                      .map(
                        (entry) => _MetaChip(
                          label:
                              '${entry.key}: ${(entry.value * 100).round()}%',
                        ),
                      ),
                ],
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  TextButton(onPressed: onTap, child: const Text('Open post')),
                  const Spacer(),
                  if (onEdit != null)
                    TextButton(onPressed: onEdit, child: const Text('Edit')),
                  if (onDelete != null)
                    TextButton(
                      onPressed: onDelete,
                      child: const Text('Delete'),
                    ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _MetaChip extends StatelessWidget {
  const _MetaChip({required this.label});

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
