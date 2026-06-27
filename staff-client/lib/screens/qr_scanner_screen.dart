import 'dart:convert';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'dart:io' show Platform;
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:device_info_plus/device_info_plus.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import 'package:geolocator/geolocator.dart';
import 'login_screen.dart'; // For getBaseUrl()

Future<String> getDeviceUuid() async {
  final prefs = await SharedPreferences.getInstance();
  String? uuid = prefs.getString('local_device_uuid');
  if (uuid == null) {
    uuid = "device_" + DateTime.now().millisecondsSinceEpoch.toString() + "_" + (1000 + (DateTime.now().microsecond % 9000)).toString();
    await prefs.setString('local_device_uuid', uuid);
  }
  return uuid;
}

class QRScannerScreen extends StatefulWidget {
  const QRScannerScreen({Key? key}) : super(key: key);

  @override
  State<QRScannerScreen> createState() => _QRScannerScreenState();
}

class _QRScannerScreenState extends State<QRScannerScreen> {
  bool _isSubmitting = false;
  final MobileScannerController controller = MobileScannerController(
    detectionSpeed: DetectionSpeed.noDuplicates,
  );
  bool _isDialogVisible = false;

  @override
  void dispose() {
    controller.dispose();
    super.dispose();
  }

  Future<void> _handleScan(String? scannedData) async {
    if (scannedData == null || _isDialogVisible || _isSubmitting) {
      return;
    }

    setState(() {
      _isDialogVisible = true;
      _isSubmitting = true;
    });
    
    // Stop scanning while processing
    controller.stop();

    try {
      final data = jsonDecode(scannedData);
      final workplace = data['workplace'] ?? 'Unknown Workplace';
      
      // Check current attendance status for dynamic buttons
      bool hasClockedInToday = false;
      final prefs = await SharedPreferences.getInstance();
      final staffId = prefs.getInt('staff_id');
      
      if (staffId != null) {
        try {
          final res = await http.get(Uri.parse("${getBaseUrl()}/attendance/$staffId"));
          if (res.statusCode == 200) {
             final List<dynamic> logs = jsonDecode(res.body);
             final todayStr = DateTime.now().toIso8601String().substring(0, 10);
             for (var log in logs) {
               if (log['date'] == todayStr && log['clock_in_time'] != null && log['clock_out_time'] == null) {
                 hasClockedInToday = true;
                 break;
               }
             }
          }
        } catch (_) {} // Ignore network errors, fallback to showing both/default
      }
      
      if (mounted) {
        setState(() {
          _isSubmitting = false;
        });
      }
      
      // Show confirmation dialog
      _showActionDialog(workplace, hasClockedInToday);
      
    } catch (e) {
      // Not a valid JSON payload for Sankara ID
      if (mounted) {
        setState(() {
          _isSubmitting = false;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Invalid QR Code. Please scan a Sankara Attendance Poster.'),
            backgroundColor: Colors.red,
          ),
        );
      }
      
      // Resume scanning after failure
      setState(() {
        _isDialogVisible = false;
      });
      controller.start();
    }
  }

  void _showActionDialog(String workplace, bool hasClockedInToday) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) {
        return AlertDialog(
          title: const Text('Scan Successful'),
          content: Text('Location: $workplace\n\nWhat would you like to do?'),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.pop(context);
                setState(() {
                  _isDialogVisible = false;
                });
                controller.start();
              },
              child: const Text('Cancel', style: TextStyle(color: Colors.grey)),
            ),
            if (!hasClockedInToday)
              ElevatedButton.icon(
                onPressed: () {
                  Navigator.pop(context);
                  _submitAttendance('clock_in');
                },
                icon: const Icon(Icons.login),
                label: const Text('Clock In'),
                style: ElevatedButton.styleFrom(backgroundColor: Colors.green, foregroundColor: Colors.white),
              ),
            if (hasClockedInToday)
              ElevatedButton.icon(
                onPressed: () {
                  Navigator.pop(context);
                  _submitAttendance('clock_out');
                },
                icon: const Icon(Icons.logout),
                label: const Text('Clock Out'),
                style: ElevatedButton.styleFrom(backgroundColor: Colors.orange, foregroundColor: Colors.white),
              ),
          ],
        );
      },
    );
  }

  Future<void> _submitAttendance(String action) async {
    setState(() {
      _isSubmitting = true;
    });

    final prefs = await SharedPreferences.getInstance();
    final staffId = prefs.getInt('staff_id');

    if (staffId == null) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('User session not found. Please log in again.')),
        );
      }
      return;
    }

    final deviceUuid = await getDeviceUuid();

    // Silently attempt to get location
    Position? position;
    try {
      bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (serviceEnabled) {
        LocationPermission permission = await Geolocator.checkPermission();
        if (permission == LocationPermission.denied) {
          permission = await Geolocator.requestPermission();
        }
        if (permission == LocationPermission.whileInUse || permission == LocationPermission.always) {
          position = await Geolocator.getCurrentPosition(desiredAccuracy: LocationAccuracy.high);
        }
      }
    } catch (_) {
      // Proceed without location if it fails
    }

    try {
      final res = await http.post(
        Uri.parse("${getBaseUrl()}/attendance/"),
        headers: {"Content-Type": "application/json"},
        body: jsonEncode({
          "staff_id": staffId,
          "action": action,
          "device_uuid": deviceUuid,
          "latitude": position?.latitude,
          "longitude": position?.longitude,
        }),
      );

      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        final isProxy = data['is_proxy'] ?? false;
        final warningMsg = data['warning'];
        
        String message = action == 'clock_in' ? 'Successfully Clocked In!' : 'Successfully Clocked Out!';
        if (isProxy) {
          message += " (Warning: Proxy Flagged)";
        }
        if (warningMsg != null) {
          message = warningMsg;
        }

        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(message),
              backgroundColor: isProxy ? Colors.orange : (warningMsg != null ? Colors.blueAccent : Colors.green),
              duration: const Duration(seconds: 4),
            ),
          );
          Navigator.pop(context); // Go back to home screen
        }
      } else {
        final err = jsonDecode(res.body)['detail'] ?? 'Failed to submit attendance';
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(err), backgroundColor: Colors.red),
          );
          setState(() {
            _isDialogVisible = false;
          });
          controller.start();
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e')),
        );
        setState(() {
          _isDialogVisible = false;
        });
        controller.start();
      }
    } finally {
      if (mounted) {
        setState(() {
          _isSubmitting = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Scan QR Code'),
        centerTitle: true,
      ),
      body: Stack(
        children: [
          // The QR Camera View
          MobileScanner(
            controller: controller,
            onDetect: (capture) {
              final List<Barcode> barcodes = capture.barcodes;
              for (final barcode in barcodes) {
                if (barcode.rawValue != null) {
                  _handleScan(barcode.rawValue);
                  break; // Only process the first barcode
                }
              }
            },
          ),
          
          // Custom Overlay Shape
          Center(
            child: Container(
              width: MediaQuery.of(context).size.width * 0.8,
              height: MediaQuery.of(context).size.width * 0.8,
              decoration: BoxDecoration(
                border: Border.all(color: const Color(0xFF6366F1), width: 4),
                borderRadius: BorderRadius.circular(16),
              ),
            ),
          ),
          
          // Overlay UI elements
          if (_isSubmitting)
            Container(
              color: Colors.black54,
              child: const Center(
                child: CircularProgressIndicator(),
              ),
            ),
            
          Positioned(
            bottom: 40,
            left: 0,
            right: 0,
            child: Column(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  decoration: BoxDecoration(
                    color: Colors.black54,
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: const Text(
                    'Point your camera at the workplace QR code',
                    style: TextStyle(color: Colors.white, fontSize: 14),
                    textAlign: TextAlign.center,
                  ),
                ),
                const SizedBox(height: 24),
                // Fallback manual simulation button for emulators
                OutlinedButton.icon(
                  onPressed: () {
                    if (_isDialogVisible || _isSubmitting) return;
                    _handleScan('{"workplace":"Sankara Head Office (Simulated)","device_uuid_required":true}');
                  },
                  icon: const Icon(Icons.bug_report, color: Colors.white),
                  label: const Text('Simulate Scan (Emulator)', style: TextStyle(color: Colors.white)),
                  style: OutlinedButton.styleFrom(
                    side: const BorderSide(color: Colors.white54),
                    backgroundColor: Colors.black54,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
