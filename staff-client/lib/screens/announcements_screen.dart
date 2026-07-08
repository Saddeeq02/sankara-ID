import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'login_screen.dart'; // For getBaseUrl()

class AnnouncementsScreen extends StatefulWidget {
  const AnnouncementsScreen({Key? key}) : super(key: key);

  @override
  State<AnnouncementsScreen> createState() => _AnnouncementsScreenState();
}

class _AnnouncementsScreenState extends State<AnnouncementsScreen> {
  List<dynamic> _announcements = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchAnnouncements();
  }

  Future<void> _fetchAnnouncements() async {
    try {
      final res = await http.get(Uri.parse("${getBaseUrl()}/announcements/"));
      if (res.statusCode == 200) {
        setState(() {
          _announcements = jsonDecode(res.body);
        });
      }
    } catch (e) {
      debugPrint("Error fetching announcements: $e");
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF121212),
      appBar: AppBar(
        title: const Text('Announcements', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
        backgroundColor: const Color(0xFF0D1A26),
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: Colors.blueAccent))
          : RefreshIndicator(
              onRefresh: _fetchAnnouncements,
              child: _announcements.isEmpty
                  ? const Center(
                      child: Text(
                        'No announcements posted yet.\nCheck back later!',
                        textAlign: TextAlign.center,
                        style: TextStyle(color: Colors.white54, fontSize: 16),
                      ),
                    )
                  : ListView.builder(
                      padding: const EdgeInsets.all(16),
                      itemCount: _announcements.length,
                      itemBuilder: (context, index) {
                        final a = _announcements[index];
                        final title = a['title'] ?? '';
                        final content = a['content'] ?? '';
                        final dateStr = a['created_at'] != null
                            ? DateTime.parse(a['created_at']).toLocal().toString().substring(0, 16)
                            : '';

                        return Card(
                          color: const Color(0xFF1E1E1E),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                          margin: const EdgeInsets.only(bottom: 16),
                          child: Padding(
                            padding: const EdgeInsets.all(16),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    const Icon(Icons.campaign, color: Colors.orangeAccent, size: 24),
                                    const SizedBox(width: 8),
                                    const Text(
                                      'MANAGEMENT BROADCAST',
                                      style: TextStyle(
                                        fontSize: 12,
                                        fontWeight: FontWeight.bold,
                                        color: Colors.orangeAccent,
                                        letterSpacing: 1.1,
                                      ),
                                    ),
                                    const Spacer(),
                                    Text(
                                      dateStr,
                                      style: const TextStyle(color: Colors.white30, fontSize: 11),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 12),
                                Text(
                                  title,
                                  style: const TextStyle(
                                    fontSize: 18,
                                    fontWeight: FontWeight.bold,
                                    color: Colors.white,
                                  ),
                                ),
                                const SizedBox(height: 8),
                                Text(
                                  content,
                                  style: const TextStyle(
                                    fontSize: 14,
                                    color: Colors.white70,
                                    height: 1.5,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        );
                      },
                    ),
            ),
    );
  }
}
