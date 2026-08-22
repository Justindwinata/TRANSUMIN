import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/core/theme/app_theme.dart';

class SettingsScreen extends ConsumerWidget {
  const SettingsScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      appBar: AppBar(title: const Text('Pengaturan')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
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
            title: 'Lokasi & Privasi',
            children: [
              _SettingsTile(
                title: 'Lokasi Saat Ini',
                subtitle: 'Izinkan akses lokasi untuk pencarian',
                leading: Icons.my_location,
                onTap: () => _showComingSoon(context),
              ),
              _SettingsTile(
                title: 'Data Perjalanan',
                subtitle: 'Kelola riwayat & data tersimpan',
                leading: Icons.privacy_tip,
                onTap: () => _showComingSoon(context),
              ),
              _SettingsTile(
                title: 'Hapus Semua Data',
                subtitle: 'Reset aplikasi ke kondisi awal',
                leading: Icons.delete_forever,
                isDestructive: true,
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
            ],
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