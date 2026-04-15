import 'dart:convert';

import 'package:http/http.dart' as http;

import 'api_config.dart';
import 'api_exception.dart';

class ApiClient {
  ApiClient({
    http.Client? httpClient,
    this.baseUrl = ApiConfig.baseUrl,
    String? Function()? authTokenProvider,
  }) : _authTokenProvider = authTokenProvider,
       _httpClient = httpClient ?? http.Client();

  final http.Client _httpClient;
  final String baseUrl;
  final String? Function()? _authTokenProvider;

  Uri _buildUri(String path, {Map<String, String>? queryParameters}) {
    final root = Uri.parse(baseUrl);
    final normalizedBasePath = root.path.endsWith('/')
        ? root.path.substring(0, root.path.length - 1)
        : root.path;
    final normalizedPath = path.startsWith('/') ? path : '/$path';

    return root.replace(
      path: '$normalizedBasePath$normalizedPath',
      queryParameters: queryParameters == null || queryParameters.isEmpty
          ? null
          : queryParameters,
    );
  }

  Future<dynamic> get(
    String path, {
    Map<String, String>? queryParameters,
  }) async {
    final response = await _httpClient.get(
      _buildUri(path, queryParameters: queryParameters),
      headers: _buildHeaders(),
    );
    return _decodeResponse(response);
  }

  Future<dynamic> post(String path, {Map<String, dynamic>? body}) async {
    final response = await _httpClient.post(
      _buildUri(path),
      headers: _buildHeaders(),
      body: jsonEncode(body ?? <String, dynamic>{}),
    );
    return _decodeResponse(response);
  }

  Future<dynamic> put(String path, {Map<String, dynamic>? body}) async {
    final response = await _httpClient.put(
      _buildUri(path),
      headers: _buildHeaders(),
      body: jsonEncode(body ?? <String, dynamic>{}),
    );
    return _decodeResponse(response);
  }

  Future<dynamic> delete(String path) async {
    final response = await _httpClient.delete(
      _buildUri(path),
      headers: _buildHeaders(),
    );
    return _decodeResponse(response);
  }

  Map<String, String> _buildHeaders() {
    final headers = <String, String>{'Content-Type': 'application/json'};
    final authToken = _authTokenProvider?.call()?.trim();
    if (authToken != null && authToken.isNotEmpty) {
      headers['Authorization'] = 'Bearer $authToken';
    }
    return headers;
  }

  dynamic _decodeResponse(http.Response response) {
    final rawBody = response.body.trim();
    final hasBody = rawBody.isNotEmpty;
    final dynamic decodedBody = hasBody ? jsonDecode(rawBody) : null;

    if (response.statusCode >= 200 && response.statusCode < 300) {
      return decodedBody;
    }

    if (decodedBody is Map<String, dynamic>) {
      final error = decodedBody['error'];
      final message = decodedBody['message'];
      if (error is String && error.isNotEmpty) {
        throw ApiException(error, statusCode: response.statusCode);
      }
      if (message is String && message.isNotEmpty) {
        throw ApiException(message, statusCode: response.statusCode);
      }
    }

    throw ApiException(
      'Request failed with status ${response.statusCode}',
      statusCode: response.statusCode,
    );
  }
}
