import '../api/api_client.dart';
import '../api/api_exception.dart';
import '../models/api_message.dart';
import '../models/auth_session.dart';

abstract class UsersRepository {
  Future<ApiMessage> register({
    required String username,
    required String email,
    required String password,
  });
  Future<AuthSession> login({
    required String username,
    required String password,
  });
  Future<ApiMessage> forgotPassword(String email);
  Future<ApiMessage> resetPassword({
    required String token,
    required String newPassword,
  });
  Future<ApiMessage> verifyEmail(String token);
}

class ApiUsersRepository implements UsersRepository {
  ApiUsersRepository(this._client);

  final ApiClient _client;

  @override
  Future<ApiMessage> register({
    required String username,
    required String email,
    required String password,
  }) async {
    final response = await _client.post(
      '/api/users/register',
      body: {'username': username, 'email': email, 'password': password},
    );
    return ApiMessage.fromJson(response as Map<String, dynamic>);
  }

  @override
  Future<AuthSession> login({
    required String username,
    required String password,
  }) async {
    final response = await _client.post(
      '/api/users/login',
      body: {'username': username, 'password': password},
    );
    return _parseAuthSession(
      response as Map<String, dynamic>,
      fallbackUsername: username,
    );
  }

  @override
  Future<ApiMessage> forgotPassword(String email) async {
    final response = await _client.post(
      '/api/users/forgot-password',
      body: {'email': email},
    );
    return ApiMessage.fromJson(response as Map<String, dynamic>);
  }

  @override
  Future<ApiMessage> resetPassword({
    required String token,
    required String newPassword,
  }) async {
    final response = await _client.post(
      '/api/users/reset-password',
      body: {'token': token, 'newPassword': newPassword},
    );
    return ApiMessage.fromJson(response as Map<String, dynamic>);
  }

  @override
  Future<ApiMessage> verifyEmail(String token) async {
    final response = await _client.get(
      '/api/users/verify-email',
      queryParameters: {'token': token},
    );
    return ApiMessage.fromJson(response as Map<String, dynamic>);
  }

  AuthSession _parseAuthSession(
    Map<String, dynamic> json, {
    required String fallbackUsername,
  }) {
    String? readString(dynamic value) {
      final text = value?.toString().trim();
      if (text == null || text.isEmpty) {
        return null;
      }
      return text;
    }

    String? readTokenFrom(Map<String, dynamic>? source) {
      if (source == null) {
        return null;
      }

      return readString(
        source['token'] ??
            source['accessToken'] ??
            source['access_token'] ??
            source['jwt'],
      );
    }

    String? readUsernameFrom(Map<String, dynamic>? source) {
      if (source == null) {
        return null;
      }

      final user = source['user'];
      if (user is Map<String, dynamic>) {
        final nestedUsername = readString(user['username'] ?? user['name']);
        if (nestedUsername != null) {
          return nestedUsername;
        }
      }

      return readString(source['username'] ?? source['name']);
    }

    final nestedData = json['data'];
    final token =
        readTokenFrom(json) ??
        (nestedData is Map<String, dynamic> ? readTokenFrom(nestedData) : null);

    if (token == null) {
      throw const ApiException(
        'Login succeeded but no JWT token was returned by the server.',
      );
    }

    final username =
        readUsernameFrom(json) ??
        (nestedData is Map<String, dynamic>
            ? readUsernameFrom(nestedData)
            : null) ??
        fallbackUsername.trim();

    return AuthSession(username: username, token: token);
  }
}
