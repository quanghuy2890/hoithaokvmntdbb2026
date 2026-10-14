<?php
session_start();
require_once __DIR__ . '/../config.php';
if (!empty($_SESSION['sports_admin'])) { header('Location: index.php'); exit; }
$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $user = (string)($_POST['username'] ?? '');
  $pass = (string)($_POST['password'] ?? '');
  if (hash_equals(ADMIN_USER, $user) && ADMIN_PASSWORD_HASH !== 'PASTE_PASSWORD_HASH_HERE' && password_verify($pass, ADMIN_PASSWORD_HASH)) {
    session_regenerate_id(true); $_SESSION['sports_admin'] = ADMIN_USER; header('Location: index.php'); exit;
  }
  $error = 'Thông tin đăng nhập không đúng hoặc chưa cấu hình mật khẩu quản trị.';
}
?><!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Đăng nhập quản trị · Hội thao Agribank 2026</title><style>
*{box-sizing:border-box}body{margin:0;background:#f1f6f3;font:16px Arial,sans-serif;color:#173b2d;min-height:100vh;display:grid;place-items:center;padding:20px}.card{width:min(430px,100%);background:white;border-radius:18px;padding:28px;box-shadow:0 12px 40px #063d2518;border-top:6px solid #087849}h1{margin:0 0 8px;color:#087849;font-size:25px}p{color:#60766b}label{display:block;font-weight:bold;margin:14px 0 6px}input{width:100%;padding:12px;border:1px solid #cad9d0;border-radius:9px;font-size:16px}button{margin-top:18px;width:100%;padding:12px;border:0;border-radius:9px;background:#087849;color:white;font-weight:bold;font-size:16px;cursor:pointer}.error{background:#fff0ee;color:#9c2424;padding:10px;border-radius:8px}.back{display:inline-block;margin-top:16px;color:#087849}</style></head><body><main class="card"><h1>Quản trị kết quả thi đấu</h1><p>Hội thao Agribank lần thứ X · Khu vực Miền núi và Trung du Bắc Bộ · 2026</p><?php if($error):?><div class="error"><?=htmlspecialchars($error,ENT_QUOTES,'UTF-8')?></div><?php endif?><form method="post"><label for="username">Tên đăng nhập</label><input id="username" name="username" autocomplete="username" required><label for="password">Mật khẩu</label><input id="password" name="password" type="password" autocomplete="current-password" required><button type="submit">Đăng nhập</button></form><a class="back" href="../index.html">← Về trang chủ</a></main></body></html>
