class SessionState {
  const SessionState({
    required this.username,
    required this.authToken,
    required this.isSignedIn,
    required this.isLoaded,
  });

  const SessionState.signedOut()
    : username = null,
      authToken = null,
      isSignedIn = false,
      isLoaded = false;

  final String? username;
  final String? authToken;
  final bool isSignedIn;
  final bool isLoaded;

  SessionState copyWith({
    String? username,
    String? authToken,
    bool? isSignedIn,
    bool? isLoaded,
    bool clearSession = false,
  }) {
    return SessionState(
      username: clearSession ? null : username ?? this.username,
      authToken: clearSession ? null : authToken ?? this.authToken,
      isSignedIn: isSignedIn ?? this.isSignedIn,
      isLoaded: isLoaded ?? this.isLoaded,
    );
  }
}
