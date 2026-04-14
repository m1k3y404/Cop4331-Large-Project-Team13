import 'package:flutter/material.dart';

class TopBar extends StatelessWidget {
  const TopBar({
    super.key,
    required this.title,
    required this.subtitle,
    required this.isLoggedIn,
    required this.username,
    this.onBackPressed,
    this.onCreatePressed,
    this.onMyPostsPressed,
    this.onSearchPressed,
    this.onLoginPressed,
    this.onRegisterPressed,
    this.onSignOutPressed,
  });

  final String title;
  final String subtitle;
  final bool isLoggedIn;
  final String? username;
  final VoidCallback? onBackPressed;
  final VoidCallback? onCreatePressed;
  final VoidCallback? onMyPostsPressed;
  final VoidCallback? onSearchPressed;
  final VoidCallback? onLoginPressed;
  final VoidCallback? onRegisterPressed;
  final VoidCallback? onSignOutPressed;

  @override
  Widget build(BuildContext context) {
    return Wrap(
      alignment: WrapAlignment.spaceBetween,
      runSpacing: 16,
      crossAxisAlignment: WrapCrossAlignment.center,
      children: [
        ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 360),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              if (onBackPressed != null) ...[
                IconButton(
                  onPressed: onBackPressed,
                  icon: const Icon(Icons.arrow_back),
                ),
                const SizedBox(width: 8),
              ],
              Flexible(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: const TextStyle(
                        fontSize: 26,
                        fontWeight: FontWeight.w700,
                        color: Color(0xFF1F1A17),
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      subtitle,
                      style: const TextStyle(
                        fontSize: 14,
                        color: Color(0xFF6B625B),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
        Wrap(
          spacing: 10,
          runSpacing: 10,
          crossAxisAlignment: WrapCrossAlignment.center,
          children: [
            if (onSearchPressed != null)
              OutlinedButton(
                onPressed: onSearchPressed,
                child: const Text('Search'),
              ),
            if (isLoggedIn) ...[
              if (onMyPostsPressed != null)
                OutlinedButton(
                  onPressed: onMyPostsPressed,
                  child: const Text('My posts'),
                ),
              if (onCreatePressed != null)
                ElevatedButton(
                  onPressed: onCreatePressed,
                  child: const Text('New post'),
                ),
              if (username != null)
                Text(
                  'Welcome $username',
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: Color(0xFF1F1A17),
                  ),
                ),
              if (onSignOutPressed != null)
                TextButton(
                  onPressed: onSignOutPressed,
                  child: const Text('Sign out'),
                ),
            ] else ...[
              if (onLoginPressed != null)
                TextButton(
                  onPressed: onLoginPressed,
                  child: const Text('Login'),
                ),
              if (onRegisterPressed != null)
                OutlinedButton(
                  onPressed: onRegisterPressed,
                  child: const Text('Register'),
                ),
            ],
          ],
        ),
      ],
    );
  }
}
