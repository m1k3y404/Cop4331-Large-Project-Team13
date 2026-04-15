import 'dart:convert';
import 'dart:io';

import '../models/session_state.dart';
import 'session_store_base.dart';

SessionStore createDefaultSessionStore() => FileSessionStore();

class FileSessionStore implements SessionStore {
  FileSessionStore({File? file}) : _file = file ?? _defaultFile();

  final File _file;

  static File _defaultFile() {
    final home = Platform.environment['HOME'];
    if (home != null && home.isNotEmpty) {
      return File('$home/.inkly_mobile_session.json');
    }

    return File('${Directory.systemTemp.path}/inkly_mobile_session.json');
  }

  @override
  Future<void> clear() async {
    if (await _file.exists()) {
      await _file.delete();
    }
  }

  @override
  Future<SessionState> read() async {
    if (!await _file.exists()) {
      return const SessionState(
        username: null,
        authToken: null,
        isSignedIn: false,
        isLoaded: true,
      );
    }

    final raw = await _file.readAsString();
    if (raw.trim().isEmpty) {
      return const SessionState(
        username: null,
        authToken: null,
        isSignedIn: false,
        isLoaded: true,
      );
    }

    final json = jsonDecode(raw) as Map<String, dynamic>;
    final username = json['username'] as String?;
    final authToken = json['authToken'] as String?;

    return SessionState(
      username: username,
      authToken: authToken,
      isSignedIn:
          username != null &&
          username.isNotEmpty &&
          authToken != null &&
          authToken.isNotEmpty,
      isLoaded: true,
    );
  }

  @override
  Future<void> write(SessionState state) async {
    final parent = _file.parent;
    if (!await parent.exists()) {
      await parent.create(recursive: true);
    }

    await _file.writeAsString(
      jsonEncode({'username': state.username, 'authToken': state.authToken}),
      flush: true,
    );
  }
}
