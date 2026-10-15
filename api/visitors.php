<?php
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
session_start();
require_once __DIR__ . '/../config.php';
try {
  $pdo = new PDO('mysql:host='.DB_HOST.';dbname='.DB_NAME.';charset=utf8mb4', DB_USER, DB_PASS, [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
  ]);
  $pdo->exec("CREATE TABLE IF NOT EXISTS site_stats (
    stat_key VARCHAR(40) NOT NULL PRIMARY KEY,
    stat_value BIGINT UNSIGNED NOT NULL DEFAULT 0,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
  if (empty($_SESSION['hoi_thao_counted'])) {
    $stmt = $pdo->prepare("INSERT INTO site_stats (stat_key, stat_value) VALUES ('homepage_visits', 1)
      ON DUPLICATE KEY UPDATE stat_value = stat_value + 1");
    $stmt->execute();
    $_SESSION['hoi_thao_counted'] = true;
  }
  $stmt = $pdo->prepare("SELECT stat_value FROM site_stats WHERE stat_key = 'homepage_visits'");
  $stmt->execute();
  $row = $stmt->fetch();
  echo json_encode(['ok'=>true, 'count'=>(int)($row['stat_value'] ?? 0)], JSON_UNESCAPED_UNICODE);
} catch (Throwable $e) {
  http_response_code(503);
  echo json_encode(['ok'=>false], JSON_UNESCAPED_UNICODE);
}
