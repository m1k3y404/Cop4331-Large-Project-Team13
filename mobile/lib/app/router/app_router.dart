import 'package:flutter/material.dart';

import '../../features/auth/presentation/forgot_password_screen.dart';
import '../../features/auth/presentation/login_screen.dart';
import '../../features/auth/presentation/register_screen.dart';
import '../../features/auth/presentation/reset_password_screen.dart';
import '../../features/auth/presentation/verify_email_screen.dart';
import '../../features/detail/presentation/post_detail_screen.dart';
import '../../features/landing/presentation/landing_screen.dart';
import '../../features/profile/presentation/my_posts_screen.dart';
import '../../features/search/presentation/search_screen.dart';
import '../../features/writing/presentation/writing_screen.dart';
import '../../shared/navigation/route_args.dart';

class AppRouter {
  static const String landingRoute = '/';
  static const String writingRoute = '/writing';
  static const String editPostRoute = '/posts/edit';
  static const String postDetailRoute = '/posts/detail';
  static const String searchRoute = '/search';
  static const String myPostsRoute = '/my-posts';
  static const String loginRoute = '/login';
  static const String registerRoute = '/register';
  static const String forgotPasswordRoute = '/forgot-password';
  static const String resetPasswordRoute = '/reset-password';
  static const String verifyEmailRoute = '/verify-email';

  static Route<dynamic> onGenerateRoute(RouteSettings settings) {
    switch (settings.name) {
      case landingRoute:
        return MaterialPageRoute<void>(
          builder: (_) => const LandingScreen(),
          settings: settings,
        );
      case writingRoute:
        return MaterialPageRoute<void>(
          builder: (_) => const WritingScreen(),
          settings: settings,
        );
      case editPostRoute:
        final args = settings.arguments as WritingScreenArgs?;
        return MaterialPageRoute<void>(
          builder: (_) => WritingScreen(args: args),
          settings: settings,
        );
      case postDetailRoute:
        final args = settings.arguments as PostDetailArgs;
        return MaterialPageRoute<void>(
          builder: (_) => PostDetailScreen(args: args),
          settings: settings,
        );
      case searchRoute:
        final args = settings.arguments as SearchScreenArgs?;
        return MaterialPageRoute<void>(
          builder: (_) => SearchScreen(args: args),
          settings: settings,
        );
      case myPostsRoute:
        return MaterialPageRoute<void>(
          builder: (_) => const MyPostsScreen(),
          settings: settings,
        );
      case loginRoute:
        return MaterialPageRoute<void>(
          builder: (_) => const LoginScreen(),
          settings: settings,
        );
      case registerRoute:
        return MaterialPageRoute<void>(
          builder: (_) => const RegisterScreen(),
          settings: settings,
        );
      case forgotPasswordRoute:
        return MaterialPageRoute<void>(
          builder: (_) => const ForgotPasswordScreen(),
          settings: settings,
        );
      case resetPasswordRoute:
        final args = settings.arguments as ResetPasswordArgs?;
        return MaterialPageRoute<void>(
          builder: (_) => ResetPasswordScreen(args: args),
          settings: settings,
        );
      case verifyEmailRoute:
        final args = settings.arguments as VerifyEmailArgs?;
        return MaterialPageRoute<void>(
          builder: (_) => VerifyEmailScreen(args: args),
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
