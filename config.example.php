<?php
// Copy this file to config.php, then fill in database details from cPanel.
// Never upload real passwords to a public Git repository.
define('DB_HOST', 'localhost');
define('DB_NAME', 'CPANEL_DATABASE_NAME');
define('DB_USER', 'CPANEL_DATABASE_USER');
define('DB_PASS', 'CHANGE_DATABASE_PASSWORD');
define('ADMIN_USER', 'admin');
// Generate a hash locally with: echo password_hash('your-strong-password', PASSWORD_DEFAULT);
define('ADMIN_PASSWORD_HASH', 'PASTE_PASSWORD_HASH_HERE');
