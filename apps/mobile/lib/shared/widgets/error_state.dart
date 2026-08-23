import 'package:flutter/material.dart';

class ErrorState extends StatelessWidget {
  final String title;
  final String description;
  final String? buttonLabel;
  final VoidCallback? onRetry;

  const ErrorState({
    Key? key,
    this.title = 'Terjadi Kesalahan',
    this.description = 'Mohon periksa koneksi internet atau coba lagi.',
    this.buttonLabel = 'Coba Lagi',
    this.onRetry,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(24.0),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.error_outline, size: 64, color: Color(0xFFBA1A1A)),
          const SizedBox(height: 16),
          Text(
            title,
            style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 8),
          Text(
            description,
            style: const TextStyle(fontSize: 14, color: Colors.grey),
            textAlign: TextAlign.center,
          ),
          if (onRetry != null && buttonLabel != null) ...[
            const SizedBox(height: 24),
            ElevatedButton(onPressed: onRetry, child: Text(buttonLabel!)),
          ],
        ],
      ),
    );
  }
}
