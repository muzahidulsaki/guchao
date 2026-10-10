<?php

header('Content-Type: text/html; charset=utf-8');

$botDir = dirname(__DIR__) . '/whatsapp-bot';
$stderrLog = $botDir . '/stderr.log';
$botErrorLog = $botDir . '/bot-error.log';
$nodeModulesDir = $botDir . '/node_modules';

echo "<h2>HeiSeenBug WhatsApp Bot Diagnostic (cPanel)</h2>";

echo "<ul>";
echo "<li><strong>Bot Directory:</strong> " . (is_dir($botDir) ? "<span style='color:green;'>Found ($botDir)</span>" : "<span style='color:red;'>Not Found!</span>") . "</li>";
echo "<li><strong>node_modules:</strong> " . (is_dir($nodeModulesDir) ? "<span style='color:green;'>Installed</span>" : "<span style='color:red;'>MISSING! (You need to run NPM install)</span>") . "</li>";
echo "<li><strong>server.js:</strong> " . (file_exists($botDir . '/server.js') ? "<span style='color:green;'>Exists</span>" : "<span style='color:red;'>Missing</span>") . "</li>";
echo "<li><strong>loader.cjs:</strong> " . (file_exists($botDir . '/loader.cjs') ? "<span style='color:green;'>Exists (Use this as Startup File!)</span>" : "<span style='color:red;'>Missing</span>") . "</li>";
echo "</ul>";

if (file_exists($botErrorLog)) {
    echo "<h3>bot-error.log:</h3><pre style='background:#f4f4f4;padding:10px;border:1px solid #ccc;'>" . htmlspecialchars(file_get_contents($botErrorLog)) . "</pre>";
}

if (file_exists($stderrLog)) {
    echo "<h3>stderr.log (Passenger Error Log):</h3><pre style='background:#fff0f0;padding:10px;border:1px solid #ffcccc;'>" . htmlspecialchars(file_get_contents($stderrLog)) . "</pre>";
}

// Check other passenger logs
$parentDir = dirname(__DIR__);
foreach (glob($parentDir . '/*.log') as $log) {
    echo "<h3>" . basename($log) . ":</h3><pre style='background:#f9f9f9;padding:10px;'>" . htmlspecialchars(file_get_contents($log)) . "</pre>";
}

echo "<hr>";
echo "<p>If node_modules is MISSING, click <strong>Run NPM Install</strong> inside cPanel &gt; Setup Node.js App.</p>";
