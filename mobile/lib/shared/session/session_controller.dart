import 'package:flutter/foundation.dart';

import '../models/auth_session.dart';
import '../models/session_state.dart';
import 'session_store.dart';

class SessionController extends ChangeNotifier {
  SessionController(this._store);

  final SessionStore _store;

  SessionState _state = const SessionState.signedOut();

  SessionState get state => _state;

  Future<void> initialize() async {
    _state = await _store.read();
    notifyListeners();
  }

  Future<void> signIn(AuthSession session) async {
    final trimmedUsername = session.username.trim();
    final trimmedToken = session.token.trim();
    _state = SessionState(
      username: trimmedUsername,
      authToken: trimmedToken,
      isSignedIn: trimmedUsername.isNotEmpty && trimmedToken.isNotEmpty,
      isLoaded: true,
    );
    await _store.write(_state);
    notifyListeners();
  }

  Future<void> signOut() async {
    _state = const SessionState(
      username: null,
      authToken: null,
      isSignedIn: false,
      isLoaded: true,
    );
    await _store.clear();
    notifyListeners();
  }
}
