<?php
$secure = !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off';
session_name('AGRIBANK_ADMIN');
session_set_cookie_params(['lifetime'=>0,'path'=>'/','secure'=>$secure,'httponly'=>true,'samesite'=>'Lax']);
session_start();
header('Content-Type: application/json; charset=utf-8');
if (empty($_SESSION['sports_admin'])) { http_response_code(401); echo json_encode(['ok'=>false,'message'=>'Vui lòng đăng nhập quản trị.']); exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); echo json_encode(['ok'=>false,'message'=>'Method not allowed']); exit; }
require_once __DIR__ . '/../config.php';
$input = json_decode(file_get_contents('php://input'), true);
$key = trim((string)($input['fixture_key'] ?? ''));
$sport = trim((string)($input['sport'] ?? ''));
$score = trim((string)($input['score'] ?? ''));
$status = trim((string)($input['status'] ?? 'pending'));
$note = trim((string)($input['note'] ?? ''));
$teams = trim((string)($input['teams_override'] ?? ''));
if (!preg_match('/^(football|volley|pickle)-[0-9]{1,4}$/', $key) || !in_array($sport, ['football','volley','pickle'], true) || !str_starts_with($key, $sport.'-')) {
  http_response_code(400); echo json_encode(['ok'=>false,'message'=>'Mã trận không hợp lệ.']); exit;
}
if (mb_strlen($score) > 80 || mb_strlen($note) > 255 || mb_strlen($teams) > 255 || !in_array($status, ['pending','live','finished'], true)) {
  http_response_code(400); echo json_encode(['ok'=>false,'message'=>'Dữ liệu kết quả không hợp lệ.']); exit;
}
try {
  $pdo = new PDO('mysql:host='.DB_HOST.';dbname='.DB_NAME.';charset=utf8mb4', DB_USER, DB_PASS, [PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION]);
  // Tự bổ sung cột tên đội thay thế để không phải sửa database thủ công.
  $col = $pdo->query("SHOW COLUMNS FROM match_results LIKE 'teams_override'")->fetch();
  if (!$col) $pdo->exec("ALTER TABLE match_results ADD COLUMN teams_override VARCHAR(255) NOT NULL DEFAULT '' AFTER score");
  if ($score === '' && $status === 'pending' && $note === '' && $teams === '') {
    $stmt=$pdo->prepare('DELETE FROM match_results WHERE fixture_key=?'); $stmt->execute([$key]);
  } else {
    $stmt=$pdo->prepare('INSERT INTO match_results (fixture_key,sport,score,status,teams_override,note,updated_by) VALUES (?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE sport=VALUES(sport),score=VALUES(score),status=VALUES(status),teams_override=VALUES(teams_override),note=VALUES(note),updated_by=VALUES(updated_by)');
    $stmt->execute([$key,$sport,$score,$status,$teams,$note,ADMIN_USER]);
  }
  echo json_encode(['ok'=>true,'message'=>'Đã lưu thông tin trận và kết quả.'], JSON_UNESCAPED_UNICODE);
} catch (Throwable $e) {
  http_response_code(503); echo json_encode(['ok'=>false,'message'=>'Không lưu được. Kiểm tra cấu hình cơ sở dữ liệu và quyền ALTER/INSERT.'], JSON_UNESCAPED_UNICODE);
}
