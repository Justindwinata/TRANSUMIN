import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import '../../shared/widgets/app_card.dart';
import '../../shared/widgets/journey_step.dart';
import '../../shared/widgets/transit_badge.dart';
import '../../shared/widgets/loading_state.dart';
import '../../shared/widgets/error_state.dart';
import '../../shared/widgets/empty_state.dart';
import '../../shared/widgets/app_button.dart';
import '../domain/models.dart';
import '../state/route_options_notifier.dart';
import 'journey_instruction_mapper.dart';
import '../../map/presentation/journey_map_model.dart';

class RouteOptionsScreen extends ConsumerStatefulWidget {
  final JourneyRequest request;

  const RouteOptionsScreen({Key? key, required this.request}) : super(key: key);

  @override
  ConsumerState<RouteOptionsScreen> createState() => _RouteOptionsScreenState();
}

class _RouteOptionsScreenState extends ConsumerState<RouteOptionsScreen> {
  bool _showPreference = false;

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(routeOptionsProvider);
    final notifier = ref.read(routeOptionsProvider.notifier);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Opsi Rute'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.pop(context),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.swap_horiz),
            onPressed: _swapOriginDestination,
            tooltip: 'Tukar asal & tujuan',
          ),
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => _searchRoutes(notifier),
            tooltip: 'Segarkan',
          ),
        ],
      ),
      body: _buildBody(state, notifier),
    );
  }

  Widget _buildBody(RouteOptionsState state, RouteOptionsNotifier notifier) {
    switch (state.status) {
      case RoutingStatus.searching:
      case RoutingStatus.loading:
        return _LoadingView(message: _loadingMessage(state.status));
      case RoutingStatus.success:
        return _SuccessView(
          routes: state.routes,
          onSelect: (route) => _openJourneyDetail(route),
        );
      case RoutingStatus.noRoute:
        return _EmptyView(
          title: 'Belum menemukan rute yang sesuai',
          description: 'Coba ubah lokasi atau waktu keberangkatan.',
          onChangeLocation: () => Navigator.pop(context),
          onRetry: () => _searchRoutes(notifier),
        );
      case RoutingStatus.error:
        return _ErrorView(
          failure: state.failure!,
          onRetry: () => _searchRoutes(notifier),
          onBack: () => Navigator.pop(context),
        );
      case RoutingStatus.idle:
      default:
        return _LoadingView(message: 'Mempersiapkan pencarian...');
    }
  }

  String _loadingMessage(RoutingStatus status) {
    if (status == RoutingStatus.searching) {
      return 'Mencari halte dan stasiun terdekat...';
    }
    return 'Menyusun pilihan rute terbaik...';
  }

  void _searchRoutes(RouteOptionsNotifier notifier) {
    notifier.searchRoutes(widget.request);
  }

  void _swapOriginDestination() {
    final newRequest = JourneyRequest(
      origin: widget.request.destination,
      destination: widget.request.origin,
      departureTime: widget.request.departureTime,
      preference: widget.request.preference,
    );
    Navigator.pop(context, newRequest);
  }

  void _openJourneyDetail(RouteAlternative route) {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => JourneyDetailScreen(route: route)),
    );
  }
}

class _LoadingView extends StatelessWidget {
  final String message;
  const _LoadingView({required this.message});

  @override
  Widget build(BuildContext context) {
    return LoadingState(message: message);
  }
}

class _SuccessView extends StatelessWidget {
  final List<RouteAlternative> routes;
  final void Function(RouteAlternative) onSelect;

  const _SuccessView({required this.routes, required this.onSelect});

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: routes.length,
      itemBuilder: (context, index) {
        final route = routes[index];
        final isBest = index == 0 && route.badge != null;
        return _RouteCard(
          route: route,
          index: index,
          isBest: isBest,
          onTap: () => onSelect(route),
        );
      },
    );
  }
}

class _RouteCard extends StatelessWidget {
  final RouteAlternative route;
  final int index;
  final bool isBest;
  final VoidCallback onTap;

  const _RouteCard({
    required this.route,
    required this.index,
    required this.isBest,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return AppCard(
      onTap: onTap,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                route.durationText,
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF2563EB),
                ),
              ),
              if (route.badge != null)
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 8,
                    vertical: 4,
                  ),
                  decoration: BoxDecoration(
                    color: const Color(0xFF2563EB),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Text(
                    route.badge!,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              Text(
                '${route.departureTime} - ${route.arrivalTime}',
                style: const TextStyle(fontSize: 14),
              ),
              const Spacer(),
              Text(
                route.fareText,
                style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
          const Divider(height: 24),
          Wrap(
            spacing: 6,
            runSpacing: 4,
            children:
                route.transitModes
                    .map((m) => TransitBadge(label: m, mode: _badgeMode(m)))
                    .toList(),
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              Text(
                route.walkDistanceText,
                style: const TextStyle(fontSize: 12, color: Colors.grey),
              ),
              const SizedBox(width: 12),
              Text(
                '${route.transferCount} transit',
                style: const TextStyle(fontSize: 12, color: Colors.grey),
              ),
            ],
          ),
        ],
      ),
    );
  }

  TransitMode _badgeMode(String mode) {
    final lower = mode.toLowerCase();
    if (lower.contains('krl') || lower.contains('commuter'))
      return TransitMode.krl;
    if (lower.contains('transjakarta') || lower.contains('brt'))
      return TransitMode.transjakarta;
    if (lower.contains('jaklingko') ||
        lower.contains('mrt') ||
        lower.contains('lrt'))
      return TransitMode.jaklingko;
    return TransitMode.walk;
  }
}

class _EmptyView extends StatelessWidget {
  final String title;
  final String description;
  final VoidCallback onChangeLocation;
  final VoidCallback onRetry;

  const _EmptyView({
    required this.title,
    required this.description,
    required this.onChangeLocation,
    required this.onRetry,
  });

  @override
  Widget build(BuildContext context) {
    return EmptyState(
      title: title,
      description: description,
      buttonLabel: 'Coba Lagi',
      onButtonPressed: onRetry,
    );
  }
}

class _ErrorView extends StatelessWidget {
  final RoutingFailure failure;
  final VoidCallback onRetry;
  final VoidCallback onBack;

  const _ErrorView({
    required this.failure,
    required this.onRetry,
    required this.onBack,
  });

  @override
  Widget build(BuildContext context) {
    final isNetwork = failure.isNetworkError;
    return ErrorState(
      title: isNetwork ? 'Tidak Ada Koneksi' : 'Terjadi Masalah',
      description:
          isNetwork
              ? 'Periksa koneksi internet Anda dan coba lagi.'
              : failure.message,
      buttonLabel: 'Coba Lagi',
      onRetry: onRetry,
    );
  }
}

class JourneyDetailScreen extends ConsumerWidget {
  final RouteAlternative route;

  const JourneyDetailScreen({Key? key, required this.route}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
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
                    polylines:
                        mapModel.segments
                            .map(
                              (seg) => Polyline(
                                points:
                                    seg.points
                                        .map((p) => LatLng(p.lat, p.lon))
                                        .toList(),
                                color:
                                    seg.kind == JourneySegmentKind.transit
                                        ? (seg.routeColor != null
                                            ? Color(
                                              int.parse(
                                                '0xFF${seg.routeColor}',
                                              ),
                                            )
                                            : const Color(0xFF2563EB))
                                        : (seg.kind ==
                                                JourneySegmentKind.walking
                                            ? const Color(0xFF737686)
                                            : const Color(0xFF943700)),
                                strokeWidth: 3,
                                isDotted:
                                    seg.kind == JourneySegmentKind.walking ||
                                    seg.kind == JourneySegmentKind.transfer,
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
