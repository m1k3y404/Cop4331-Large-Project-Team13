import { describe, it, expect } from 'vitest';
import { parseScoreFilters, postMatchesScoreFilters } from '../utils/postScoreFilters.js';
import { Post } from '../models/Post.js';

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

describe('extractTags', () => {
  it('returns an array of tags', () => {
    const tags = extractTags('JavaScript Tutorial', 'learn javascript javascript basics today');
    expect(Array.isArray(tags)).toBe(true);
  });

  it('returns at most 5 tags', () => {
    const tags = extractTags('a b c d e f g h i j', 'alpha beta gamma delta epsilon zeta theta iota kappa lambda');
    expect(tags.length).toBeLessThanOrEqual(5);
  });

  it('filters out short words and stopwords', () => {
    const tags = extractTags('the and for', 'the and for that this');
    expect(tags.length).toBe(0);
  });

  it('ranks by frequency', () => {
    const tags = extractTags('react react react', 'react node node');
    expect(tags[0]).toBe('react');
  });

  it('handles empty input', () => {
    const tags = extractTags('', '');
    expect(tags).toEqual([]);
  });
});

describe('parseScoreFilters', () => {
  it('parses and normalizes valid filters', () => {
    const filters = parseScoreFilters('[{"label":"optimism","range":[0.8,0.5]}]');
    expect(filters).toEqual([{ label: 'optimism', range: [0.5, 0.8] }]);
  });

  it('returns an empty array when omitted', () => {
    expect(parseScoreFilters(undefined)).toEqual([]);
  });

  it('rejects malformed JSON', () => {
    expect(() => parseScoreFilters('[{"label":"optimism"}')).toThrow('scoreFilters must be valid JSON');
  });

  it('rejects invalid ranges', () => {
    expect(() => parseScoreFilters('[{"label":"optimism","range":[0.5]}]')).toThrow(
      'scoreFilters[0].range must contain exactly 2 values'
    );
  });

  it('rejects out-of-range values', () => {
    expect(() => parseScoreFilters('[{"label":"optimism","range":[0.5,1.2]}]')).toThrow(
      'scoreFilters[0].range values must be numbers between 0 and 1'
    );
  });
});

describe('postMatchesScoreFilters', () => {
  it('matches posts within an inclusive range', () => {
    expect(postMatchesScoreFilters({ optimism: 0.6 }, [{ label: 'optimism', range: [0.5, 0.8] }])).toBe(true);
  });

  it('rejects posts outside the requested range', () => {
    expect(postMatchesScoreFilters({ optimism: 0.4 }, [{ label: 'optimism', range: [0.5, 0.8] }])).toBe(false);
  });

  it('treats missing score labels as valid', () => {
    expect(postMatchesScoreFilters({ optimism: 0.6 }, [{ label: 'nsfw', range: [0.0, 0.3] }])).toBe(true);
  });

  it('requires all requested labels with present values to pass', () => {
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

  it('accepts score maps from mongoose documents', () => {
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

describe('Post model defaults', () => {
  it('initializes analyzer-related fields consistently', () => {
    const post = new Post({ title: 'Test', content: 'Body', creator: 'user' });
    expect(post.scores instanceof Map).toBe(true);
    expect(post.toObject().scores).toBeInstanceOf(Map);
    expect(Object.fromEntries(post.scores.entries())).toEqual({});
    expect(post.isAnalyzed).toBe(false);
  });
});
