<?php

$filename = $_GET['file'] ?? false;

if($filename){
    $config = file_get_contents("uploads/$filename");
}