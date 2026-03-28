import 'package:flutter/material.dart';

class TopBar extends StatelessWidget {
  const TopBar({super.key});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        const Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Inkly',
                style: TextStyle(
                  fontSize: 26,
                  fontWeight: FontWeight.w700,
                  color: Color(0xFF1F1A17),
                ),
              ),
              SizedBox(height: 4),
              Text(
                'A simple space for stories',
                style: TextStyle(fontSize: 14, color: Color(0xFF6B625B)),
              ),
            ],
          ),
        ),
        TextButton(onPressed: () {}, child: const Text('Login')),
      ],
    );
  }
}
