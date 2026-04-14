import 'package:flutter/foundation.dart';

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

  Future<void> signIn(String username) async {
    final trimmed = username.trim();
    _state = SessionState(
      username: trimmed,
      isSignedIn: trimmed.isNotEmpty,
      isLoaded: true,
    );
    await _store.write(_state);
    notifyListeners();
  }

  Future<void> signOut() async {
    _state = const SessionState(
      username: null,
      isSignedIn: false,
      isLoaded: true,
    );
    await _store.clear();
    notifyListeners();
  }
}
