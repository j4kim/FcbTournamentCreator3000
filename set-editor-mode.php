<?php

session_start();

$hashes = [
    'editor' => file_get_contents("pwd.editor"),
    'admin' => file_get_contents("pwd.admin"),
];

$pwd = $_POST["pwd"];

$role = "";

if (password_verify($pwd, $hashes['admin'])) {
    $role = 'admin';
} else if (password_verify($pwd, $hashes['editor'])) {
    $role = 'editor';
} else {
    echo "Mauvais mot de passe";
    http_response_code(403);
}

$_SESSION['role'] = $role;

echo $role;
