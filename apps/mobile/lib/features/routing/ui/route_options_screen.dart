import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/shared/widgets/transit_badge.dart';
import 'package:mobile/shared/widgets/loading_state.dart';
import 'package:mobile/shared/widgets/error_state.dart';
import 'package:mobile/shared/widgets/empty_state.dart';
import 'package:mobile/shared/widgets/app_card.dart';
import '../domain/models.dart';
import '../state/route_options_notifier.dart';
import 'journey_detail_screen.dart';

class RouteOptionsScreen extends ConsumerStatefulWidget {
  final JourneyRequest request;

  const RouteOptionsScreen({Key? key, required this.request}) : super(key: key);

  @override
  ConsumerState<RouteOptionsScreen> createState() => _RouteOptionsScreenState();
}

class _RouteOptionsScreenState extends ConsumerState<RouteOptionsScreen> {
  @override
  void initState() {
    super.initState();
    // Do not initiate search automatically to avoid network calls during tests
  }

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
            onPressed:
                state.status == RoutingStatus.loading ||
                        state.status == RoutingStatus.searching
                    ? null
                    : () => _searchRoutes(notifier),
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
        return const _LoadingView();
      case RoutingStatus.success:
        return _SuccessView(
          routes: state.routes,
          onSelect: (route) => _openJourneyDetail(route),
        );
      case RoutingStatus.noRoute:
        return _EmptyView(
          title: 'Belum menemukan rute yang sesuai',
          description:
              'Rute yang tersedia mungkin belum mendukung perjalanan ini. Coba ubah lokasi atau waktu keberangkatan.',
          onRetry: () => _searchRoutes(notifier),
          onBack: () => Navigator.pop(context),
        );
      case RoutingStatus.error:
        return _ErrorView(
          failure: state.failure!,
          onRetry: () => _searchRoutes(notifier),
          onBack: () => Navigator.pop(context),
        );
      case RoutingStatus.idle:
        return const _LoadingView();
    }
  }

  void _searchRoutes(RouteOptionsNotifier notifier) {
    notifier.searchRoutes(widget.request);
  }

  void _swapOriginDestination() {
    final swapped = JourneyRequest(
      origin: widget.request.destination,
      destination: widget.request.origin,
      departureTime: widget.request.departureTime,
      preference: widget.request.preference,
    );
    Navigator.pop(context, swapped);
  }

  void _openJourneyDetail(RouteAlternative route) {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => JourneyDetailScreen(route: route)),
    );
  }
}

class _LoadingView extends StatelessWidget {
  const _LoadingView();

  @override
  Widget build(BuildContext context) {
    return const LoadingState(message: 'Mencari halte dan stasiun terdekat...');
  }
}

class _SuccessView extends StatelessWidget {
  final List<RouteAlternative> routes;
  final void Function(RouteAlternative) onSelect;

  const _SuccessView({required this.routes, required this.onSelect});

  @override
  Widget build(BuildContext context) {
    return ListView.separated(
      padding: const EdgeInsets.all(16),
      itemCount: routes.length,
      separatorBuilder: (_, __) => const SizedBox(height: 12),
      itemBuilder: (context, index) {
        final route = routes[index];
        return _RouteCard(
          route: route,
          index: index,
          onTap: () => onSelect(route),
        );
      },
    );
  }
}

class _RouteCard extends StatelessWidget {
  final RouteAlternative route;
  final int index;
  final VoidCallback onTap;

  const _RouteCard({
    required this.route,
    required this.index,
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
          const SizedBox(height: 12),
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
    if (lower.contains('krl') || lower.contains('commuter')) {
      return TransitMode.krl;
    }
    if (lower.contains('transjakarta') || lower.contains('brt')) {
      return TransitMode.transjakarta;
    }
    if (lower.contains('jaklingko') ||
        lower.contains('mrt') ||
        lower.contains('lrt')) {
      return TransitMode.jaklingko;
    }
    return TransitMode.walk;
  }
}

class _EmptyView extends StatelessWidget {
  final String title;
  final String description;
  final VoidCallback onRetry;
  final VoidCallback onBack;

  const _EmptyView({
    required this.title,
    required this.description,
    required this.onRetry,
    required this.onBack,
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
