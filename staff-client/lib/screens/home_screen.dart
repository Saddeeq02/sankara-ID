import 'dart:convert';
import 'dart:async';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'qr_scanner_screen.dart';
import 'tasks_screen.dart';
import 'leaderboard_screen.dart';
import 'score_history_screen.dart';
import 'attendance_history_screen.dart';
import 'login_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({Key? key}) : super(key: key);

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  String _fullName = "Staff Member";
  String _role = "";
  String _picturePath = "";
  int _score = 0;
  bool _isLoading = true;
  Timer? _notificationTimer;
  int _previousPendingTaskCount = -1;

  @override
  void initState() {
    super.initState();
    _loadStaffData();
    _startNotificationPolling();
  }

  void _startNotificationPolling() {
    // Check weekly leaderboard on startup
    _checkWeeklyLeaderboard();
    
    _notificationTimer = Timer.periodic(const Duration(seconds: 15), (timer) {
      _checkForNewTasks();
    });
  }

  Future<void> _checkWeeklyLeaderboard() async {
    final now = DateTime.now();
    if (now.weekday == DateTime.monday) {
      final prefs = await SharedPreferences.getInstance();
      final weekKey = "leaderboard_popup_${now.year}_${now.month}_${now.day}";
      final lastShownWeek = prefs.getString('last_leaderboard_popup');
      
      if (lastShownWeek != weekKey) {
        try {
          final res = await http.get(Uri.parse("${getBaseUrl()}/staff/"));
          if (res.statusCode == 200) {
            final List<dynamic> allStaff = jsonDecode(res.body);
            allStaff.sort((a, b) => (b['score'] ?? 0).compareTo(a['score'] ?? 0));
            
            if (allStaff.isNotEmpty) {
              final topPerformer = allStaff.first;
              if ((topPerformer['score'] ?? 0) > 0) {
                if (mounted) {
                  showDialog(
                    context: context,
                    builder: (context) => AlertDialog(
                      title: const Text('🏆 Weekly Top Performer!'),
                      content: Text('Congratulations to ${topPerformer['full_name']} for being #1 this week with ${topPerformer['score']} points!'),
                      actions: [
                        TextButton(onPressed: () => Navigator.pop(context), child: const Text('Awesome!'))
                      ],
                    ),
                  );
                }
                await prefs.setString('last_leaderboard_popup', weekKey);
              }
            }
          }
        } catch (_) {}
      }
    }
  }

  Future<void> _checkForNewTasks() async {
    final prefs = await SharedPreferences.getInstance();
    final staffId = prefs.getInt('staff_id');
    if (staffId == null) return;

    try {
      final res = await http.get(Uri.parse("${getBaseUrl()}/tasks/staff/$staffId"));
      if (res.statusCode == 200) {
        final List<dynamic> tasks = jsonDecode(res.body);
        final pendingCount = tasks.where((t) => t['status'] == 'pending').length;
        
        if (_previousPendingTaskCount != -1 && pendingCount > _previousPendingTaskCount) {
          // New task assigned!
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text('🔔 You have a new task assigned!'),
                backgroundColor: Colors.blueAccent,
                duration: Duration(seconds: 5),
              ),
            );
          }
        }
        _previousPendingTaskCount = pendingCount;
      }
    } catch (_) {}
  }

  @override
  void dispose() {
    _notificationTimer?.cancel();
    super.dispose();
  }

  Future<void> _loadStaffData() async {
    final prefs = await SharedPreferences.getInstance();
    final staffId = prefs.getInt('staff_id');

    if (staffId == null) {
      _logout();
      return;
    }

    // Set initial cached state
    setState(() {
      _fullName = prefs.getString('full_name') ?? "Staff Member";
      _role = prefs.getString('role') ?? "";
      _picturePath = prefs.getString('picture_path') ?? "";
      _score = prefs.getInt('score') ?? 0;
    });

    // Fetch latest data from server
    try {
      final res = await http.get(Uri.parse("${getBaseUrl()}/staff/$staffId"));
      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        setState(() {
          _fullName = data['full_name'] ?? _fullName;
          _role = data['role'] ?? _role;
          _picturePath = data['picture_path'] ?? _picturePath;
          _score = data['score'] ?? _score;
        });

        // Update cache
        await prefs.setString('full_name', _fullName);
        await prefs.setString('role', _role);
        await prefs.setString('picture_path', _picturePath);
        await prefs.setInt('score', _score);
        
        // Sync FCM Token
        final fcmToken = prefs.getString('fcm_token');
        if (fcmToken != null) {
          http.put(
            Uri.parse("${getBaseUrl()}/staff/$staffId/fcm-token"),
            headers: {'Content-Type': 'application/json'},
            body: jsonEncode({'fcm_token': fcmToken}),
          ).catchError((_) => http.Response('', 500));
        }
      }
    } catch (e) {
      // Ignore network errors and use cached data
      debugPrint("Error updating staff data: $e");
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  Future<void> _logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.clear();
    if (mounted) {
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (context) => const LoginScreen()),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final photoUrl = _picturePath.isNotEmpty 
        ? (_picturePath.startsWith('http') ? _picturePath : "${getBaseUrl()}/$_picturePath") 
        : "";
    final isDark = theme.brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? const Color(0xFF121212) : const Color(0xFFF3F4F6),
      body: RefreshIndicator(
        onRefresh: _loadStaffData,
        child: CustomScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          slivers: [
            SliverAppBar(
              expandedHeight: 220.0,
              floating: false,
              pinned: true,
              backgroundColor: const Color(0xFF0D1A26),
              elevation: 0,
              actions: [
                IconButton(
                  icon: const Icon(Icons.notifications, color: Colors.white),
                  tooltip: 'Notifications',
                  onPressed: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('No new notifications right now!')),
                    );
                  },
                ),
                IconButton(
                  icon: const Icon(Icons.logout, color: Colors.white),
                  tooltip: 'Logout',
                  onPressed: _logout,
                ),
              ],
              flexibleSpace: FlexibleSpaceBar(
                background: Stack(
                  fit: StackFit.expand,
                  children: [
                    // Background Image
                    Image.asset(
                      'assets/tractor_bg.png',
                      fit: BoxFit.cover,
                      color: Colors.black.withValues(alpha: 0.6),
                      colorBlendMode: BlendMode.darken,
                    ),
                    Positioned(
                      bottom: 24,
                      left: 24,
                      right: 24,
                      child: Row(
                        children: [
                          Container(
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              border: Border.all(color: Colors.white, width: 3),
                              boxShadow: [
                                BoxShadow(color: Colors.black.withValues(alpha: 0.2), blurRadius: 8, offset: const Offset(0, 4)),
                              ],
                            ),
                            child: CircleAvatar(
                              radius: 40,
                              backgroundColor: Colors.white,
                              backgroundImage: photoUrl.isNotEmpty ? NetworkImage(photoUrl) : null,
                              child: photoUrl.isEmpty ? const Icon(Icons.person, size: 40, color: Colors.grey) : null,
                            ),
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text(
                                  'Welcome Back,',
                                  style: TextStyle(fontSize: 14, color: Colors.white70),
                                ),
                                Text(
                                  _fullName,
                                  style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.white),
                                ),
                                if (_role.isNotEmpty)
                                  Container(
                                    margin: const EdgeInsets.only(top: 6),
                                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                    decoration: BoxDecoration(
                                      color: Colors.white.withValues(alpha: 0.2),
                                      borderRadius: BorderRadius.circular(12),
                                    ),
                                    child: Text(
                                      _role,
                                      style: const TextStyle(fontSize: 12, color: Colors.white, fontWeight: FontWeight.w600),
                                    ),
                                  ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.all(24.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    // Stats Card
                    Container(
                      padding: const EdgeInsets.all(24),
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          colors: [Color(0xFF00C6FF), Color(0xFF0072FF)], // Cool blue gradient
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ),
                        borderRadius: BorderRadius.circular(24),
                        boxShadow: [
                          BoxShadow(
                            color: const Color(0xFF0072FF).withValues(alpha: 0.3),
                            blurRadius: 15,
                            offset: const Offset(0, 8),
                          ),
                        ],
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text('Performance Score', style: TextStyle(color: Colors.white70, fontSize: 16)),
                              const SizedBox(height: 8),
                              _isLoading
                                  ? const SizedBox(
                                      height: 48,
                                      child: Center(child: CircularProgressIndicator(color: Colors.white)),
                                    )
                                  : Text(
                                      '$_score',
                                      style: const TextStyle(fontSize: 48, fontWeight: FontWeight.bold, color: Colors.white),
                                    ),
                            ],
                          ),
                          Container(
                            padding: const EdgeInsets.all(16),
                            decoration: BoxDecoration(
                              color: Colors.white.withValues(alpha: 0.2),
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(Icons.star, color: Colors.white, size: 40),
                          ),
                        ],
                      ),
                    ),
                    
                    const SizedBox(height: 32),
                    const Text('Quick Actions', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 16),
                    
                    // Grid of Actions
                    GridView.count(
                      crossAxisCount: 2,
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      crossAxisSpacing: 16,
                      mainAxisSpacing: 16,
                      children: [
                        _buildActionCard(
                          context,
                          title: 'Clock In / Out',
                          icon: Icons.qr_code_scanner,
                          color: const Color(0xFFFF512F),
                          gradient: const LinearGradient(colors: [Color(0xFFFF512F), Color(0xFFDD2476)]),
                          onTap: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(builder: (context) => const QRScannerScreen()),
                            ).then((_) => _loadStaffData());
                          },
                        ),
                        _buildActionCard(
                          context,
                          title: 'My Tasks',
                          icon: Icons.task_alt,
                          color: const Color(0xFF11998E),
                          gradient: const LinearGradient(colors: [Color(0xFF11998E), Color(0xFF38EF7D)]),
                          onTap: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(builder: (context) => const TasksScreen()),
                            ).then((_) => _loadStaffData());
                          },
                        ),
                        _buildActionCard(
                          context,
                          title: 'Leaderboard',
                          icon: Icons.leaderboard,
                          color: const Color(0xFF8E2DE2),
                          gradient: const LinearGradient(colors: [Color(0xFF8E2DE2), Color(0xFF4A00E0)]),
                          onTap: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(builder: (context) => const LeaderboardScreen()),
                            );
                          },
                        ),
                        _buildActionCard(
                          context,
                          title: 'Score History',
                          icon: Icons.history,
                          color: const Color(0xFF8E2DE2),
                          gradient: const LinearGradient(colors: [Color(0xFF8E2DE2), Color(0xFF4A00E0)]),
                          onTap: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(builder: (context) => const ScoreHistoryScreen()),
                            );
                          },
                        ),
                        _buildActionCard(
                          context,
                          title: 'Attendance',
                          icon: Icons.calendar_month,
                          color: const Color(0xFFF2994A),
                          gradient: const LinearGradient(colors: [Color(0xFFF2994A), Color(0xFFF2C94C)]),
                          onTap: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(builder: (context) => const AttendanceHistoryScreen()),
                            );
                          },
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildActionCard(BuildContext context, {required String title, required IconData icon, required Color color, required Gradient gradient, required VoidCallback onTap}) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(20),
        child: Container(
          decoration: BoxDecoration(
            color: isDark ? const Color(0xFF1E1E1E) : Colors.white,
            borderRadius: BorderRadius.circular(20),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: isDark ? 0.3 : 0.05),
                blurRadius: 10,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  gradient: gradient,
                  shape: BoxShape.circle,
                  boxShadow: [
                    BoxShadow(color: color.withValues(alpha: 0.4), blurRadius: 8, offset: const Offset(0, 4)),
                  ],
                ),
                child: Icon(icon, color: Colors.white, size: 32),
              ),
              const SizedBox(height: 16),
              Text(
                title,
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: isDark ? Colors.white : Colors.black87,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
