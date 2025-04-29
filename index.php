<?php
session_start();

$role = $_SESSION['role'];

$file = $_GET['file'];
?>
<!DOCTYPE html>
<html>
<head>
	<meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />

	<title>FCB Tournament Creator 3000</title>

    <link rel="icon" href="favicon.ico" />

    <!--CSS-->
    <!--Font Awesome-->
    <link rel="stylesheet" href="lib/font-awesome-4.7.0/css/font-awesome.min.css">
    <!--Bootstrap-->
    <link rel="stylesheet" href="lib/bootstrap/bootstrap.min.css">
    <!-- Quill -->
    <link rel="stylesheet" href="lib/quill.snow.css">
    <!--App-->
    <link rel="stylesheet" href="styles.css?2024">

    <!--JS-->
    <!--jQuery-->
    <script src="lib/jquery-3.7.1.min.js"></script>
    <!--Bootstrap + Popper-->
    <script src="lib/bootstrap/bootstrap.bundle.min.js"></script>
    <!--Handlebars-->
    <script src="lib/handlebars.min.js"></script>
    <!--Shuffle-array-->
    <script src="lib/shuffle.js"></script>
    <!-- Stanford Javascript Crypto Library -->
    <script src="lib/sjcl.js"></script>
    <!-- Quill -->
    <script src="lib/quill.js"></script>

</head>
<body class="<?= $role ?>" data-file="<?= $file ?>">
    <div class="container py-4">
        <div class="clearfix admin-only">
            <h1 class="float-left">
                <a href="">FCB Tournament Creator 3000</a>
            </h1>

            <input accept=".json" type="file" name="file"
                   id="file" class="d-none" />

            <label for="file" class="btn float-right btn-dark ml-3 mt-2">
                <i class="fa fa-upload"></i> Charger un tournoi
            </label>

        </div>

        <h1 class="display-4 py-4" id="title"></h1>

		<div id="configuration" class="admin-only">
            <a href="" id="showSchedule" class="d-none">Voir programme</a>
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
                    <label for="matchDuration" class="col-md-3 col-form-label">Durée d'un match </label>
                    <div class="col">
                        <input type="time" class="form-control" id="matchDuration" value="00:15">
                    </div>
                </div>

                <div class="form-group row">
                    <label class="col-md-3 col-form-label" >Pauses</label>

                    <div class="col-md-9 row pr-0">
                        <div class="pauses-container col-md-12 d-none pr-0">
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
                        </div>

                        <div class="col-md-12 pr-0">
                            <button type="button"  class="btn btn-light btn-block" id="addPause">
                                <i class="fa fa-plus-circle"></i> Ajouter pause
                            </button>
                        </div>

                    </div>
                </div>


                <div class="form-group row">
                    <label class="col-md-3 col-form-label">Pause entre phases</label>

                    <div class="col">
                        <input type="time" class="form-control" id="pauseBetween" value="00:00">
                    </div>
                </div>
				
				<hr>
				
				<div class="form-group row">
					<label class="control-label col-sm-3" for="fields">Terrains</label>
					<div class="col-sm-9">
                        <textarea rows="4" class="form-control" id="fields"></textarea>
					</div>
                    <small class="form-text text-muted col-md-9 offset-md-3">
                        Séparez les éléments par des sauts de ligne.
                    </small>
				</div>
				
				<hr>

                <h3>Catégories</h3>

                <!-- category template -->
                <script id="category-template" type="text/x-handlebars-template">
                    <div class="border p-3 mb-3 category">
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
                                Séparez les éléments par des sauts de ligne. (<span class="numElements"></span> équipes)
                            </small>
                        </div>

                        <hr>
                        <!--<h4>Phase de groupe</h4>-->

                        <div class="form-group row">
                            <label class="col-md-3 col-form-label">Phase de groupes</label>

                            <div class="form-row col">
                                <div class="form-group col">
                                    <label>Nombre de groupes</label>
                                    <input type="number" class="form-control qualifGroups" value="{{ qualif.groups }}" min="1">
                                </div>
                                <div class="form-group col">
                                    <label>Nombre de tours</label>
                                    <input type="number" class="form-control qualifRounds" value="{{ qualif.rounds }}" min="1">
                                </div>
                            </div>
                        </div>

                        <hr>
                        <!--<h4>Phase finale</h4>-->

                        <div class="form-group row">
                            <label class="col-md-3 col-form-label">Phase finale</label>

                            <div class="form-row col">
                                <div class="form-group col">
                                    <label>Équipes qualifiées</label>
                                    <input type="number" class="form-control qualified" value="{{ knockout.qualified }}" min="2" max="64">
                                </div>
                                <div class="form-group col">
                                    <label>Durée de la finale</label>
                                    <input type="time" class="form-control finalDuration" value="{{ knockout.finalDuration }}" min="00:05" disabled>
                                </div>
                            </div>

                            <div class="form-check col-sm-9 offset-sm-3">
                                <label class="custom-control custom-checkbox">
                                    <input type="checkbox" class="custom-control-input" value="{{ knockout.thirdPlace }}" disabled>
                                    <span class="custom-control-indicator"></span>
                                    Petite finale
                                </label>
                            </div>
                        </div>

                        <button type="button" class="btn btn-light removeCategory">
                            <i class="fa fa-trash-o"></i>
                        </button>
                    </div>
                </script>

                <button type="button" class="btn btn-light btn-block" id="addCategory">
                    <i class="fa fa-plus-circle"></i> Ajouter catégorie
                </button>
			</form>

            <hr>

            <button type="button" id="generateSchedule" class="btn btn-primary btn-block">
                <i class="fa fa-check"></i> Générer le programme des matchs
                <i class="fa fa-spinner fa-spin d-none"></i>
            </button>

            <div class="row m-0">
                <input type="number" class="col col-md-2 form-control form-control-sm mt-2 col" id="experiences" value="100" min="1" max="10000">

                <small class="col col-md-10 form-text text-muted">
                    Nombre d'itérations. Plus il est grand, plus il y a de chances de trouver un horaire équilibré.<br>
                    Par contre, cela multiplie le temps de génération du programme.
                </small>
            </div>


		</div>

        <div id="schedule" class="d-none">
            <a href="" id="showConfig" class="admin-only">Voir configuration</a>

            <div class="prologue"></div>

            <textarea rows="4" class="form-control admin-only prologue"></textarea>

            <hr>

            <h3>Groupes</h3>
            <div id="groups" class="clearfix row">
                <!--Group template-->
                <script id="group-template" type="text/x-handlebars-template">
                    <div class="col group">
                        <h4>{{ name }}</h4>
                        <ul>
                            {{#each teams}}
                            <li data-mark="{{../index}}-{{this.index}}">{{ this.name }}</li>
                            {{/each}}
                        </ul>
                    </div>
                </script>
            </div>
            <div>
                <small>
                    <i>Cliquez sur le nom d'une équipe pour mettre ses matchs en évidence dans le programme.</i>
                </small>
                </div>

            <hr>

            <div id="qualif">
                <h3>Programme des matchs</h3>
                <table id="qualifTable" class="table table-sm">
                    <thead>
                        <tr>
                            <th>Heure</th>
                            <th class="id-col">#</th>
                            <th class="field-col">Terrain</th>
                            <th>Équipe 1</th>
                            <th>Équipe 2</th>
                            <th>Score</th>
                        </tr>
                    </thead>
                    <tbody>
                        <!--Match template-->
                        <script id="match-template" type="text/x-handlebars-template">
                            {{#if pause}}
                                <tr class="pauseSlot table-secondary slot">
                                    <td>{{ time }}</td>
                                    <td colspan="5">Pause</td>
                                </tr>
                            {{else}}
                                <tr class="match g{{group.index}} t{{teamA.index}} t{{teamB.index}} slot {{matchClasses}}"
                                    data-group-index="{{ group.index }}"
                                    data-match-id="{{ id }}"
                                >
                                    <td class="time">{{ time }}</td>
                                    <td class="text-muted id-col">{{ id }}</td>
                                    <td class="field-col">{{ field }}</td>
                                    <td class="{{ teamA.class }} team teamA" data-mark="{{group.index}}-{{teamA.index}}">{{ teamA.name }}</td>
                                    <td class="{{ teamB.class }} team teamB" data-mark="{{group.index}}-{{teamB.index}}">{{ teamB.name }}</td>
                                    <td class="score">
                                        <input type="number" class="scoreA" value="{{ scoreA }}" disabled="disabled"
                                               data-team-index="{{ teamA.index }}" min="0"> :
                                        <input type="number" class="scoreB yolo" value="{{ scoreB}}" disabled="disabled"
                                               data-team-index="{{ teamB.index }}" min="0">
                                    </td>
                                </tr>
                            {{/if}}
                        </script>
                    </tbody>
                </table>
            </div>

            <hr>

            <h3>Classements</h3>
            <small class="form-text text-muted">
                Les équipes en vert sont qualifiées pour la phase finale.
            </small>
            <div id="rankings">
                <!--Ranking table template-->
                <script id="ranking-table-template" type="text/x-handlebars-template">
                    <div class="ranking-table g{{ group.index }}">
                        <h4>{{ group.name }}</h4>
                        <table class="table table-sm">
                            <thead class="desktop-only">
                            <tr class="table-light">
                                <th>Équipe</th>
                                <th>Joués</th>
                                <th>Gagnés</th>
                                <th>Nuls</th>
                                <th>Perdus</th>
                                <th>Diff</th>
                                <th>Points</th>
                            </tr>
                            </thead>
                            <thead class="mobile-only d-none">
                            <tr class="table-light">
                                <th>Équipe</th>
                                <th>J</th>
                                <th>G</th>
                                <th>N</th>
                                <th>P</th>
                                <th>±</th>
                                <th>Pts</th>
                            </tr>
                            </thead>
                            <tbody>
                            {{#each teams}}
                            <tr class="t{{ this.index }}">
                                <td data-mark="{{../group.index}}-{{this.index}}">{{ this.name }}</td>
                                <td>{{ this.played }}</td>
                                <td>{{ this.won }}</td>
                                <td>{{ this.drawn }}</td>
                                <td>{{ this.lost }}</td>
                                <td>{{ this.difference }}</td>
                                <th>{{ this.points }}</th>
                            </tr>
                            {{/each}}
                            </tbody>
                        </table>
                    </div>
                </script>

            </div>

            <hr>

            <button type="button" id="goKnockout" class="btn btn-primary btn-block admin-only">
                <i class="fa fa-check"></i> Passer à la phase finale
            </button>

            <div id="knockout">

                <hr>
                <h3 style="display:inline" class="mr-4">Phase Finale</h3>

                <div class="admin-only">
                    <div>
                        <input type="checkbox" name="show-knockout-tables" id="show-knockout-tables" class="mr-1">
                        <label for="show-knockout-tables">Show knockout tables</label>
                        <input type="checkbox" name="show-iframe" id="show-iframe" class="ml-4 mr-1">
                        <label for="show-iframe">Show iframe</label>
                    </div>

                    <div class="form-group row">
                        <label for="iframeUrl" class="col-md-3 col-form-label">iframe URL</label>
                        <div class="col">
                            <input type="text" class="form-control" id="iframeUrl">
                        </div>
                    </div>
                </div>

                <div class="knockout-tables">
                    <table id="knockout-schedule" class="table table-sm">
                        <thead>
                        <tr>
                            <th>Heure</th>
                            <th>#</th>
                            <th>Terrain</th>
                            <th>Équipe 1</th>
                            <th>Équipe 2</th>
                            <th>Score</th>
                        </tr>
                        </thead>
                        <tbody>
    
                        </tbody>
                    </table>
    
                    <div id="knockout-table">
                        <!--Filled in scheduleknockout.js-->
                    </div>
                </div>

                <iframe class="my-4" style="width:100%; height: 800px; max-height: 60vh; border: 1px solid #0001" src="" frameborder="0" scrolling="no" allowfullscreen></iframe>
                <div>
                    <a href="" target="_blank">Ouvrir le diagramme</a>
                </div>
            </div>
        </div>


        <div class="admin-only">

            <hr>

            <a id="hiddenDownloadLink" class="d-none">Télécharger</a>

            <button type="button" id="download" class="btn btn-dark btn-block">
                <i class="fa fa-download"></i> Télécharger le fichier du tournoi
            </button>

            <button type="button" id="save" class="btn btn-dark btn-block">
                <i class="fa fa-cloud-upload"></i> Sauvegarder le tournoi en ligne
            </button>

        </div>

	</div>

    <!-- Application -->
    <script src="js/tools.js?2024"></script>
    <script src="js/load.js?2024"></script>
    <script src="js/config.js?2024"></script>
    <script src="js/schedule.js?2024"></script>
    <script src="js/models.js?2024"></script>
    <script src="js/rankings.js?2024"></script>
    <script src="js/scheduleknockout.js?2024"></script>
    <script src="js/knockout.js?2024"></script>
    <script src="js/display.js?20240623"></script>

</body>
</html>