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

    $filename = $_GET['file'] ?? false;

    if($filename){
        $config = file_get_contents("uploads/$filename");
    }
?>
<!DOCTYPE html>
<html>
<head>
	<meta charset="UTF-8">
	<title>FCB Tournament Creator 3000</title>
	<meta name="viewport" content="width=device-width, initial-scale=1">

    <!--CSS-->
    <!--Font Awesome-->
    <link rel="stylesheet" href="lib/font-awesome-4.7.0/css/font-awesome.min.css">
    <!--Bootstrap-->
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-beta.2/css/bootstrap.min.css" integrity="sha384-PsH8R72JQ3SOdhVi3uxftmaW6Vc51MKb0q5P2rRUpPvrszuE4W1povHYgTpBfshb" crossorigin="anonymous">

    <!--JS-->
    <!--jQuery-->
    <script src="https://code.jquery.com/jquery-3.2.1.slim.min.js" integrity="sha384-KJ3o2DKtIkvYIK3UENzmM7KCkRr/rE9/Qpg6aAZGJwFDMVNA/GpGFF93hXpG5KkN" crossorigin="anonymous"></script>
    <!-- Bootstrap -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.12.3/umd/popper.min.js" integrity="sha384-vFJXuSJphROIrBnz7yo7oB41mKfc8JzQZiCq4NCceLEaO4IHwicKwpJf9c9IpFgh" crossorigin="anonymous"></script>
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-beta.2/js/bootstrap.min.js" integrity="sha384-alpBpkh1PFOepccYVYDB4do5UnbKysX5WZXm3XxPqe5iKTfUKjNkCk9SaVuEZflJ" crossorigin="anonymous"></script>
    <!--Handlebars-->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/handlebars.js/4.0.11/handlebars.min.js"></script>

</head>
<body>
	<div class="container">
        <h1>FCB Tournament Creator 3000</h1>

        <form method="POST" id="uploadForm" enctype="multipart/form-data">
            <input accept=".json" type="file" name="file"
                   id="file" class="d-none"
                   onchange="document.querySelector('#uploadForm').submit()"/>
        </form>
        <label for="file" class="btn float-right">
            <i class="fa fa-upload"></i> Charger tournoi
        </label>

		<div id="configuration"
             data-config="<?= isset($config) ? htmlentities($config) : "" ?>"
        >

			<h2>Configuration du tournoi</h2>
			<form id="configForm">
                <hr>

                <div class="form-group row">
                    <label for="name" class="col-md-3 col-form-label">Nom</label>
                    <div class="col">
                        <input type="text" class="form-control" id="name">
                    </div>
                </div>

                <hr>

                <div class="form-group row">
                    <label for="start" class="col-md-3 col-form-label">Heure de début </label>
                    <div class="col">
                        <input type="time" class="form-control" id="start" value="08:00">
                    </div>
                </div>

                <div class="form-group row">
                    <label class="col-md-3 col-form-label" >Pauses</label>


                    <div class="col-md-9 row pr-0">
                        <div class="pauses-container col-md-12 d-none pr-0">
                            <!--Pauses here-->
                        </div>

                        <div class="col-md-12 pr-0">
                            <button type="button"  class="btn btn-light btn-block" id="addPause">
                                <i class="fa fa-plus-circle"></i> Ajouter pause
                            </button>
                        </div>

                    </div>
                </div>
				
				<hr>
				
				<div class="form-group row">
					<label class="control-label col-sm-3" for="fields">Terrains</label>
					<div class="col-sm-9">
                        <textarea rows="4" class="form-control" id="fields"></textarea>
					</div>
                    <small class="form-text text-muted col-md-9 offset-md-3">
                        Pour les entrées texte, séparez les éléments par des sauts de ligne.
                    </small>
				</div>
				
				<hr>

                <h3>Catégories</h3>

                <button type="button" class="btn btn-light btn-block" id="addCategory">
                    <i class="fa fa-plus-circle"></i> Ajouter catégorie
                </button>


                <hr>

                <a href="#" download="config.json" id="saveConfig" class="btn btn-secondary btn-block">
                    <i class="fa  fa-download"></i> Enregistrer la configuration
                </a>

                <button type="button" id="generateProgram" class="btn btn-primary btn-block">
                    <i class="fa fa-check"></i> Générer le programme des matchs
                </button>

				
			</form>
		
		</div>
		<hr>
		<div id="programme">
		</div>
		
		<!-- Modal -->
		<div id="myModal" class="modal" role="dialog">
		  <div class="modal-dialog">

			<!-- Modal content-->
			<div class="modal-content">
			  <div class="modal-body">
				<p id="texteModal"></p>
			  </div>
			  <div class="modal-footer">
				<button type="button" class="btn btn-default" data-dismiss="modal">Fermer</button>
			  </div>
			</div>

		  </div>
		</div>

	</div>


    <!--Templates handlebars-->
    <!--Pause template-->
    <script id="pause-template" type="text/x-handlebars-template">
        <div class="row pause mb-2">
            <div class="col col-form-label">
                Début&nbsp;:
            </div>
            <div class="col">
                <input type="time" class="form-control pauseStart" value="{{ start }}">
            </div>
            <div class="col col-form-label">
                Durée&nbsp;:
            </div>
            <div class="col">
                <input type="time" class="form-control pauseDuration" value="{{ duration }}">
            </div>
            <div class="col">
                <button type="button" class="form-control btn-light col-form-label removePause">
                    <i class="fa fa-trash-o"></i>
                </button>
            </div>
        </div>
    </script>

    <!--Category template-->
    <script id="category-template" type="text/x-handlebars-template">
        <div class="border p-3 mb-2 category">
            <div class="form-group row">
                <label class="col-md-3 col-form-label">Nom</label>
                <div class="col-md-9">
                    <input type="text" class="form-control categoryName" value="{{ name }}">
                </div>
            </div>
            <div class="form-group row">
                <label class="col-md-3 col-form-label">Équipes</label>
                <div class="col-sm">
                    <textarea rows="4" class="form-control categoryTeams">{{ teams }}</textarea>
                </div>
                <small class="form-text text-muted col-md-9 offset-md-3">
                    Pour les entrées texte, séparez les éléments par des sauts de ligne.
                </small>
            </div>

            <hr>
            <!--<h4>Phase de groupe</h4>-->

            <div class="form-group row">
                <label class="col-md-3 col-form-label">Phase de groupes</label>

                <div class="form-row col">
                    <div class="form-group col">
                        <label>Nombre de groupes</label>
                        <input type="number" class="form-control qualifGroups" value="{{ qualif.groups }}">
                    </div>
                    <div class="form-group col">
                        <label>Nombre de tours</label>
                        <input type="number" class="form-control qualifRounds" value="{{ qualif.rounds }}">
                    </div>
                    <div class="form-group col">
                        <label>Durée d'un match</label>
                        <input type="time" class="form-control qualifMatchDuration" value="{{ qualif.matchDuration }}" min="00:05">
                    </div>
                </div>
            </div>

            <hr>

            <div class="form-group row">
                <label class="col-md-3 col-form-label">Pause entre phases</label>

                <div class="col">
                    <input type="time" class="form-control pauseBetween" value="{{ knockout.pauseBetween }}">
                </div>
            </div>

            <hr>
            <!--<h4>Phase finale</h4>-->

            <div class="form-group row">
                <label class="col-md-3 col-form-label">Phase finale</label>

                <div class="form-row col">
                    <div class="form-group col">
                        <label>Équipes qualifiées</label>
                        <input type="number" class="form-control qualified" value="{{ knockout.qualified }}">
                    </div>
                    <div class="form-group col">
                        <label>Durée de la finale</label>
                        <input type="time" class="form-control finalDuration" value="{{ knockout.finalDuration }}" min="00:05">
                    </div>
                </div>
            </div>

            <button type="button" class="btn btn-light removeCategory">
                <i class="fa fa-trash-o"></i>
            </button>
        </div>
    </script>

    <!-- Application -->
    <script src="form.js"></script>

</body>
</html>