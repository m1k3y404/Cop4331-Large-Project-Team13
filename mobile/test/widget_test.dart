import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/app/blog_app.dart';

void main() {
  testWidgets('login button switches to welcome message', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(const BlogApp());
    await tester.pumpAndSettle();

    expect(find.text('Inkly'), findsOneWidget);
    expect(find.text('Login'), findsOneWidget);
    expect(find.text('Welcome user'), findsNothing);
    expect(
      find.text(
        'Write clearly. Share quickly. Keep your stories in one calm place.',
      ),
      findsOneWidget,
    );
    expect(find.text('Featured draft'), findsOneWidget);

    await tester.tap(find.text('Login'));
    await tester.pumpAndSettle();

    expect(find.text('Login'), findsNothing);
    expect(find.text('Welcome user'), findsOneWidget);
  });

  testWidgets('start writing logs in and opens the writing page', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(const BlogApp());
    await tester.pumpAndSettle();

    expect(find.text('Login'), findsOneWidget);
    expect(find.text('Start writing'), findsOneWidget);

    await tester.tap(find.text('Start writing'));
    await tester.pumpAndSettle();

    expect(find.text('New blog post'), findsOneWidget);
    expect(find.text('Title'), findsOneWidget);
    expect(find.text('Write your story here...'), findsOneWidget);
  });
}
