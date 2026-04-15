import 'package:flutter/material.dart';

import 'app_scope.dart';
import 'app_services.dart';
import 'router/app_router.dart';
import 'theme/app_theme.dart';

class BlogApp extends StatefulWidget {
  const BlogApp({super.key, this.services});

  final AppServices? services;

  @override
  State<BlogApp> createState() => _BlogAppState();
}

class _BlogAppState extends State<BlogApp> {
  late final AppServices _services;

  @override
  void initState() {
    super.initState();
    _services = widget.services ?? AppServices.create();
    _services.sessionController.initialize();
  }

  @override
  void dispose() {
    if (widget.services == null) {
      _services.dispose();
    }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AppScope(
      services: _services,
      child: MaterialApp(
        title: 'Inkly',
        debugShowCheckedModeBanner: false,
        theme: AppTheme.light(),
        initialRoute: AppRouter.landingRoute,
        onGenerateRoute: AppRouter.onGenerateRoute,
      ),
    );
  }
}
