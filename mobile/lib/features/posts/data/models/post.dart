class Post {
  Post({
    required this.id,
    required this.title,
    required this.content,
    required this.creator,
    required this.tags,
    required this.commentCount,
    this.createdAt,
    this.updatedAt,
  });

  final String id;
  final String title;
  final String content;
  final String creator;
  final List<String> tags;
  final int commentCount;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  String get preview {
    const maxLength = 140;

    if (content.length <= maxLength) {
      return content;
    }

    return '${content.substring(0, maxLength).trimRight()}...';
  }

  factory Post.fromJson(Map<String, dynamic> json) {
    return Post(
      id: (json['_id'] ?? json['id'] ?? '').toString(),
      title: (json['title'] ?? 'Untitled post').toString(),
      content: (json['content'] ?? '').toString(),
      creator: (json['creator'] ?? 'Unknown author').toString(),
      tags: _parseTags(json['tags']),
      commentCount: _parseCommentCount(json['commentCount']),
      createdAt: _parseDateTime(json['createdAt']),
      updatedAt: _parseDateTime(json['updatedAt']),
    );
  }

  static List<String> _parseTags(dynamic rawTags) {
    if (rawTags is! List) {
      return const [];
    }

    return rawTags.map((tag) => tag.toString()).toList(growable: false);
  }

  static int _parseCommentCount(dynamic rawValue) {
    if (rawValue is int) {
      return rawValue;
    }

    if (rawValue is num) {
      return rawValue.toInt();
    }

    return int.tryParse(rawValue?.toString() ?? '') ?? 0;
  }

  static DateTime? _parseDateTime(dynamic rawValue) {
    if (rawValue == null) {
      return null;
    }

    return DateTime.tryParse(rawValue.toString());
  }
}
