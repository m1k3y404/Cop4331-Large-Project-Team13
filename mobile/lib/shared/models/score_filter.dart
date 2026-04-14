import 'dart:convert';

class ScoreFilter {
  const ScoreFilter({
    required this.label,
    required this.min,
    required this.max,
  });

  final String label;
  final double min;
  final double max;

  double get normalizedMin => min <= max ? min : max;
  double get normalizedMax => min <= max ? max : min;

  Map<String, dynamic> toApiJson() {
    return {
      'label': label.trim(),
      'range': [normalizedMin, normalizedMax],
    };
  }

  static String encodeForQuery(List<ScoreFilter> filters) {
    return jsonEncode(filters.map((filter) => filter.toApiJson()).toList());
  }
}
