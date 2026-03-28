import 'package:flutter/material.dart';

import '../../features/landing/presentation/landing_screen.dart';

class AppRouter {
  static const String landingRoute = '/';

  static Route<dynamic> onGenerateRoute(RouteSettings settings) {
    switch (settings.name) {
      case landingRoute:
        return MaterialPageRoute<void>(
          builder: (_) => const LandingScreen(),
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
