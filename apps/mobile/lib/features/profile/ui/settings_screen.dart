import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/features/auth/auth_provider.dart';

class SettingsScreen extends ConsumerWidget {
  const SettingsScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Pengaturan')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _SettingsSection(
            title: 'Akun & Keamanan',
            children: [
              _SettingsTile(
                title: 'Ubah Kata Sandi',
                subtitle: 'Perbarui kata sandi akun',
                leading: Icons.lock,
                onTap: () => _showComingSoon(context),
              ),
              _SettingsTile(
                title: 'Verifikasi Email',
                subtitle: 'Konfirmasi alamat email',
                leading: Icons.email,
                onTap: () => _showComingSoon(context),
              ),
              _SettingsTile(
                title: 'Keluar',
                subtitle: 'Akun: ${authState.email ?? '-'}',
                leading: Icons.logout,
                isDestructive: true,
                onTap: () => _confirmLogout(context, ref),
              ),
            ],
          ),
          const SizedBox(height: 16),
          _SettingsSection(
            title: 'Tampilan',
            children: [
              _SettingsTile(
                title: 'Tema',
                subtitle: 'Terang / Gelap / Ikuti Sistem',
                leading: Icons.palette,
                onTap: () => _showComingSoon(context),
              ),
              _SettingsTile(
                title: 'Bahasa',
                subtitle: 'Indonesia / English',
                leading: Icons.language,
                onTap: () => _showComingSoon(context),
              ),
              _SettingsTile(
                title: 'Ukuran Teks',
                subtitle: 'Atur ukuran font aplikasi',
                leading: Icons.text_fields,
                onTap: () => _showComingSoon(context),
              ),
            ],
          ),
          const SizedBox(height: 16),
          _SettingsSection(
            title: 'Notifikasi',
            children: [
              _SettingsTile(
                title: 'Notifikasi Perjalanan',
                subtitle: 'Pengingat keberangkatan',
                leading: Icons.notifications_active,
                onTap: () => _showComingSoon(context),
              ),
              _SettingsTile(
                title: 'Notifikasi Layanan',
                subtitle: 'Info gangguan & promosi',
                leading: Icons.info_outline,
                onTap: () => _showComingSoon(context),
              ),
            ],
          ),
          const SizedBox(height: 16),
          _SettingsSection(
            title: 'Rute & Navigasi',
            children: [
              _SettingsTile(
                title: 'Preferensi Rute Default',
                subtitle: 'Cepat / Minim Transit / Minim Jalan',
                leading: Icons.route,
                onTap: () => _showComingSoon(context),
              ),
              _SettingsTile(
                title: 'Jarak Jalan Kaki Maksimal',
                subtitle: 'Batas pencarian halte terdekat',
                leading: Icons.directions_walk,
                onTap: () => _showComingSoon(context),
              ),
              _SettingsTile(
                title: 'Mode Aksesibilitas',
                subtitle: 'Rute ramah disabilitas',
                leading: Icons.accessibility,
                onTap: () => _showComingSoon(context),
              ),
            ],
          ),
          const SizedBox(height: 16),
          _SettingsSection(
            title: 'Data & Privasi',
            children: [
              _SettingsTile(
                title: 'Hapus Riwayat Pencarian',
                subtitle: 'Bersihkan riwayat lokal & server',
                leading: Icons.history,
                isDestructive: true,
                onTap: () => _confirmClearHistory(context),
              ),
              _SettingsTile(
                title: 'Hapus Semua Data Tersimpan',
                subtitle: 'Reset aplikasi ke kondisi awal',
                leading: Icons.delete_forever,
                isDestructive: true,
                onTap: () => _showComingSoon(context),
              ),
              _SettingsTile(
                title: 'Ekspor Data Saya',
                subtitle: 'Unduh data pribadi (GDPR)',
                leading: Icons.download,
                onTap: () => _showComingSoon(context),
              ),
            ],
          ),
          const SizedBox(height: 16),
          _SettingsSection(
            title: 'Tentang',
            children: [
              _SettingsTile(
                title: 'Versi Aplikasi',
                subtitle: '1.0.0 (Build 1)',
                leading: Icons.info,
                onTap: () {},
              ),
              _SettingsTile(
                title: 'Syarat & Ketentuan',
                leading: Icons.description,
                onTap: () => _showComingSoon(context),
              ),
              _SettingsTile(
                title: 'Kebijakan Privasi',
                leading: Icons.privacy_tip,
                onTap: () => _showComingSoon(context),
              ),
              _SettingsTile(
                title: 'Open Source Licenses',
                leading: Icons.code,
                onTap: () => _showComingSoon(context),
              ),
              _SettingsTile(
                title: 'Laporkan Masalah',
                leading: Icons.bug_report,
                onTap: () => _showComingSoon(context),
              ),
            ],
          ),
        ],
      ),
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

  void _confirmClearHistory(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Hapus Riwayat?'),
        content: const Text('Hapus seluruh riwayat pencarian lokal dan server?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Batal')),
          TextButton(
            onPressed: () {
              Navigator.pop(ctx);
            },
            child: const Text('Hapus'),
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

class _SettingsSection extends StatelessWidget {
  final String title;
  final List<Widget> children;

  const _SettingsSection({required this.title, required this.children});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.only(left: 8, bottom: 8),
          child: Text(
            title,
            style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: Colors.grey),
          ),
        ),
        Card(child: Column(children: children)),
      ],
    );
  }
}

class _SettingsTile extends StatelessWidget {
  final String title;
  final String? subtitle;
  final IconData leading;
  final bool isDestructive;
  final VoidCallback onTap;

  const _SettingsTile({
    required this.title,
    this.subtitle,
    required this.leading,
    this.isDestructive = false,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final color = isDestructive ? const Color(0xFFBA1A1A) : null;
    final bgColor = isDestructive ? const Color(0xFFBA1A1A).withOpacity(0.05) : null;

    return Material(
      color: bgColor,
      child: InkWell(
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          child: Row(
            children: [
              Icon(leading, color: color ?? const Color(0xFF2563EB)),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(title, style: TextStyle(fontSize: 16, color: color)),
                    if (subtitle != null)
                      Text(subtitle!, style: const TextStyle(fontSize: 13, color: Colors.grey)),
                  ],
                ),
              ),
              const Icon(Icons.chevron_right, color: Colors.grey),
            ],
          ),
        ),
      ),
    );
  }
}