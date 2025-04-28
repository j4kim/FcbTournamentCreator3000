<?php

$pwd = file_get_contents("hashed-pwd.txt");

if ($pwd === hash('sha256', $_POST["pwd"])) {
    setcookie("is_editor", "1", time()+60*60*24*365);
} else {
    setcookie("is_editor", "", time()-3600);
    echo "Mauvais mot de passe";
    http_response_code(403);
}
