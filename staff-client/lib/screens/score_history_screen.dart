import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'login_screen.dart'; // For getBaseUrl()

class ScoreHistoryScreen extends StatefulWidget {
  const ScoreHistoryScreen({Key? key}) : super(key: key);

  @override
  State<ScoreHistoryScreen> createState() => _ScoreHistoryScreenState();
}

class _ScoreHistoryScreenState extends State<ScoreHistoryScreen> {
  bool _isLoading = true;
  List<dynamic> _history = [];
  int _selectedYear = DateTime.now().year;
  
  final List<String> _months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  @override
  void initState() {
    super.initState();
    _fetchHistory();
  }

  Future<void> _fetchHistory() async {
    setState(() => _isLoading = true);
    final prefs = await SharedPreferences.getInstance();
    final staffId = prefs.getInt('staff_id');

    if (staffId == null) return;

    try {
      final res = await http.get(Uri.parse("${getBaseUrl()}/staff/$staffId/score_history"));
      if (res.statusCode == 200) {
        setState(() {
          _history = jsonDecode(res.body);
        });
      }
    } catch (e) {
      debugPrint("Error fetching history: $e");
    } finally {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    
    // Filter history by selected year
    final filteredHistory = _history.where((item) => item['year'] == _selectedYear).toList();
    // Sort descending by month
    filteredHistory.sort((a, b) => b['month'].compareTo(a['month']));

    // Extract unique years from history for the dropdown (and add current year)
    final Set<int> yearsSet = {_selectedYear};
    for (var item in _history) {
      yearsSet.add(item['year']);
    }
    final years = yearsSet.toList()..sort((a, b) => b.compareTo(a));

    return Scaffold(
      appBar: AppBar(
        title: const Text('Score History'),
        centerTitle: true,
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                children: [
                  // Filter
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        "Filter by Year:",
                        style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                      ),
                      DropdownButton<int>(
                        value: _selectedYear,
                        items: years.map((year) {
                          return DropdownMenuItem<int>(
                            value: year,
                            child: Text(year.toString()),
                          );
                        }).toList(),
                        onChanged: (val) {
                          if (val != null) {
                            setState(() => _selectedYear = val);
                          }
                        },
                      ),
                    ],
                  ),
                  const Divider(),
                  const SizedBox(height: 8),
                  
                  // List
                  Expanded(
                    child: filteredHistory.isEmpty
                        ? const Center(
                            child: Text(
                              "No score history for this year.",
                              style: TextStyle(color: Colors.grey, fontSize: 16),
                            ),
                          )
                        : ListView.builder(
                            itemCount: filteredHistory.length,
                            itemBuilder: (context, index) {
                              final item = filteredHistory[index];
                              final monthName = _months[item['month'] - 1];
                              return Card(
                                margin: const EdgeInsets.symmetric(vertical: 8),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(12),
                                  side: BorderSide(color: theme.colorScheme.primary.withValues(alpha: 0.2)),
                                ),
                                child: ListTile(
                                  leading: CircleAvatar(
                                    backgroundColor: theme.colorScheme.primary.withValues(alpha: 0.1),
                                    child: const Icon(Icons.star, color: Colors.amber),
                                  ),
                                  title: Text(
                                    "$monthName ${item['year']}",
                                    style: const TextStyle(fontWeight: FontWeight.bold),
                                  ),
                                  trailing: Text(
                                    "${item['score']} pts",
                                    style: TextStyle(
                                      fontSize: 18,
                                      fontWeight: FontWeight.bold,
                                      color: theme.colorScheme.primary,
                                    ),
                                  ),
                                ),
                              );
                            },
                          ),
                  ),
                ],
              ),
            ),
    );
  }
}
