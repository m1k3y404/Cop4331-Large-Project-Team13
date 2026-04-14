import '../api/api_exception.dart';

String formatErrorMessage(Object error) {
  if (error is ApiException) {
    return error.message;
  }

  final message = error.toString();
  if (message.startsWith('Exception: ')) {
    return message.substring('Exception: '.length);
  }

  return message;
}
