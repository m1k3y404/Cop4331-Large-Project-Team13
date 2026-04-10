import 'package:flutter/material.dart';

import '../../features/auth/presentation/auth_screen.dart';
import '../../features/landing/presentation/landing_screen.dart';
import '../../features/writing/presentation/writing_screen.dart';

class AppRouter {
  static const String landingRoute = '/';
  static const String authRoute = '/auth';
  static const String writingRoute = '/writing';

  static Route<dynamic> onGenerateRoute(RouteSettings settings) {
    switch (settings.name) {
      case landingRoute:
        return MaterialPageRoute<void>(
          builder: (_) => const LandingScreen(),
          settings: settings,
        );
      case authRoute:
        return MaterialPageRoute<String?>(
          builder: (_) => const AuthScreen(),
          settings: settings,
        );
      case writingRoute:
        final username = settings.arguments is String
            ? settings.arguments as String
            : null;
        return MaterialPageRoute<void>(
          builder: (_) => WritingScreen(username: username),
          settings: settings,
        );
      default:
        return MaterialPageRoute<void>(
          builder: (_) => const LandingScreen(),
          settings: const RouteSettings(name: landingRoute),
        );
    }
  }
}
