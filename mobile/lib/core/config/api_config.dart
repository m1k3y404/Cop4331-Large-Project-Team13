import 'package:flutter/foundation.dart';

class ApiConfig {
  const ApiConfig._();

  static const String _apiPath = '/api';
  static const String _androidEmulatorHost = '10.0.2.2:3000';
  static const String _iosSimulatorHost = '127.0.0.1:3000';
  static const String _webHost = 'localhost:3000';

  static String get baseUrl {
    final override = const String.fromEnvironment('API_BASE_URL');
    if (override.isNotEmpty) {
      return _normalize(override);
    }

    if (kIsWeb) {
      return 'http://$_webHost$_apiPath';
    }

    switch (defaultTargetPlatform) {
      case TargetPlatform.android:
        return 'http://$_androidEmulatorHost$_apiPath';
      case TargetPlatform.iOS:
      case TargetPlatform.macOS:
        return 'http://$_iosSimulatorHost$_apiPath';
      default:
        return 'http://$_webHost$_apiPath';
    }
  }

  static String _normalize(String value) {
    if (value.endsWith(_apiPath)) {
      return value;
    }

    return '${value.replaceFirst(RegExp(r'/$'), '')}$_apiPath';
  }
}
