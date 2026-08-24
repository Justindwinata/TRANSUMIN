class ServiceAlert {
  final String id;
  final String title;
  final String description;
  final DateTime startsAt;
  final DateTime? endsAt;
  final bool active;

  const ServiceAlert({
    required this.id,
    required this.title,
    required this.description,
    required this.startsAt,
    this.endsAt,
    this.active = true,
  });
}
