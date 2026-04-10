import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/app/blog_app.dart';

void main() {
  testWidgets('login button switches to welcome message', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(const BlogApp());
    await tester.pumpAndSettle();

    expect(find.text('Tilt'), findsOneWidget);
    expect(find.text('Login'), findsOneWidget);
    expect(find.text('Welcome user'), findsNothing);
    expect(
      find.text(
        'Post blogs, auto-tag them with AI, and tune the feed you actually want.',
      ),
      findsOneWidget,
    );
    expect(find.text('Featured draft'), findsOneWidget);

    await tester.tap(find.text('Login'));
    await tester.pumpAndSettle();

    expect(find.text('Create your Tilt account'), findsNothing);
    expect(find.text('Welcome back'), findsOneWidget);
    expect(find.text('Username'), findsOneWidget);
  });

  testWidgets('start writing sends logged-out users to auth first', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(const BlogApp());
    await tester.pumpAndSettle();

    expect(find.text('Login'), findsOneWidget);
    expect(find.text('Start writing'), findsOneWidget);

    await tester.ensureVisible(find.text('Start writing'));
    await tester.tap(find.text('Start writing'));
    await tester.pumpAndSettle();

    expect(find.text('Welcome back'), findsOneWidget);
    expect(find.text('Username'), findsOneWidget);
    expect(find.text('Password'), findsOneWidget);
  });
}
