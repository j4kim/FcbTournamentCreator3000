<?php

if(isset($_FILES["file"])){
    $target_file =  time() . "_" . basename($_FILES["file"]["name"]);
    if (move_uploaded_file($_FILES["file"]["tmp_name"], "uploads/$target_file")) {
        header("Location: ?file=$target_file");
        exit("C'est bon");
    }
    else{
        exit("Erreur lors de la mise en ligne du fichier");
    }
}