import '../../../core/network/api_client.dart';

class AuthService {
  AuthService({ApiClient? apiClient})
    : _apiClient = apiClient ?? ApiClient(),
      _ownsApiClient = apiClient == null;

  final ApiClient _apiClient;
  final bool _ownsApiClient;

  Future<String?> login({
    required String username,
    required String password,
  }) async {
    final response = await _apiClient.post(
      '/users/login',
      body: {'username': username, 'password': password},
    );

    return _readUsername(response) ?? username;
  }

  Future<String?> register({
    required String username,
    required String email,
    required String password,
  }) async {
    final response = await _apiClient.post(
      '/users/register',
      body: {'username': username, 'email': email, 'password': password},
    );

    return _readUsername(response) ?? username;
  }

  String? _readUsername(Map<String, dynamic> response) {
    final user = response['user'];
    if (user is Map) {
      final value = user['username'];
      if (value != null) {
        return value.toString();
      }
    }

    final username = response['username'];
    if (username != null) {
      return username.toString();
    }

    return null;
  }

  void close() {
    if (_ownsApiClient) {
      _apiClient.close();
    }
  }
}
