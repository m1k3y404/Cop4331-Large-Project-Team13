class PostModel {
  const PostModel({
    required this.id,
    required this.title,
    required this.content,
    required this.creator,
    required this.scores,
    required this.isAnalyzed,
    required this.createdAt,
    required this.updatedAt,
    this.commentCount,
  });

  final String id;
  final String title;
  final String content;
  final String creator;
  final Map<String, double> scores;
  final bool isAnalyzed;
  final DateTime createdAt;
  final DateTime updatedAt;
  final int? commentCount;

  String get previewText {
    const limit = 160;
    final normalized = content.trim();
    if (normalized.length <= limit) {
      return normalized;
    }
    return '${normalized.substring(0, limit).trimRight()}...';
  }

  bool isOwnedBy(String? username) => username != null && username == creator;

  factory PostModel.fromJson(Map<String, dynamic> json) {
    final rawScores = json['scores'];
    final Map<String, double> scores = {};
    if (rawScores is Map) {
      for (final entry in rawScores.entries) {
        final value = entry.value;
        if (entry.key is String && value is num) {
          scores[entry.key as String] = value.toDouble();
        }
      }
    }

    return PostModel(
      id: json['_id'] as String? ?? '',
      title: json['title'] as String? ?? '',
      content: json['content'] as String? ?? '',
      creator: json['creator'] as String? ?? '',
      scores: scores,
      isAnalyzed: json['isAnalyzed'] as bool? ?? false,
      createdAt:
          DateTime.tryParse(json['createdAt'] as String? ?? '') ??
          DateTime.now(),
      updatedAt:
          DateTime.tryParse(json['updatedAt'] as String? ?? '') ??
          DateTime.now(),
      commentCount: (json['commentCount'] as num?)?.toInt(),
    );
  }
}

class PagedPostsResponse {
  const PagedPostsResponse({
    required this.posts,
    required this.total,
    required this.page,
    required this.limit,
  });

  final List<PostModel> posts;
  final int total;
  final int page;
  final int limit;

  bool get hasMore => page * limit < total;

  factory PagedPostsResponse.fromJson(Map<String, dynamic> json) {
    final rawPosts = json['posts'] as List<dynamic>? ?? const [];
    return PagedPostsResponse(
      posts: rawPosts
          .whereType<Map<String, dynamic>>()
          .map(PostModel.fromJson)
          .toList(),
      total: (json['total'] as num?)?.toInt() ?? 0,
      page: (json['page'] as num?)?.toInt() ?? 1,
      limit: (json['limit'] as num?)?.toInt() ?? rawPosts.length,
    );
  }
}
