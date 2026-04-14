export interface ScoreFilter {
  label: string;
  range: [number, number];
}

function isValidScoreValue(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 1;
}

export function normalizeRange(range: [number, number]): [number, number] {
  return range[0] <= range[1] ? range : [range[1], range[0]];
}

export function parseScoreFilters(raw: unknown): ScoreFilter[] {
  if (raw === undefined) {
    return [];
  }

  if (typeof raw !== 'string') {
    throw new Error('scoreFilters must be a JSON-encoded array');
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error('scoreFilters must be valid JSON');
  }

  if (!Array.isArray(parsed)) {
    throw new Error('scoreFilters must be an array');
  }

  return parsed.map((item, index) => {
    if (!item || typeof item !== 'object') {
      throw new Error(`scoreFilters[${index}] must be an object`);
    }

    const label = 'label' in item ? item.label : undefined;
    const range = 'range' in item ? item.range : undefined;

    if (typeof label !== 'string' || label.trim().length === 0) {
      throw new Error(`scoreFilters[${index}].label is required`);
    }

    if (!Array.isArray(range) || range.length !== 2) {
      throw new Error(`scoreFilters[${index}].range must contain exactly 2 values`);
    }

    const [first, second] = range;
    if (!isValidScoreValue(first) || !isValidScoreValue(second)) {
      throw new Error(`scoreFilters[${index}].range values must be numbers between 0 and 1`);
    }

    return {
      label: label.trim(),
      range: normalizeRange([first, second]),
    };
  });
}

export function postMatchesScoreFilters(
  scores: Record<string, number> | Map<string, number> | null | undefined,
  filters: ScoreFilter[]
): boolean {
  if (filters.length === 0) {
    return true;
  }

  const scoreRecord =
    scores instanceof Map
      ? Object.fromEntries(scores.entries())
      : scores ?? {};

  return filters.every(({ label, range: [min, max] }) => {
    const score = scoreRecord[label];
    if (score === undefined) {
      return true;
    }

    return typeof score === 'number' && score >= min && score <= max;
  });
}
