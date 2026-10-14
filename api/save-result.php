<?php
session_start();
header('Content-Type: application/json; charset=utf-8');
if (empty($_SESSION['sports_admin'])) { http_response_code(401); echo json_encode(['ok'=>false,'message'=>'Vui lòng đăng nhập quản trị.']); exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); echo json_encode(['ok'=>false,'message'=>'Method not allowed']); exit; }
require_once __DIR__ . '/../config.php';
$input = json_decode(file_get_contents('php://input'), true);
$key = trim((string)($input['fixture_key'] ?? ''));
$sport = trim((string)($input['sport'] ?? ''));
$score = trim((string)($input['score'] ?? ''));
$status = trim((string)($input['status'] ?? 'finished'));
$note = trim((string)($input['note'] ?? ''));
if (!preg_match('/^(football|volley|pickle)-[0-9]{1,4}$/', $key) || !in_array($sport, ['football','volley','pickle'], true) || !str_starts_with($key, $sport.'-')) {
  http_response_code(400); echo json_encode(['ok'=>false,'message'=>'Mã trận không hợp lệ.']); exit;
}
if (mb_strlen($score) > 80 || mb_strlen($note) > 255 || !in_array($status, ['pending','live','finished'], true)) {
  http_response_code(400); echo json_encode(['ok'=>false,'message'=>'Dữ liệu kết quả không hợp lệ.']); exit;
}
try {
  $pdo = new PDO('mysql:host='.DB_HOST.';dbname='.DB_NAME.';charset=utf8mb4', DB_USER, DB_PASS, [PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION]);
  if ($score === '' && $status === 'pending' && $note === '') {
    $stmt=$pdo->prepare('DELETE FROM match_results WHERE fixture_key=?'); $stmt->execute([$key]);
  } else {
    $stmt=$pdo->prepare('INSERT INTO match_results (fixture_key,sport,score,status,note,updated_by) VALUES (?,?,?,?,?,?) ON DUPLICATE KEY UPDATE sport=VALUES(sport),score=VALUES(score),status=VALUES(status),note=VALUES(note),updated_by=VALUES(updated_by)');
    $stmt->execute([$key,$sport,$score,$status,$note,ADMIN_USER]);
  }
  echo json_encode(['ok'=>true,'message'=>'Đã lưu kết quả.'], JSON_UNESCAPED_UNICODE);
} catch (Throwable $e) {
  http_response_code(503); echo json_encode(['ok'=>false,'message'=>'Không lưu được. Kiểm tra cấu hình cơ sở dữ liệu.'], JSON_UNESCAPED_UNICODE);
}
