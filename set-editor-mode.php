<?php

session_start();

$pwd = [
    'editor' => file_get_contents("pwd.editor"),
    'admin' => file_get_contents("pwd.admin"),
];

$role = "";

if ($pwd['admin'] === hash('sha256', $_POST["pwd"])) {
    $role = 'admin';
} else if ($pwd['editor'] === hash('sha256', $_POST["pwd"])) {
    $role = 'editor';
} else {
    echo "Mauvais mot de passe";
    http_response_code(403);
}

$_SESSION['role'] = $role;

echo $role;
