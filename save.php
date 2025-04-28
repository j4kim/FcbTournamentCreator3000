<?php

session_start();

$role = $_SESSION['role'] ?? '';

if (in_array($role, ['editor', 'admin'])) {
    echo "Not editor";
    http_response_code(403); // forbidden
    exit;
}

$tournament = json_decode($_POST["tournament"]);

if($tournament){
    $name = $tournament->name;
    $filename = "$name.json";
    if(file_put_contents("uploads/$filename", json_encode($tournament, JSON_PRETTY_PRINT))){
        echo $filename;
        exit;
    }
    echo "Unable to store file $filename";
    http_response_code(500); // Internal Server Error
    exit;
}

echo 'No tournament parameter provided';
http_response_code(403); // forbidden