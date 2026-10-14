<?php
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
require_once __DIR__ . '/../config.php';
try {
  $pdo = new PDO('mysql:host='.DB_HOST.';dbname='.DB_NAME.';charset=utf8mb4', DB_USER, DB_PASS, [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
  ]);
  $rows = $pdo->query('SELECT fixture_key, sport, score, status, note, updated_at FROM match_results')->fetchAll();
  $out = [];
  foreach ($rows as $row) $out[$row['fixture_key']] = $row;
  echo json_encode(['ok'=>true, 'results'=>$out], JSON_UNESCAPED_UNICODE);
} catch (Throwable $e) {
  http_response_code(503);
  echo json_encode(['ok'=>false, 'message'=>'Chưa kết nối được cơ sở dữ liệu kết quả.'], JSON_UNESCAPED_UNICODE);
}
