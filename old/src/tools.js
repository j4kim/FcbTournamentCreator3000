
function Heure(strHeure){
	
	var tab = strHeure.split(":");
	var heures = parseInt(tab[0]);
	var minutes = parseInt(tab[1]);
	
	this.minutes = minutes+60*heures;
	
	this.toString = function(){
		var h = Math.floor(this.minutes/60);
		var m = this.minutes%60;
		
		var date = new Date(0, 0, 0, h, m, 0, 0);
		
		var options = {hour: "numeric", minute: "numeric"};
		var str = new Intl.DateTimeFormat("fr-Fr", options).format(date);
		return str;
	}
	
}

function makeTable(programme){
	
	var html = `
		<a href="#" onclick="retour();return false">Retour</a>
		<h2>Programme par groupe</h2>
		`;
		
	var nbGroupes = programme.porgrammeGroupes.length;

	$.each(programme.porgrammeGroupes, function(j, groupe){
		html += `
			<div style="float:left;padding-right:50px;">
			<h3>`+groupe.nom+`</h3>
				<table class="table table-bordered table-condensed table-responsive col-sm-3">
			`;
		$.each(groupe.programme, function(i, match){
			html += `
				<tr>
					<td>`+match.equipe1+`</td>
					<td>`+match.equipe2+`</td>
				</tr>
				`;	
		});
		html += `</table></div>`;
	});
			
	html += `
		<h2 style="clear:both">Programme des matchs</h2>	
		<table id="tableProgramme" class="table table-bordered table-condensed table-responsive">
		<thead>
			<tr>
				<th>Heure</th>
				<th>N° match</th>
				<th>Terrain</th>
				<th colspan="2">Équipes</th>
			</tr>
		</thead>
		<tbody>
	`;
	var nbTerrains = programme.nbTerrains;
	var nbMatchs = programme.programme.length;
	for(var i=0;i<nbMatchs;i++){
		var m=programme.programme[i];
		if(i%nbTerrains==0)
			html+='<tr style="border-top-style: solid;"><td rowspan="'+nbTerrains+'">'+m.heure+'</td>';
		else
			html+="<tr>";
		html+= `
			<td>`+m.numero+`</td><td>`+m.terrain+`</td><td>`+m.equipe1+`</td><td>`+m.equipe2+`</td>
		</tr>
		`;
	}
	html += "</tbody></table>";
	html += '<a href="#" onclick="toExcel(\'tableProgramme\');return false;">Obtenir fichier Excel</a>';
	return html;
}

function retour(){
	$('#programme').hide();
	$('#configuration').show();
}



function toExcel(id){
	$("#"+id).table2excel({
		name: "Programme tournoi",
		filename: "tournoi", //do not include extension
		fileext: ".xls",
		exclude_img: true,
		exclude_links: true,
		exclude_inputs: true
	});
}