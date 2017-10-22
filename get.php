<?php

$filename = $_GET['file'] ?? false;

if($filename){
    if(file_exists("uploads/$filename")){
        echo file_get_contents("uploads/$filename");
    }else{
        echo 'File "'.$filename.'" not found.';
        http_response_code(400); // bad request (not 404 because this script is found)
    }
    exit;
}

echo 'Get parameter "file" required.';
http_response_code(403); // forbidden
