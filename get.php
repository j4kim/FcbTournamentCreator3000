<?php

session_start();

$filename = $_GET['file'] ?? false;

if($filename){
    if(file_exists("uploads/$filename")){
        header("Content-Type: application/json");
        $config = file_get_contents("uploads/$filename");
        echo json_encode([
            'config' => json_decode($config),
            'role' => $_SESSION['role'],
        ]);
    }else{
        echo 'File "'.$filename.'" not found.';
        http_response_code(400); // bad request (not 404 because this script is found)
    }
    exit;
}

echo 'Get parameter "file" required.';
http_response_code(403); // forbidden
