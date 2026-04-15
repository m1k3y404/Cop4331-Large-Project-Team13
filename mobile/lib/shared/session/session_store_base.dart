import '../models/session_state.dart';

abstract class SessionStore {
  Future<SessionState> read();
  Future<void> write(SessionState state);
  Future<void> clear();
}

class MemorySessionStore implements SessionStore {
  SessionState _state = const SessionState.signedOut();

  @override
  Future<void> clear() async {
    _state = const SessionState(
      username: null,
      authToken: null,
      isSignedIn: false,
      isLoaded: true,
    );
  }

  @override
  Future<SessionState> read() async {
    return _state.copyWith(isLoaded: true);
  }

  @override
  Future<void> write(SessionState state) async {
    _state = state.copyWith(isLoaded: true);
  }
}
