class SessionState {
  const SessionState({
    required this.username,
    required this.isSignedIn,
    required this.isLoaded,
  });

  const SessionState.signedOut()
    : username = null,
      isSignedIn = false,
      isLoaded = false;

  final String? username;
  final bool isSignedIn;
  final bool isLoaded;

  SessionState copyWith({
    String? username,
    bool? isSignedIn,
    bool? isLoaded,
    bool clearUsername = false,
  }) {
    return SessionState(
      username: clearUsername ? null : username ?? this.username,
      isSignedIn: isSignedIn ?? this.isSignedIn,
      isLoaded: isLoaded ?? this.isLoaded,
    );
  }
}
