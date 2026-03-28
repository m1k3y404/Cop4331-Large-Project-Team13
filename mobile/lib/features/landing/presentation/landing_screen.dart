import 'package:flutter/material.dart';

import '../../../shared/widgets/top_bar.dart';

class LandingScreen extends StatefulWidget {
  const LandingScreen({super.key});

  @override
  State<LandingScreen> createState() => _LandingScreenState();
}

class _LandingScreenState extends State<LandingScreen> {
  static const String _username = 'user';

  bool _isLoggedIn = false;

  void _handleLogin() {
    setState(() {
      _isLoggedIn = true;
    });
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      body: SafeArea(
        child: LayoutBuilder(
          builder: (context, constraints) {
            final horizontalPadding = constraints.maxWidth >= 900 ? 64.0 : 24.0;
            final verticalSpacing = constraints.maxWidth >= 900 ? 56.0 : 32.0;
            final isWide = constraints.maxWidth >= 900;

            return SingleChildScrollView(
              padding: EdgeInsets.symmetric(
                horizontal: horizontalPadding,
                vertical: 24,
              ),
              child: Center(
                child: ConstrainedBox(
                  constraints: const BoxConstraints(maxWidth: 1100),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      TopBar(
                        isLoggedIn: _isLoggedIn,
                        username: _username,
                        onLoginPressed: _handleLogin,
                      ),
                      SizedBox(height: verticalSpacing),
                      Wrap(
                        spacing: 32,
                        runSpacing: 32,
                        crossAxisAlignment: WrapCrossAlignment.center,
                        children: [
                          SizedBox(
                            width: isWide
                                ? (constraints.maxWidth -
                                          (horizontalPadding * 2) -
                                          32) /
                                      2
                                : double.infinity,
                            child: _HeroSection(theme: theme),
                          ),
                          SizedBox(
                            width: isWide
                                ? (constraints.maxWidth -
                                          (horizontalPadding * 2) -
                                          32) /
                                      2
                                : double.infinity,
                            child: const _PreviewCard(),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}

class _HeroSection extends StatelessWidget {
  const _HeroSection({required this.theme});

  final ThemeData theme;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          decoration: BoxDecoration(
            color: const Color(0xFFEDE3D4),
            borderRadius: BorderRadius.circular(999),
          ),
          child: const Text(
            'Simple blogging, one post at a time',
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: Color(0xFF7A5324),
            ),
          ),
        ),
        const SizedBox(height: 24),
        Text(
          'Write clearly. Share quickly. Keep your stories in one calm place.',
          style: theme.textTheme.displayLarge,
        ),
        const SizedBox(height: 20),
        Text(
          'This first mobile experience is intentionally minimal: a welcoming home base for your blog app with room to grow into publishing, discovery, and author tools later.',
          style: theme.textTheme.bodyLarge,
        ),
        const SizedBox(height: 28),
        Wrap(
          spacing: 12,
          runSpacing: 12,
          children: [
            ElevatedButton(
              onPressed: () {},
              child: const Text('Start reading'),
            ),
            OutlinedButton(
              onPressed: null,
              child: const Text('Login coming soon'),
            ),
          ],
        ),
      ],
    );
  }
}

class _PreviewCard extends StatelessWidget {
  const _PreviewCard();

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(28),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Featured draft',
              style: theme.textTheme.bodyMedium?.copyWith(
                fontWeight: FontWeight.w600,
                color: const Color(0xFF7A5324),
              ),
            ),
            const SizedBox(height: 16),
            Text(
              'Building a quieter reading experience for everyday blogging.',
              style: theme.textTheme.headlineMedium,
            ),
            const SizedBox(height: 16),
            Text(
              'A lightweight landing page is in place now so the mobile app has a clear starting point while login, publishing, and personalized feeds are built incrementally.',
              style: theme.textTheme.bodyLarge,
            ),
            const SizedBox(height: 24),
            const Divider(color: Color(0xFFE7DED1)),
            const SizedBox(height: 24),
            Row(
              children: [
                Container(
                  width: 48,
                  height: 48,
                  decoration: const BoxDecoration(
                    color: Color(0xFF1F1A17),
                    shape: BoxShape.circle,
                  ),
                  alignment: Alignment.center,
                  child: const Text(
                    'B',
                    style: TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Blog app preview',
                        style: theme.textTheme.bodyLarge?.copyWith(
                          fontWeight: FontWeight.w600,
                          color: const Color(0xFF1F1A17),
                        ),
                      ),
                      Text(
                        'Landing page only for now',
                        style: theme.textTheme.bodyMedium,
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
