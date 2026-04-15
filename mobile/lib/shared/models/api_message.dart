class ApiMessage {
  const ApiMessage({required this.error, this.message});

  final String error;
  final String? message;

  factory ApiMessage.fromJson(Map<String, dynamic> json) {
    return ApiMessage(
      error: json['error'] as String? ?? '',
      message: json['message'] as String?,
    );
  }
}
