String formatShortDate(DateTime dateTime) {
  final month = _monthName(dateTime.month);
  return '$month ${dateTime.day}, ${dateTime.year}';
}

String _monthName(int month) {
  const months = <String>[
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  if (month < 1 || month > months.length) {
    return 'Date';
  }

  return months[month - 1];
}
