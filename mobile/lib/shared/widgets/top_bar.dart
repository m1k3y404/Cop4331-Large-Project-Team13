import 'package:flutter/material.dart';

class TopBar extends StatelessWidget {
  const TopBar({
    super.key,
    required this.isLoggedIn,
    required this.username,
    required this.onLoginPressed,
  });

  final bool isLoggedIn;
  final String username;
  final VoidCallback onLoginPressed;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        const Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Tilt',
                style: TextStyle(
                  fontSize: 26,
                  fontWeight: FontWeight.w700,
                  color: Color(0xFF1F1A17),
                ),
              ),
              SizedBox(height: 4),
              Text(
                'Shape your feed with smarter tagging',
                style: TextStyle(fontSize: 14, color: Color(0xFF6B625B)),
              ),
            ],
          ),
        ),
        if (isLoggedIn)
          Text(
            'Welcome $username',
            style: const TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: Color(0xFF1F1A17),
            ),
          )
        else
          TextButton(onPressed: onLoginPressed, child: const Text('Login')),
      ],
    );
  }
}
