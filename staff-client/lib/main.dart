import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'screens/home_screen.dart';
import 'screens/login_screen.dart';

@pragma('vm:entry-point')
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  await Firebase.initializeApp();
}

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  try {
    await Firebase.initializeApp();
    FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);
  } catch (e) {
    debugPrint("Firebase init failed: $e");
  }
  runApp(const StaffClientApp());
}

class StaffClientApp extends StatefulWidget {
  const StaffClientApp({Key? key}) : super(key: key);

  @override
  State<StaffClientApp> createState() => _StaffClientAppState();
}

class _StaffClientAppState extends State<StaffClientApp> with WidgetsBindingObserver {
  
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.paused || state == AppLifecycleState.inactive) {
      SharedPreferences.getInstance().then((prefs) {
        prefs.setInt('last_activity', DateTime.now().millisecondsSinceEpoch);
      });
    } else if (state == AppLifecycleState.resumed) {
      _checkTimeoutAndLogout();
    }
  }

  Future<void> _checkTimeoutAndLogout() async {
    final prefs = await SharedPreferences.getInstance();
    final lastActivity = prefs.getInt('last_activity');
    if (lastActivity != null && prefs.containsKey('staff_id')) {
      final last = DateTime.fromMillisecondsSinceEpoch(lastActivity);
      if (DateTime.now().difference(last).inMinutes >= 30) {
        // Logout but keep username
        final username = prefs.getString('username');
        await prefs.clear();
        if (username != null) {
          await prefs.setString('username', username);
        }
        // Force rebuild to show login screen
        setState(() {});
      }
    }
  }

  Future<bool> _checkLoginStatus() async {
    final prefs = await SharedPreferences.getInstance();

    // Request notification permissions
    try {
      FirebaseMessaging messaging = FirebaseMessaging.instance;
      await messaging.requestPermission();

      // Get FCM token for backend
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

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Sankara',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF6366F1), // Indigo primary
          brightness: Brightness.dark,
        ),
        fontFamily: 'Outfit',
      ),
      home: FutureBuilder<bool>(
        future: _checkLoginStatus(),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Scaffold(
              body: Center(
                child: CircularProgressIndicator(),
              ),
            );
          }
          if (snapshot.data == true) {
            return const HomeScreen();
          }
          return const LoginScreen();
        },
      ),
    );
  }
}
