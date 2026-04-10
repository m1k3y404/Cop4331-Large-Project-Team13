import 'dart:async';
import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;

import '../config/api_config.dart';
import 'api_exception.dart';

class ApiClient {
  ApiClient({http.Client? httpClient, String? baseUrl, Duration? timeout})
    : _httpClient = httpClient ?? http.Client(),
      _baseUrl = baseUrl ?? ApiConfig.baseUrl,
      _timeout = timeout ?? const Duration(seconds: 15);

  final http.Client _httpClient;
  final String _baseUrl;
  final Duration _timeout;

  Future<Map<String, dynamic>> get(
    String path, {
    Map<String, dynamic>? queryParameters,
    Map<String, String>? headers,
  }) {
    return _send(
      method: 'GET',
      path: path,
      queryParameters: queryParameters,
      headers: headers,
    );
  }

  Future<Map<String, dynamic>> post(
    String path, {
    Map<String, dynamic>? body,
    Map<String, dynamic>? queryParameters,
    Map<String, String>? headers,
  }) {
    return _send(
      method: 'POST',
      path: path,
      body: body,
      queryParameters: queryParameters,
      headers: headers,
    );
  }

  Future<Map<String, dynamic>> put(
    String path, {
    Map<String, dynamic>? body,
    Map<String, dynamic>? queryParameters,
    Map<String, String>? headers,
  }) {
    return _send(
      method: 'PUT',
      path: path,
      body: body,
      queryParameters: queryParameters,
      headers: headers,
    );
  }

  Future<Map<String, dynamic>> delete(
    String path, {
    Map<String, dynamic>? body,
    Map<String, dynamic>? queryParameters,
    Map<String, String>? headers,
  }) {
    return _send(
      method: 'DELETE',
      path: path,
      body: body,
      queryParameters: queryParameters,
      headers: headers,
    );
  }

  Future<Map<String, dynamic>> _send({
    required String method,
    required String path,
    Map<String, dynamic>? body,
    Map<String, dynamic>? queryParameters,
    Map<String, String>? headers,
  }) async {
    final uri = Uri.parse(
      '$_baseUrl${_normalizePath(path)}',
    ).replace(queryParameters: _stringifyQuery(queryParameters));

    final mergedHeaders = <String, String>{
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      ...?headers,
    };

    try {
      late final http.Response response;
      final encodedBody = body == null ? null : jsonEncode(body);

      switch (method) {
        case 'GET':
          response = await _httpClient
              .get(uri, headers: mergedHeaders)
              .timeout(_timeout);
          break;
        case 'POST':
          response = await _httpClient
              .post(uri, headers: mergedHeaders, body: encodedBody)
              .timeout(_timeout);
          break;
        case 'PUT':
          response = await _httpClient
              .put(uri, headers: mergedHeaders, body: encodedBody)
              .timeout(_timeout);
          break;
        case 'DELETE':
          response = await _httpClient
              .delete(uri, headers: mergedHeaders, body: encodedBody)
              .timeout(_timeout);
          break;
        default:
          throw ArgumentError.value(method, 'method', 'Unsupported method');
      }

      _logResponse(method: method, uri: uri, response: response, body: body);
      return _decodeResponse(response);
    } on TimeoutException {
      throw ApiException(message: 'Request timed out. Please try again.');
    } on http.ClientException {
      throw ApiException(
        message: 'Unable to reach the server. Check the base URL and network.',
      );
    } on FormatException {
      throw ApiException(message: 'The server returned invalid JSON.');
    }
  }

  Map<String, dynamic> _decodeResponse(http.Response response) {
    final hasBody = response.body.trim().isNotEmpty;
    final dynamic decoded = hasBody
        ? jsonDecode(response.body)
        : <String, dynamic>{};

    if (response.statusCode >= 200 && response.statusCode < 300) {
      if (decoded is Map<String, dynamic>) {
        return decoded;
      }

      return <String, dynamic>{'data': decoded};
    }

    final message = switch (decoded) {
      {'error': final String error} when error.isNotEmpty => error,
      {'message': final String message} when message.isNotEmpty => message,
      _ => 'Request failed with status ${response.statusCode}.',
    };

    throw ApiException(message: message, statusCode: response.statusCode);
  }

  Map<String, String>? _stringifyQuery(Map<String, dynamic>? queryParameters) {
    if (queryParameters == null || queryParameters.isEmpty) {
      return null;
    }

    return queryParameters.map((key, value) => MapEntry(key, value.toString()));
  }

  String _normalizePath(String path) {
    return path.startsWith('/') ? path : '/$path';
  }

  void _logResponse({
    required String method,
    required Uri uri,
    required http.Response response,
    Map<String, dynamic>? body,
  }) {
    if (!kDebugMode || !_shouldLog(uri)) {
      return;
    }

    debugPrint(
      '[ApiClient] $method $uri '
      'status=${response.statusCode} '
      'request=${body == null ? '{}' : jsonEncode(body)} '
      'response=${response.body}',
    );
  }

  bool _shouldLog(Uri uri) {
    return uri.path.endsWith('/users/login') || uri.path.endsWith('/users/register');
  }

  void close() {
    _httpClient.close();
  }
}
