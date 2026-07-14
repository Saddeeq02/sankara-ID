<?php
try {
    $dsn = "pgsql:host=aws-0-eu-central-1.pooler.supabase.com;port=6543;dbname=postgres";
    $pdo = new PDO($dsn, "postgres.mfbljuhpnkmeckmtxlkn", "Sankara'website1");
    echo "Connected successfully to Supabase!\n";
    
    // Check tables
    $tables = ['gallery_items', 'activities', 'users', 'products'];
    foreach ($tables as $table) {
        try {
            $stmt = $pdo->query("SELECT COUNT(*) FROM $table");
            $count = $stmt->fetchColumn();
            echo "Table '$table' exists. Row count: $count\n";
        } catch (PDOException $e) {
            echo "Table '$table' does NOT exist. Error: " . $e->getMessage() . "\n";
        }
    }
} catch (PDOException $e) {
    echo "Connection failed: " . $e->getMessage() . "\n";
}
