<?php
/**
 * Admin Login Page
 * Software Hub - PHP Version
 */

require_once __DIR__ . '/../includes/init.php';

// Redirect if already logged in
if (Auth::isLoggedIn()) {
    header('Location: dashboard.php');
    exit;
}
?>
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Anmelden - Software Hub Admin</title>
    <link rel="icon" type="image/png" sizes="32x32" href="../favicon-32.png">
    <link rel="icon" type="image/png" sizes="192x192" href="../favicon-192.png">
    <link rel="icon" type="image/svg+xml" href="../favicon.svg">
    <link rel="shortcut icon" href="../favicon.ico">
    <link rel="stylesheet" href="../assets/css/style.css">
    <link rel="stylesheet" href="../assets/css/admin.css">
</head>
<body data-page="login">
    <div class="login-container">
        <div class="login-card card">
            <div class="login-header">
                <div class="login-logo">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                        <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                        <line x1="12" y1="22.08" x2="12" y2="12"></line>
                    </svg>
                </div>
                <h1 class="login-title">Software Hub</h1>
                <p class="login-subtitle" data-t="auth.loginSubtitle">Melden Sie sich an, um fortzufahren</p>
            </div>
            <form id="loginForm" class="login-form">
                <div class="form-group">
                    <label class="form-label" for="email" data-t="auth.email">E-Mail</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        class="form-input"
                        placeholder="name@example.com"
                        required
                        autofocus
                    >
                </div>
                <div class="form-group">
                    <label class="form-label" for="password" data-t="auth.password">Passwort</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        class="form-input"
                        required
                    >
                </div>
                <div id="loginError" class="form-error hidden"></div>
                <button type="submit" class="btn btn-primary btn-block" id="loginBtn">
                    <span data-t="auth.login">Anmelden</span>
                    <svg class="btn-spinner hidden" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
                    </svg>
                </button>
            </form>
        </div>
        <div class="login-footer">
            <div class="language-switcher">
                <button data-lang="de" class="active">Deutsch</button>
                <button data-lang="en">English</button>
            </div>
        </div>
    </div>

    <script src="../assets/js/app.js?v=<?php echo filemtime(__DIR__ . '/../assets/js/app.js'); ?>"></script>
    <script src="../assets/js/admin.js?v=<?php echo filemtime(__DIR__ . '/../assets/js/admin.js'); ?>"></script>
    <script>
        // Initialize login page
        document.addEventListener('DOMContentLoaded', () => {
            initLoginPage();
        });
    </script>
</body>
</html>
