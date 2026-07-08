import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'login_screen.dart'; // For getBaseUrl()

class ComplaintsScreen extends StatefulWidget {
  const ComplaintsScreen({Key? key}) : super(key: key);

  @override
  State<ComplaintsScreen> createState() => _ComplaintsScreenState();
}

class _ComplaintsScreenState extends State<ComplaintsScreen> {
  List<dynamic> _complaints = [];
  bool _isLoading = true;
  final _formKey = GlobalKey<FormState>();
  
  String _selectedType = 'absence';
  final _titleController = TextEditingController();
  final _descController = TextEditingController();
  bool _isSubmitting = false;

  @override
  void initState() {
    super.initState();
    _fetchComplaints();
  }

  @override
  void dispose() {
    _titleController.dispose();
    _descController.dispose();
    super.dispose();
  }

  Future<void> _fetchComplaints() async {
    final prefs = await SharedPreferences.getInstance();
    final staffId = prefs.getInt('staff_id');
    if (staffId == null) return;

    try {
      final res = await http.get(Uri.parse("${getBaseUrl()}/complaints/staff/$staffId"));
      if (res.statusCode == 200) {
        setState(() {
          _complaints = jsonDecode(res.body);
        });
      }
    } catch (e) {
      debugPrint("Error fetching complaints: $e");
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  Future<void> _submitComplaint() async {
    if (!_formKey.currentState!.validate()) return;

    final prefs = await SharedPreferences.getInstance();
    final staffId = prefs.getInt('staff_id');
    if (staffId == null) return;

    setState(() {
      _isSubmitting = true;
    });

    try {
      final res = await http.post(
        Uri.parse("${getBaseUrl()}/complaints/"),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'type': _selectedType,
          'title': _titleController.text.trim(),
          'description': _descController.text.trim(),
          'staff_id': staffId,
        }),
      );

      if (res.statusCode == 200 || res.statusCode == 201) {
        _titleController.clear();
        _descController.clear();
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Complaint logged successfully!'), backgroundColor: Colors.green),
          );
        }
        _fetchComplaints();
      } else {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Failed to submit complaint.'), backgroundColor: Colors.red),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Network error: $e'), backgroundColor: Colors.red),
        );
      }
    } finally {
      setState(() {
        _isSubmitting = false;
      });
    }
  }

  void _showAddComplaintBottomSheet() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: const Color(0xFF1E1E1E),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            return Padding(
              padding: EdgeInsets.only(
                bottom: MediaQuery.of(context).viewInsets.bottom + 24,
                top: 24,
                left: 24,
                right: 24,
              ),
              child: Form(
                key: _formKey,
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          'Log Excuse / Complaint',
                          style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.white),
                        ),
                        IconButton(
                          icon: const Icon(Icons.close, color: Colors.white70),
                          onPressed: () => Navigator.pop(context),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    DropdownButtonFormField<String>(
                      value: _selectedType,
                      dropdownColor: const Color(0xFF2A2A2A),
                      style: const TextStyle(color: Colors.white),
                      decoration: const InputDecoration(
                        labelText: 'Type',
                        labelStyle: TextStyle(color: Colors.white70),
                        enabledBorder: OutlineInputBorder(borderSide: BorderSide(color: Colors.white24)),
                        focusedBorder: OutlineInputBorder(borderSide: BorderSide(color: Colors.blueAccent)),
                      ),
                      items: const [
                        DropdownMenuItem(value: 'absence', child: Text('Absence')),
                        DropdownMenuItem(value: 'delay', child: Text('Delay')),
                        DropdownMenuItem(value: 'other', child: Text('Other Complaint')),
                      ],
                      onChanged: (val) {
                        if (val != null) {
                          setModalState(() {
                            _selectedType = val;
                          });
                        }
                      },
                    ),
                    const SizedBox(height: 16),
                    TextFormField(
                      controller: _titleController,
                      style: const TextStyle(color: Colors.white),
                      decoration: const InputDecoration(
                        labelText: 'Subject / Title',
                        labelStyle: TextStyle(color: Colors.white70),
                        enabledBorder: OutlineInputBorder(borderSide: BorderSide(color: Colors.white24)),
                        focusedBorder: OutlineInputBorder(borderSide: BorderSide(color: Colors.blueAccent)),
                      ),
                      validator: (val) => val == null || val.trim().isEmpty ? 'Please enter a subject' : null,
                    ),
                    const SizedBox(height: 16),
                    TextFormField(
                      controller: _descController,
                      maxLines: 4,
                      style: const TextStyle(color: Colors.white),
                      decoration: const InputDecoration(
                        labelText: 'Detailed Explanation',
                        labelStyle: TextStyle(color: Colors.white70),
                        enabledBorder: OutlineInputBorder(borderSide: BorderSide(color: Colors.white24)),
                        focusedBorder: OutlineInputBorder(borderSide: BorderSide(color: Colors.blueAccent)),
                      ),
                      validator: (val) => val == null || val.trim().isEmpty ? 'Please enter details' : null,
                    ),
                    const SizedBox(height: 24),
                    ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.blueAccent,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      onPressed: _isSubmitting
                          ? null
                          : () async {
                              await _submitComplaint();
                              if (mounted) Navigator.pop(context);
                            },
                      child: _isSubmitting
                          ? const CircularProgressIndicator(color: Colors.white)
                          : const Text('Submit Excuse', style: TextStyle(fontWeight: FontWeight.bold)),
                    ),
                  ],
                ),
              ),
            );
          },
        );
      },
    );
  }

  Color _getStatusColor(String status) {
    switch (status) {
      case 'approved_with_points':
        return Colors.green;
      case 'approved_without_points':
        return Colors.blue;
      case 'rejected':
        return Colors.red;
      default:
        return Colors.amber;
    }
  }

  String _getStatusLabel(String status) {
    switch (status) {
      case 'approved_with_points':
        return 'Approved (+Pts)';
      case 'approved_without_points':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      default:
        return 'Pending';
    }
  }

  IconData _getTypeIcon(String type) {
    switch (type) {
      case 'absence':
        return Icons.person_off;
      case 'delay':
        return Icons.access_time;
      default:
        return Icons.report_problem;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF121212),
      appBar: AppBar(
        title: const Text('My Excuses / Complaints', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
        backgroundColor: const Color(0xFF0D1A26),
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: Colors.blueAccent))
          : RefreshIndicator(
              onRefresh: _fetchComplaints,
              child: _complaints.isEmpty
                  ? const Center(
                      child: Text(
                        'No logged complaints yet.\nTap + to log an excuse.',
                        textAlign: TextAlign.center,
                        style: TextStyle(color: Colors.white54, fontSize: 16),
                      ),
                    )
                  : ListView.builder(
                      padding: const EdgeInsets.all(16),
                      itemCount: _complaints.length,
                      itemBuilder: (context, index) {
                        final c = _complaints[index];
                        final status = c['status'] ?? 'pending';
                        final type = c['type'] ?? 'other';
                        final title = c['title'] ?? '';
                        final desc = c['description'] ?? '';
                        final response = c['md_response'];
                        final pts = c['points_awarded'] ?? 0;
                        final dateStr = c['created_at'] != null
                            ? DateTime.parse(c['created_at']).toLocal().toString().substring(0, 16)
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
                                    Icon(_getTypeIcon(type), color: Colors.blueAccent, size: 24),
                                    const SizedBox(width: 8),
                                    Text(
                                      type.toUpperCase(),
                                      style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.blueAccent, fontSize: 12),
                                    ),
                                    const Spacer(),
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                      decoration: BoxDecoration(
                                        color: _getStatusColor(status).withValues(alpha: 0.2),
                                        borderRadius: BorderRadius.circular(8),
                                      ),
                                      child: Text(
                                        _getStatusLabel(status),
                                        style: TextStyle(
                                          color: _getStatusColor(status),
                                          fontSize: 12,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 12),
                                Text(
                                  title,
                                  style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white),
                                ),
                                const SizedBox(height: 6),
                                Text(
                                  desc,
                                  style: const TextStyle(color: Colors.white70, fontSize: 14),
                                ),
                                const SizedBox(height: 12),
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Text(
                                      dateStr,
                                      style: const TextStyle(color: Colors.white30, fontSize: 12),
                                    ),
                                    if (pts > 0)
                                      Row(
                                        children: [
                                          const Icon(Icons.star, color: Colors.amber, size: 16),
                                          const SizedBox(width: 4),
                                          Text(
                                            '+$pts Pts',
                                            style: const TextStyle(color: Colors.amber, fontWeight: FontWeight.bold, fontSize: 14),
                                          ),
                                        ],
                                      ),
                                  ],
                                ),
                                if (response != null && response.toString().trim().isNotEmpty) ...[
                                  const Divider(color: Colors.white10, height: 24),
                                  Container(
                                    padding: const EdgeInsets.all(12),
                                    width: double.infinity,
                                    decoration: BoxDecoration(
                                      color: Colors.white.withValues(alpha: 0.03),
                                      borderRadius: BorderRadius.circular(8),
                                      border: Border.all(color: Colors.white10),
                                    ),
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        const Text(
                                          'MD Response:',
                                          style: TextStyle(fontWeight: FontWeight.bold, color: Colors.amber, fontSize: 12),
                                        ),
                                        const SizedBox(height: 4),
                                        Text(
                                          response,
                                          style: const TextStyle(color: Colors.white70, fontSize: 13),
                                        ),
                                      ],
                                    ),
                                  ),
                                ],
                              ],
                            ),
                          ),
                        );
                      },
                    ),
            ),
      floatingActionButton: FloatingActionButton(
        backgroundColor: Colors.blueAccent,
        foregroundColor: Colors.white,
        onPressed: _showAddComplaintBottomSheet,
        child: const Icon(Icons.add),
      ),
    );
  }
}
