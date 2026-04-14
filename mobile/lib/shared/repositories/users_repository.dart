import '../api/api_client.dart';
import '../models/api_message.dart';

abstract class UsersRepository {
  Future<ApiMessage> register({
    required String username,
    required String email,
    required String password,
  });
  Future<ApiMessage> login({
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
  Future<ApiMessage> login({
    required String username,
    required String password,
  }) async {
    final response = await _client.post(
      '/api/users/login',
      body: {'username': username, 'password': password},
    );
    return ApiMessage.fromJson(response as Map<String, dynamic>);
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
}
