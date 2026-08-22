import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:mobile/shared/widgets/app_card.dart';
import 'package:mobile/shared/widgets/journey_step.dart';
import '../domain/models.dart';
import '../presentation/journey_instruction_mapper.dart';
import '../../map/presentation/journey_map_model.dart';

class JourneyDetailScreen extends StatelessWidget {
  final RouteAlternative route;

  const JourneyDetailScreen({Key? key, required this.route}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final instructions = JourneyInstructionMapper.fromJourney(route);
    final mapModel = JourneyMapBuilder.fromJourney(route);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Detail Perjalanan'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _Header(route: route),
            _Summary(route: route),
            _MapPreview(mapModel: mapModel),
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              child: Text(
                'Langkah Perjalanan',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
              ),
            ),
            ...instructions.map(
              (i) => JourneyStepWidget(
                title: i.title,
                subtitle: i.subtitle,
                iconType: _iconType(i.kind),
                isLast: i == instructions.last,
              ),
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  String _iconType(InstructionKind kind) {
    switch (kind) {
      case InstructionKind.start:
      case InstructionKind.arrive:
        return 'arrive';
      case InstructionKind.walk:
        return 'walk';
      case InstructionKind.board:
        return 'board';
      case InstructionKind.ride:
        return 'ride';
      case InstructionKind.transfer:
        return 'transfer';
      case InstructionKind.alight:
        return 'alight';
      case InstructionKind.wait:
        return 'wait';
    }
  }
}

class _Header extends StatelessWidget {
  final RouteAlternative route;

  const _Header({required this.route});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            route.origin.name ?? 'Lokasi Asal',
            style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 4),
          Row(
            children: [
              const Icon(Icons.arrow_forward, size: 16, color: Colors.grey),
              const SizedBox(width: 4),
              Text(
                route.destination.name ?? 'Lokasi Tujuan',
                style: const TextStyle(fontSize: 14, color: Colors.grey),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 10,
                  vertical: 4,
                ),
                decoration: BoxDecoration(
                  color: const Color(0xFF2563EB).withOpacity(0.1),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Text(
                  route.durationText,
                  style: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: Color(0xFF2563EB),
                  ),
                ),
              ),
              const SizedBox(width: 8),
              if (route.badge != null)
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 10,
                    vertical: 4,
                  ),
                  decoration: BoxDecoration(
                    color: const Color(0xFF2563EB),
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Text(
                    route.badge!,
                    style: const TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: Colors.white,
                    ),
                  ),
                ),
            ],
          ),
        ],
      ),
    );
  }
}

class _Summary extends StatelessWidget {
  final RouteAlternative route;

  const _Summary({required this.route});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: AppCard(
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceAround,
          children: [
            _Stat(label: 'Total Waktu', value: route.durationText),
            _Stat(label: 'Transit', value: '${route.transferCount}x'),
            _Stat(label: 'Jalan Kaki', value: route.walkDistanceText),
            _Stat(label: 'Moda', value: route.transitModes.join(', ')),
          ],
        ),
      ),
    );
  }
}

class _Stat extends StatelessWidget {
  final String label;
  final String value;

  const _Stat({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(
          value,
          style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 2),
        Text(label, style: const TextStyle(fontSize: 10, color: Colors.grey)),
      ],
    );
  }
}

class _MapPreview extends StatelessWidget {
  final JourneyMapModel mapModel;

  const _MapPreview({required this.mapModel});

  @override
  Widget build(BuildContext context) {
    if (mapModel.isEmpty) return const SizedBox.shrink();

    return Padding(
      padding: const EdgeInsets.all(16),
      child: AppCard(
        padding: EdgeInsets.zero,
        child: ClipRRect(
          borderRadius: BorderRadius.circular(24),
          child: SizedBox(
            height: 200,
            child: FlutterMap(
              options: MapOptions(
                initialCenter:
                    mapModel.center != null
                        ? LatLng(mapModel.center!.lat, mapModel.center!.lon)
                        : const LatLng(-6.2, 106.8),
                initialZoom: mapModel.zoom ?? 13.0,
                interactionOptions: const InteractionOptions(
                  flags: ~InteractiveFlag.all,
                ),
              ),
              children: [
                TileLayer(
                  urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                  userAgentPackageName: 'com.transum.in',
                ),
                if (mapModel.hasFullGeometry) ...[
                  PolylineLayer(
                    polylines: mapModel.segments
                        .map(
                          (seg) => Polyline(
                            points: seg.points
                                .map((p) => LatLng(p.lat, p.lon))
                                .toList(),
                            color: seg.kind == JourneySegmentKind.transit
                                ? (seg.routeColor != null
                                    ? Color(int.parse('0xFF${seg.routeColor}'))
                                    : const Color(0xFF2563EB))
                                : (seg.kind == JourneySegmentKind.walking
                                    ? const Color(0xFF737686)
                                    : const Color(0xFF943700)),
                            strokeWidth: 3,
                          ),
                        )
                        .toList(),
                  ),
                ],
                MarkerLayer(
                  markers:
                      mapModel.markers
                          .map(
                            (m) => Marker(
                              point: LatLng(m.latitude, m.longitude),
                              width: 36,
                              height: 36,
                              child: _MarkerIcon(
                                kind: m.kind,
                                color:
                                    m.routeColor != null
                                        ? Color(
                                          int.parse('0xFF${m.routeColor}'),
                                        )
                                        : null,
                              ),
                            ),
                          )
                          .toList(),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _MarkerIcon extends StatelessWidget {
  final JourneyMapMarkerKind kind;
  final Color? color;

  const _MarkerIcon({required this.kind, this.color});

  @override
  Widget build(BuildContext context) {
    final c = color ?? const Color(0xFF2563EB);
    return Icon(
      kind == JourneyMapMarkerKind.origin
          ? Icons.radio_button_checked
          : kind == JourneyMapMarkerKind.destination
          ? Icons.flag
          : kind == JourneyMapMarkerKind.boarding
          ? Icons.directions_transit
          : kind == JourneyMapMarkerKind.alighting
          ? Icons.directions_transit_filled
          : Icons.train,
      color: c,
      size: 28,
    );
  }
}
