import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/features/auth/auth_provider.dart';
import 'package:mobile/features/saved/ui/saved_places_screen.dart';
import 'package:mobile/features/saved/ui/saved_journeys_screen.dart';
import 'package:mobile/features/history/ui/journey_history_screen.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Profil'),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _ProfileHeader(authState: authState),
          const SizedBox(height: 24),
          _SectionTitle(title: 'Data Saya'),
          _ProfileTile(
            title: 'Lokasi Tersimpan',
            subtitle: 'Kelola Rumah, Kampus, Kantor',
            icon: Icons.bookmark,
            onTap: () => Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => const SavedPlacesScreen()),
            ),
          ),
          _ProfileTile(
            title: 'Perjalanan Tersimpan',
            subtitle: 'Akses cepat rute favorit',
            icon: Icons.route,
            onTap: () => Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => const SavedJourneysScreen()),
            ),
          ),
          _ProfileTile(
            title: 'Riwayat Pencarian',
            subtitle: 'Lihat dan hapus riwayat',
            icon: Icons.history,
            onTap: () => Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => const JourneyHistoryScreen()),
            ),
          ),
          const SizedBox(height: 24),
          _SectionTitle(title: 'Pengaturan'),
          _ProfileTile(
            title: 'Notifikasi',
            subtitle: 'Kelola notifikasi perjalanan',
            icon: Icons.notifications,
            onTap: () => _showComingSoon(context),
          ),
          _ProfileTile(
            title: 'Tema',
            subtitle: 'Terang / Gelap / Sistem',
            icon: Icons.palette,
            onTap: () => _showComingSoon(context),
          ),
          _ProfileTile(
            title: 'Bahasa',
            subtitle: 'Indonesia / English',
            icon: Icons.language,
            onTap: () => _showComingSoon(context),
          ),
          _ProfileTile(
            title: 'Privasi & Data',
            subtitle: 'Kelola data perjalanan Anda',
            icon: Icons.privacy_tip,
            onTap: () => _showComingSoon(context),
          ),
          const SizedBox(height: 24),
          _ProfileTile(
            title: 'Keluar',
            subtitle: 'Akun: ${authState.email ?? '-'}',
            icon: Icons.logout,
            isDestructive: true,
            onTap: () => _confirmLogout(context, ref),
          ),
        ],
      );
    }

    void _confirmLogout(BuildContext context, WidgetRef ref) {
      showDialog(
        context: context,
        builder: (ctx) => AlertDialog(
          title: const Text('Keluar?'),
          content: const Text('Anda yakin ingin keluar dari akun ini?'),
          actions: [
            TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Batal')),
            TextButton(
              onPressed: () {
                ref.read(authProvider.notifier).logout();
                Navigator.pop(ctx);
              },
              child: const Text('Keluar'),
            ),
          ],
        ),
      );
    }

    void _showComingSoon(BuildContext context) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Fitur ini akan segera hadir')),
      );
    }
  }
}

class _ProfileHeader extends StatelessWidget {
  final AuthState authState;

  const _ProfileHeader({required this.authState});

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Row(
          children: [
            CircleAvatar(
              radius: 32,
              backgroundColor: const Color(0xFF2563EB).withOpacity(0.1),
              child: const Icon(Icons.person, size: 32, color: Color(0xFF2563EB)),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    authState.email?.split('@').first ?? 'Pengguna',
                    style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    authState.email ?? '-',
                    style: const TextStyle(fontSize: 14, color: Colors.grey),
                  ),
                ],
              ),
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: const Color(0xFF2563EB).withOpacity(0.1),
                borderRadius: BorderRadius.circular(16),
              ),
              child: const Text(
                'Terdaftar',
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: Color(0xFF2563EB),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _SectionTitle extends StatelessWidget {
  final String title;

  const _SectionTitle({required this.title});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Text(
        title,
        style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: Colors.grey),
      ),
    );
  }
}

class _ProfileTile extends StatelessWidget {
  final String title;
  final String subtitle;
  final IconData icon;
  final VoidCallback onTap;
  final bool isDestructive;

  const _ProfileTile({
    required this.title,
    required this.subtitle,
    required this.icon,
    required this.onTap,
    this.isDestructive = false,
  });

  @override
  Widget build(BuildContext context) {
    final color = isDestructive ? const Color(0xFFBA1A1A) : null;

    return Card(
      child: ListTile(
        leading: Icon(icon, color: color ?? const Color(0xFF2563EB)),
        title: Text(title, style: TextStyle(color: color)),
        subtitle: Text(subtitle),
        trailing: const Icon(Icons.chevron_right),
        onTap: onTap,
      ),
    );
  }
}