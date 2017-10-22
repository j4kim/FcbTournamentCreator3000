<?php

$tournament = $_POST["tournament"];

if($tournament){
    $name = $tournament["name"];
    $filename = "$name.json";
    $counter = 0;
    while(file_exists("uploads/$filename")){
        $filename = "$name (" . ++$counter . ").json";
    }
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