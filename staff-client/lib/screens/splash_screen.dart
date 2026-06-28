import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:url_launcher/url_launcher.dart';
import 'home_screen.dart';
import 'login_screen.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({Key? key}) : super(key: key);

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  @override
  void initState() {
    super.initState();
    _initializeApp();
  }

  Future<void> _initializeApp() async {
    // Artificial delay so splash screen is visible for at least 2.5 seconds
    final minimumDelay = Future.delayed(const Duration(milliseconds: 2500));
    final checkLogin = _checkLoginStatus();

    final results = await Future.wait([minimumDelay, checkLogin]);
    final isLoggedIn = results[1] as bool;

    if (mounted) {
      Navigator.pushReplacement(
        context,
        PageRouteBuilder(
          pageBuilder: (context, animation, secondaryAnimation) => isLoggedIn ? const HomeScreen() : const LoginScreen(),
          transitionsBuilder: (context, animation, secondaryAnimation, child) {
            return FadeTransition(opacity: animation, child: child);
          },
          transitionDuration: const Duration(milliseconds: 800),
        ),
      );
    }
  }

  Future<bool> _checkLoginStatus() async {
    final prefs = await SharedPreferences.getInstance();

    // Request notification permissions
    try {
      FirebaseMessaging messaging = FirebaseMessaging.instance;
      await messaging.requestPermission();
      String? token = await messaging.getToken();
      if (token != null) {
        await prefs.setString('fcm_token', token);
      }
    } catch (_) {}

    final lastActivity = prefs.getInt('last_activity');
    if (lastActivity != null && prefs.containsKey('staff_id')) {
      final last = DateTime.fromMillisecondsSinceEpoch(lastActivity);
      if (DateTime.now().difference(last).inMinutes >= 30) {
        final username = prefs.getString('username');
        await prefs.clear();
        if (username != null) {
          await prefs.setString('username', username);
        }
        return false;
      }
    }

    return prefs.containsKey('staff_id');
  }

  Future<void> _launchURL() async {
    final Uri url = Uri.parse('https://brainiacs.ng');
    if (!await launchUrl(url)) {
      debugPrint('Could not launch $url');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF121212), // Dark background matching theme
      body: Stack(
        children: [
          // Center Logo
          Center(
            child: TweenAnimationBuilder<double>(
              tween: Tween<double>(begin: 0.0, end: 1.0),
              duration: const Duration(milliseconds: 1500),
              curve: Curves.easeOutCubic,
              builder: (context, value, child) {
                return Transform.scale(
                  scale: 0.8 + (0.2 * value),
                  child: Opacity(
                    opacity: value,
                    child: child,
                  ),
                );
              },
              child: Hero(
                tag: 'app_logo',
                child: Image.asset(
                  'assets/logo.png',
                  width: 200,
                  fit: BoxFit.contain,
                ),
              ),
            ),
          ),

          // Bottom Powered By
          Positioned(
            bottom: 40,
            left: 0,
            right: 0,
            child: TweenAnimationBuilder<double>(
              tween: Tween<double>(begin: 0.0, end: 1.0),
              duration: const Duration(milliseconds: 1000),
              curve: Curves.easeOut,
              builder: (context, value, child) {
                return Opacity(
                  opacity: value,
                  child: Transform.translate(
                    offset: Offset(0, 20 * (1 - value)),
                    child: child,
                  ),
                );
              },
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Text(
                    'Powered by',
                    style: TextStyle(
                      color: Colors.white54,
                      fontSize: 12,
                      letterSpacing: 1.2,
                    ),
                  ),
                  const SizedBox(height: 4),
                  GestureDetector(
                    onTap: _launchURL,
                    child: const Text(
                      'Brainiacs Innovation',
                      style: TextStyle(
                        color: Color(0xFF6366F1), // Indigo primary
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 1.0,
                        decoration: TextDecoration.underline,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
