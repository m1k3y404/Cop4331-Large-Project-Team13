import { describe, it, expect } from 'vitest';

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
