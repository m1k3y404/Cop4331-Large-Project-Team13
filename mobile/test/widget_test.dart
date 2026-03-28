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
}
