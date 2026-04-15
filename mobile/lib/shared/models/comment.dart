class CommentModel {
  const CommentModel({
    required this.id,
    required this.postId,
    required this.creator,
    required this.content,
    required this.createdAt,
  });

  final String id;
  final String postId;
  final String creator;
  final String content;
  final DateTime createdAt;

  factory CommentModel.fromJson(Map<String, dynamic> json) {
    return CommentModel(
      id: json['_id'] as String? ?? '',
      postId: json['postId'] as String? ?? '',
      creator: json['creator'] as String? ?? '',
      content: json['content'] as String? ?? '',
      createdAt:
          DateTime.tryParse(json['createdAt'] as String? ?? '') ??
          DateTime.now(),
    );
  }
}
