import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:http/http.dart' as http;
import '../screens/login_screen.dart' show getBaseUrl;

class NotificationService {
  static final NotificationService _instance = NotificationService._internal();
  factory NotificationService() => _instance;
  NotificationService._internal();

  final FirebaseMessaging _fcm = FirebaseMessaging.instance;
  final FlutterLocalNotificationsPlugin _localNotifications = FlutterLocalNotificationsPlugin();
  bool _isInitialized = false;

  Future<void> initialize(BuildContext? context) async {
    if (_isInitialized) return;

    // 1. Initialize Local Notifications Plugin
    const AndroidInitializationSettings androidSettings = AndroidInitializationSettings('@mipmap/ic_launcher');
    const DarwinInitializationSettings iosSettings = DarwinInitializationSettings(
      requestAlertPermission: true,
      requestBadgePermission: true,
      requestSoundPermission: true,
    );
    const InitializationSettings initSettings = InitializationSettings(
      android: androidSettings,
      iOS: iosSettings,
    );

    await _localNotifications.initialize(
      settings: initSettings,
      onDidReceiveNotificationResponse: (NotificationResponse response) {
        _handleNotificationClick(response.payload, context);
      },
    );

    // Create Android Notification Channel
    const AndroidNotificationChannel channel = AndroidNotificationChannel(
      'sankara_staff_channel',
      'Sankara Staff Alerts',
      description: 'Important notifications for Sankara staff members',
      importance: Importance.high,
    );

    await _localNotifications
        .resolvePlatformSpecificImplementation<AndroidFlutterLocalNotificationsPlugin>()
        ?.createNotificationChannel(channel);

    // 2. Request FCM & Web Permissions
    try {
      NotificationSettings settings = await _fcm.requestPermission(
        alert: true,
        badge: true,
        sound: true,
        provisional: false,
      );
      
      debugPrint("User notification permission status: ${settings.authorizationStatus}");

      // Retrieve FCM Token
      String? token = await _fcm.getToken();
      if (token != null) {
        debugPrint("FCM Token: $token");
        await _saveAndSyncToken(token);
      }

      // Listen to Token Refreshes
      _fcm.onTokenRefresh.listen((newToken) {
        _saveAndSyncToken(newToken);
      });
    } catch (e) {
      debugPrint("Error requesting notification permissions/token: $e");
    }

    // 3. Foreground Message Listener
    FirebaseMessaging.onMessage.listen((RemoteMessage message) {
      debugPrint("Received Foreground Message: ${message.notification?.title}");
      _showLocalNotification(message);

      if (context != null && context.mounted && message.notification != null) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('🔔 ${message.notification?.title}: ${message.notification?.body}'),
            backgroundColor: const Color(0xFF059669),
            duration: const Duration(seconds: 4),
          ),
        );
      }
    });

    // 4. Background Notification Click Listener
    FirebaseMessaging.onMessageOpenedApp.listen((RemoteMessage message) {
      debugPrint("Notification clicked while app in background: ${message.data}");
      _handleNotificationClick(jsonEncode(message.data), context);
    });

    _isInitialized = true;
  }

  Future<void> _saveAndSyncToken(String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('fcm_token', token);

    final staffId = prefs.getInt('staff_id');
    if (staffId != null) {
      try {
        await http.put(
          Uri.parse("${getBaseUrl()}/staff/$staffId/fcm-token"),
          headers: {'Content-Type': 'application/json'},
          body: jsonEncode({'fcm_token': token}),
        );
        debugPrint("FCM Token synced to backend for staff $staffId");
      } catch (e) {
        debugPrint("Failed to sync FCM token: $e");
      }
    }
  }

  Future<void> _showLocalNotification(RemoteMessage message) async {
    final notification = message.notification;
    if (notification == null) return;

    const AndroidNotificationDetails androidDetails = AndroidNotificationDetails(
      'sankara_staff_channel',
      'Sankara Staff Alerts',
      channelDescription: 'Important notifications for Sankara staff members',
      importance: Importance.max,
      priority: Priority.high,
      icon: '@mipmap/ic_launcher',
    );

    const NotificationDetails details = NotificationDetails(
      android: androidDetails,
      iOS: DarwinNotificationDetails(presentAlert: true, presentBadge: true, presentSound: true),
    );

    await _localNotifications.show(
      id: notification.hashCode,
      title: notification.title,
      body: notification.body,
      notificationDetails: details,
      payload: jsonEncode(message.data),
    );
  }

  void _handleNotificationClick(String? payload, BuildContext? context) {
    if (payload == null || context == null) return;
    try {
      final data = jsonDecode(payload);
      if (data.containsKey('task_id')) {
        // Handle task click
        debugPrint("Navigate to task: ${data['task_id']}");
      } else if (data.containsKey('announcement_id')) {
        // Handle announcement click
        debugPrint("Navigate to announcement: ${data['announcement_id']}");
      }
    } catch (_) {}
  }
}
