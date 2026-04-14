import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/app/app_scope.dart';
import 'package:mobile/app/blog_app.dart';
import 'package:mobile/features/detail/presentation/post_detail_screen.dart';
import 'package:mobile/shared/navigation/route_args.dart';

import 'support/test_helpers.dart';

void main() {
  testWidgets('landing screen shows backend feed and signed-out actions', (
    WidgetTester tester,
  ) async {
    final services = await createTestServices(
      postsRepository: FakePostsRepository(
        latestPosts: [buildPost(title: 'A backend post')],
      ),
    );

    await tester.pumpWidget(BlogApp(services: services));
    await tester.pumpAndSettle();

    expect(find.text('Inkly'), findsOneWidget);
    expect(find.text('Login'), findsOneWidget);
    expect(find.text('Register'), findsOneWidget);
    final mainScrollView = find.byType(Scrollable).first;
    await tester.scrollUntilVisible(
      find.text('A backend post'),
      300,
      scrollable: mainScrollView,
    );
    expect(find.text('A backend post'), findsOneWidget);
    expect(find.text('Latest posts and score queries'), findsOneWidget);
  });

  testWidgets('logged-in session can open the writer from landing', (
    WidgetTester tester,
  ) async {
    final services = await createTestServices(username: 'writer');

    await tester.pumpWidget(BlogApp(services: services));
    await tester.pumpAndSettle();

    expect(find.text('Welcome writer'), findsOneWidget);
    expect(find.text('New post'), findsOneWidget);

    await tester.tap(find.text('New post'));
    await tester.pumpAndSettle();

    expect(find.text('Write your next post'), findsOneWidget);
    expect(find.text('Publish post'), findsOneWidget);
    expect(find.text('Posting as writer'), findsOneWidget);
  });

  testWidgets('score filter widget applies normalized filters', (
    WidgetTester tester,
  ) async {
    final postsRepository = FakePostsRepository();
    final services = await createTestServices(postsRepository: postsRepository);

    await tester.pumpWidget(BlogApp(services: services));
    await tester.pumpAndSettle();

    await tester.enterText(find.byType(TextField).at(1), 'optimism');
    await tester.enterText(find.byType(TextField).at(2), '0.9');
    await tester.enterText(find.byType(TextField).at(3), '0.2');
    tester.testTextInput.hide();
    await tester.pumpAndSettle();
    final mainScrollView = find.byType(Scrollable).first;
    await tester.scrollUntilVisible(
      find.text('Apply filters'),
      200,
      scrollable: mainScrollView,
    );
    await tester.drag(mainScrollView, const Offset(0, -120));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Apply filters'));
    await tester.pumpAndSettle();

    expect(postsRepository.lastFilters, hasLength(1));
    expect(postsRepository.lastFilters.single.label, 'optimism');
    expect(postsRepository.lastFilters.single.normalizedMin, 0.2);
    expect(postsRepository.lastFilters.single.normalizedMax, 0.9);
    expect(find.text('Filtered posts'), findsOneWidget);
  });

  testWidgets('post detail shows comments for signed-in users', (
    WidgetTester tester,
  ) async {
    final services = await createTestServices(username: 'writer');
    await services.sessionController.initialize();

    await tester.pumpWidget(
      AppScope(
        services: services,
        child: MaterialApp(
          home: PostDetailScreen(
            args: PostDetailArgs(postId: 'post-1', initialPost: buildPost()),
          ),
        ),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('Post detail'), findsOneWidget);
    expect(find.text('Comments'), findsOneWidget);
    expect(find.text('Great post!'), findsOneWidget);
    expect(find.text('Post comment'), findsOneWidget);
  });
}
