<?php
// Trả về danh sách ảnh trong các album để trang hình ảnh tự cập nhật
// khi người quản trị chỉ cần chép ảnh vào đúng thư mục.
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');

$albums = [
    'le-khai-mac' => 'Lễ khai mạc',
    'thi-dau' => 'Những màn tranh tài',
    'doan-ket' => 'Đoàn kết đồng đội',
    'co-dong' => 'Cổ động nhiệt tình',
    'trao-giai' => 'Vinh danh và trao giải',
    'khoanh-khac' => 'Khoảnh khắc đáng nhớ',
];

$album = isset($_GET['album']) ? (string)$_GET['album'] : '';
if (!isset($albums[$album])) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Album không hợp lệ'], JSON_UNESCAPED_UNICODE);
    exit;
}

$baseDir = dirname(__DIR__) . '/assets/gallery/' . $album;
$baseUrl = '../assets/gallery/' . rawurlencode($album) . '/';
// Hỗ trợ các định dạng ảnh phổ biến, bao gồm JFIF/JPE thường gặp từ điện thoại.
$allowed = ['jpg', 'jpeg', 'jpe', 'jfif', 'png', 'webp', 'gif'];
$images = [];

if (is_dir($baseDir)) {
    foreach (scandir($baseDir) as $name) {
        if ($name === '.' || $name === '..') continue;
        $path = $baseDir . '/' . $name;
        if (!is_file($path)) continue;
        $ext = strtolower(pathinfo($name, PATHINFO_EXTENSION));
        if (!in_array($ext, $allowed, true)) continue;
        $images[] = [
            'name' => $name,
            'url' => $baseUrl . rawurlencode($name),
            'mtime' => filemtime($path) ?: 0,
        ];
    }
}

usort($images, static function ($a, $b) {
    return strnatcasecmp($a['name'], $b['name']);
});

foreach ($images as &$image) {
    unset($image['mtime']);
}
unset($image);

echo json_encode([
    'ok' => true,
    'album' => $album,
    'title' => $albums[$album],
    'count' => count($images),
    'images' => $images,
], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
