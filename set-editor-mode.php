<?php

$pwd = [
    'editor' => file_get_contents("pwd.editor"),
    'admin' => file_get_contents("pwd.admin"),
];

if ($pwd['admin'] === hash('sha256', $_POST["pwd"])) {
    setcookie("is_admin", "1", time()+60*60*24*1);
    setcookie("is_editor", "1", time()+60*60*24*5);
    header("Content-Type: application/json");
    echo '["admin", "editor"]';
} else if ($pwd['editor'] === hash('sha256', $_POST["pwd"])) {
    setcookie("is_editor", "1", time()+60*60*24*5);
    header("Content-Type: application/json");
    echo '["editor"]';
} else {
    setcookie("is_editor", "", time()-3600);
    setcookie("is_admin", "", time()-3600);
    echo "Mauvais mot de passe";
    http_response_code(403);
}
