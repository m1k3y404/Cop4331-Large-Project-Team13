import { describe, it, expect } from 'vitest';
import { parseScoreFilters, postMatchesScoreFilters } from '../utils/postScoreFilters.js';
import { Post } from '../models/Post.js';

// helper: mirrors the tag extraction logic used in routes/posts.ts -dechante
const stopwords = ['the','and','for','that','this','with','from','have','are','was','were','they','you','your','not','but','can','will','just','what','when','been','also','more','into','than','then','some','would','there'];

function extractTags(title: string, content: string) {
  const text = (title + ' ' + content).toLowerCase();
  const words = text.split(/\W+/).filter(w => w.length > 3 && !stopwords.includes(w));
  const freq: Record<string, number> = {};
  for (const w of words) {
    freq[w] = (freq[w] ?? 0) + 1;
  }
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(e => e[0]);
}

// ── Auto-Tag Generation ─────────────────────────────────────────────
describe('Auto-Tag Generation — extractTags(title, content)', () => {
  it('generates tags as an array from title + content text', () => {
    const tags = extractTags('JavaScript Tutorial', 'learn javascript javascript basics today');
    expect(Array.isArray(tags)).toBe(true);
  });

  it('caps output at 5 tags even when input has many unique words', () => {
    const tags = extractTags('a b c d e f g h i j', 'alpha beta gamma delta epsilon zeta theta iota kappa lambda');
    expect(tags.length).toBeLessThanOrEqual(5);
  });

  it('strips stopwords (the, and, for) and short words (<=3 chars)', () => {
    const tags = extractTags('the and for', 'the and for that this');
    expect(tags.length).toBe(0);
  });

  it('ranks tags by word frequency — most repeated word comes first', () => {
    const tags = extractTags('react react react', 'react node node');
    expect(tags[0]).toBe('react');
  });

  it('returns empty array when title and content are both empty', () => {
    const tags = extractTags('', '');
    expect(tags).toEqual([]);
  });
});

// ── Sentiment Score Filter Parsing ──────────────────────────────────
describe('Score Filter Parsing — parseScoreFilters(queryString)', () => {
  it('parses valid JSON and normalizes min/max order (swaps if inverted)', () => {
    const filters = parseScoreFilters('[{"label":"optimism","range":[0.8,0.5]}]');
    expect(filters).toEqual([{ label: 'optimism', range: [0.5, 0.8] }]);
  });

  it('returns empty array when query param is undefined (no filter applied)', () => {
    expect(parseScoreFilters(undefined)).toEqual([]);
  });

  it('throws descriptive error on malformed JSON input', () => {
    expect(() => parseScoreFilters('[{"label":"optimism"}')).toThrow('scoreFilters must be valid JSON');
  });

  it('throws when range array does not contain exactly 2 values', () => {
    expect(() => parseScoreFilters('[{"label":"optimism","range":[0.5]}]')).toThrow(
      'scoreFilters[0].range must contain exactly 2 values'
    );
  });

  it('throws when range values fall outside 0–1 bounds', () => {
    expect(() => parseScoreFilters('[{"label":"optimism","range":[0.5,1.2]}]')).toThrow(
      'scoreFilters[0].range values must be numbers between 0 and 1'
    );
  });
});

// ── Sentiment Score Filter Matching ─────────────────────────────────
describe('Score Filter Matching — postMatchesScoreFilters(scores, filters)', () => {
  it('returns true when post score falls within the requested range', () => {
    expect(postMatchesScoreFilters({ optimism: 0.6 }, [{ label: 'optimism', range: [0.5, 0.8] }])).toBe(true);
  });

  it('returns false when post score is below the minimum threshold', () => {
    expect(postMatchesScoreFilters({ optimism: 0.4 }, [{ label: 'optimism', range: [0.5, 0.8] }])).toBe(false);
  });

  it('passes posts that lack the filtered label (only filters what exists)', () => {
    expect(postMatchesScoreFilters({ optimism: 0.6 }, [{ label: 'nsfw', range: [0.0, 0.3] }])).toBe(true);
  });

  it('requires ALL filtered labels to pass — one failure rejects the post', () => {
    expect(
      postMatchesScoreFilters(
        { optimism: 0.6, nsfw: 0.4 },
        [
          { label: 'optimism', range: [0.5, 0.8] },
          { label: 'nsfw', range: [0.0, 0.3] }
        ]
      )
    ).toBe(false);
  });

  it('handles Mongoose Map objects (not just plain JS objects)', () => {
    expect(
      postMatchesScoreFilters(
        new Map([
          ['optimism', 0.6],
          ['nsfw', 0.2]
        ]),
        [{ label: 'optimism', range: [0.5, 0.8] }]
      )
    ).toBe(true);
  });
});

// ── Post Model Defaults ─────────────────────────────────────────────
describe('Post Model — Mongoose schema defaults', () => {
  it('initializes scores as empty Map and isAnalyzed as false on new post', () => {
    const post = new Post({ title: 'Test', content: 'Body', creator: 'user' });
    expect(post.scores instanceof Map).toBe(true);
    expect(Object.fromEntries(post.scores.entries())).toEqual({});
    expect(post.isAnalyzed).toBe(false);
  });
});
