import 'dart:convert';

import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:mobile/shared/api/api_client.dart';
import 'package:mobile/shared/api/api_exception.dart';
import 'package:mobile/shared/repositories/users_repository.dart';

void main() {
  test('login parses jwt token and username from backend response', () async {
    final repository = ApiUsersRepository(
      ApiClient(
        baseUrl: 'http://localhost:3000',
        httpClient: MockClient((request) async {
          expect(request.url.path, '/api/users/login');
          return http.Response(
            jsonEncode({
              'token': 'jwt-token',
              'user': {'username': 'writer'},
            }),
            200,
          );
        }),
      ),
    );

    final session = await repository.login(
      username: 'writer',
      password: 'password',
    );

    expect(session.username, 'writer');
    expect(session.token, 'jwt-token');
  });

  test(
    'login fails if backend response does not include a jwt token',
    () async {
      final repository = ApiUsersRepository(
        ApiClient(
          baseUrl: 'http://localhost:3000',
          httpClient: MockClient((request) async {
            return http.Response(jsonEncode({'error': ''}), 200);
          }),
        ),
      );

      expect(
        () => repository.login(username: 'writer', password: 'password'),
        throwsA(
          isA<ApiException>().having(
            (error) => error.message,
            'message',
            'Login succeeded but no JWT token was returned by the server.',
          ),
        ),
      );
    },
  );
}
