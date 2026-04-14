import 'dart:convert';

import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:mobile/shared/api/api_client.dart';
import 'package:mobile/shared/api/api_exception.dart';
import 'package:mobile/shared/models/score_filter.dart';
import 'package:mobile/shared/repositories/posts_repository.dart';

void main() {
  test('posts repository parses paginated responses', () async {
    final repository = ApiPostsRepository(
      ApiClient(
        baseUrl: 'http://localhost:3000',
        httpClient: MockClient((request) async {
          expect(request.url.path, '/api/posts');
          expect(request.url.queryParameters['page'], '2');
          expect(request.url.queryParameters['limit'], '5');

          return http.Response(
            jsonEncode({
              'posts': [
                {
                  '_id': 'post-1',
                  'title': 'Parsed post',
                  'content': 'Body',
                  'creator': 'writer',
                  'scores': {'optimism': 0.8},
                  'isAnalyzed': true,
                  'createdAt': '2026-04-13T00:00:00.000Z',
                  'updatedAt': '2026-04-13T00:00:00.000Z',
                  'commentCount': 3,
                },
              ],
              'total': 12,
              'page': 2,
              'limit': 5,
            }),
            200,
          );
        }),
      ),
    );

    final response = await repository.fetchLatestPosts(page: 2, limit: 5);

    expect(response.posts.single.title, 'Parsed post');
    expect(response.posts.single.commentCount, 3);
    expect(response.total, 12);
    expect(response.page, 2);
    expect(response.limit, 5);
  });

  test('posts repository parses raw search result lists', () async {
    final repository = ApiPostsRepository(
      ApiClient(
        baseUrl: 'http://localhost:3000',
        httpClient: MockClient((request) async {
          expect(request.url.path, '/api/posts/search');
          expect(request.url.queryParameters['q'], 'inkly');

          return http.Response(
            jsonEncode([
              {
                '_id': 'post-2',
                'title': 'Search hit',
                'content': 'Body',
                'creator': 'writer',
                'scores': {},
                'isAnalyzed': false,
                'createdAt': '2026-04-13T00:00:00.000Z',
                'updatedAt': '2026-04-13T00:00:00.000Z',
              },
            ]),
            200,
          );
        }),
      ),
    );

    final results = await repository.searchPosts('inkly');

    expect(results, hasLength(1));
    expect(results.single.title, 'Search hit');
  });

  test('score filter query payload normalizes ranges', () {
    final encoded = ScoreFilter.encodeForQuery(const [
      ScoreFilter(label: 'optimism', min: 0.9, max: 0.2),
    ]);

    expect(jsonDecode(encoded), [
      {
        'label': 'optimism',
        'range': [0.2, 0.9],
      },
    ]);
  });

  test('api client maps backend error payloads to ApiException', () async {
    final client = ApiClient(
      baseUrl: 'http://localhost:3000',
      httpClient: MockClient((request) async {
        return http.Response(jsonEncode({'error': 'invalid id'}), 400);
      }),
    );

    expect(
      () => client.get('/api/posts/bad-id'),
      throwsA(
        isA<ApiException>().having(
          (error) => error.message,
          'message',
          'invalid id',
        ),
      ),
    );
  });
}
