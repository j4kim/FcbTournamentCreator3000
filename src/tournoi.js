
function Equipe(nom, groupe) {
    this.nom = nom;
    this.groupe = groupe;
	this.nbRencontres = this.nbAttente = 0;
	
    this.joueUnMatch = function(){
		this.nbRencontres++;
		this.nbAttente=0;
	};
	
	this.attendre = function(){
		this.nbAttente++;
	};
	
	this.toString = function(){
		//return this.nom + ":" + this.nbRencontres + ":" + this.nbAttente;
		return this.nom;
	};
}

function Match(e1, e2, groupe){
	this.equipe1 = e1;
	this.equipe2 = e2;
	this.priorite = 0;
	this.groupe = groupe;
	
	this.updatePrioity = function() {
		this.priorite = (this.equipe1.nbRencontres + this.equipe2.nbRencontres)
					  - (this.equipe1.nbAttente + this.equipe2.nbAttente);
		if(this.equipe1.nbAttente * this.equipe2.nbAttente == 0){
			this.priorite++;
		}
	}
	
	this.jouer = function() {
		this.equipe1.joueUnMatch();
		this.equipe2.joueUnMatch();
	}
	
	this.toString = function(){
		this.updatePrioity();
		//return this.equipe1 + " vs " + this.equipe2 + " ::" + this.priorite;
		return this.equipe1 + " vs " + this.equipe2;
	}
	
	this.numero=0;
	this.heure="";
	this.terrain="";
	
}

function ListeMatchs(){
	this.heap = [];
	this.programme = [];
	
	this.poll = function() {
		var matchPrioritaire = this.getMatchPrioritaire();
		this.remove(matchPrioritaire);
		this.programme.push(matchPrioritaire);
		return matchPrioritaire;
	}
	
	this.getMatchPrioritaire = function(){
		this.calculPriorites();
		var matchPrioritaire = this.heap[0];
		for (var i=1; i<this.heap.length; i++) {
			var match = this.heap[i];
			if (match.priorite < matchPrioritaire.priorite){
				matchPrioritaire = match;
			}
		}
		return matchPrioritaire;
	}
	
	this.calculPriorites = function() {
		for (var i=0; i<this.heap.length; i++) {
			this.heap[i].updatePrioity();
		}
	}
	
	this.remove = function(match){
		this.heap.splice(this.heap.indexOf(match), 1);
	}
	
	this.toString = function(){
		var str="";
		for (var i=0; i < this.heap.length ;i++) {
			str += this.heap[i] + "\n";
		}
		return str;
	}
	
	this.add = function(match){
		this.heap.push(match);
	}
	
	this.programmeString = function(){
		var n = this.programme.length;
		var str="";
		for (var i=0; i<n; i++) {
			str+= "Match "+i+ " : " + this.programme[i] + "\n";
		}
		return str;
	}
	
}

function Groupe(nom, nbTours){
	this.nom = nom;
	this.equipes = [];
	this.nbTours = nbTours;
	this.poids=0;
	this.attente=0;
	this.matchJoues=0;
	this.programme=[];
	this.priorite=0;
	this.nbMatchs=0;
	
	this.makeProgramme = function(){
		
		var nbEquipes = this.equipes.length;
		
		var matchs = new ListeMatchs();
		
		for (var i = 0; i < nbEquipes; i++) {
			for (var j = i + 1; j < nbEquipes; j++) {
				for(var k=0;k<this.nbTours;k++){
					//matchs.add(new Match(this.equipes[i], this.equipes[j], this.nom));
					
					//random pour déterminer la premiere equipe1
					if(Math.random()>.5)
						matchs.add(new Match(this.equipes[i], this.equipes[j], this.nom));
					else
						matchs.add(new Match(this.equipes[j], this.equipes[i], this.nom));
					
				}
			}
		}
		
		this.nbMatchs = matchs.heap.length;
		
		for (var i = 1; i <= this.nbMatchs; i++) {
			match = matchs.poll();

			for (var k = 0; k < nbEquipes; k++) {
				this.equipes[k].attendre();
			}

			match.jouer();

		}	
		
		this.programme = matchs.programme;
		
	}
	
	this.calculerPriorite = function(){
		//this.priorite = this.poids+(this.poids*this.attente);
		//console.log("calcul priorité du groupe " + this.nom, this.poids,this.attente, this.priorite);
		var matchsRestants = this.nbMatchs - this.matchJoues;
		if(matchsRestants==0)
			this.priorite=0;
		else
			this.priorite = matchsRestants + this.attente;
	}
	
}

////////////////////////////////

function genererProgramme(configTournoi){
	
	//var equipes = {};
	//var equipes = [];
	
	var groupes = [];
	var copyGroupes = [];
	var nbGroupes =0;
	var terrains = configTournoi.terrains;
	
	$.each(configTournoi.groupes, function(nomGroupe, groupe){
		nbGroupes++;
		var nouveauGroupe = new Groupe(nomGroupe, groupe.nbTours);
		var copyGroupe = new Groupe(nomGroupe, groupe.nbTours);
		$.each(groupe.equipes, function(i, nomEquipe){
			//equipes[nomEquipe] =new Equipe(nomEquipe, nomGroupe);
			//equipes.push(new Equipe(nomEquipe, nomGroupe));
			nouveauGroupe.equipes.push(new Equipe(nomEquipe, nomGroupe));
			copyGroupe.equipes.push(new Equipe(nomEquipe, nomGroupe));
		});
		nouveauGroupe.makeProgramme();
		copyGroupe.makeProgramme();
		groupes.push(nouveauGroupe);
		copyGroupes.push(copyGroupe);
	});

	var nbMatchs=0;
	for(var i=0; i<nbGroupes; i++){
		nbMatchs += groupes[i].programme.length;
	}
	
	//console.log(groupes, nbMatchs + " matchs au total");
	
	var programme = [];
	
	for(var i=0; i<nbGroupes; i++){
		groupes[i].poids = groupes[i].programme.length/nbMatchs;
		//console.log("poids du groupe " + groupes[i].nom + " : " + groupes[i].poids);
	}
	
	var heure = new Heure(configTournoi.config.debut);
	var duree = new Heure(configTournoi.config.duree);
	var tempsEntre = new Heure(configTournoi.config.tempsEntre);
	var ecartMinutes = duree.minutes + tempsEntre.minutes;
	var debutPause = new Heure(configTournoi.config.debutPause);
	var finPause = new Heure(configTournoi.config.finPause);
	var nbTerrains = terrains.length;
	var pausePassee=false;
	
	for(var i=0; i<nbMatchs; i++){
		var groupeChoisi = choisirGroupe(groupes);
		//console.log(groupeChoisi);
		var match = groupeChoisi.programme.shift();
		match.terrain = terrains[i%nbTerrains];
		if(!pausePassee && heure.minutes >= debutPause.minutes){
			heure.minutes = finPause.minutes;
			pausePassee=true;
		}
		match.heure = heure.toString();
		if(i%nbTerrains==nbTerrains-1)
			heure.minutes+=ecartMinutes;
		match.numero=i;
		programme.push(match);
	}
	/*
	var porgrammeGroupes = [];
	for(var i=0; i<nbGroupes; i++){
		groupes[i].makeProgramme();
		porgrammeGroupes.push(groupes[i]);
	}
	*/
	var porgrammeGroupes = copyGroupes;
	
	//return {groupes, programme};
	return {nbTerrains, porgrammeGroupes, programme};
	
}

function choisirGroupe(groupes){
	var nbGroupes = groupes.length;
	var groupeChoisi = groupes[0];
	for(var i=0; i<nbGroupes; i++){
		groupes[i].calculerPriorite();
		if(groupes[i].priorite > groupeChoisi.priorite)
			groupeChoisi = groupes[i];
		else if(groupes[i].priorite == groupeChoisi.priorite && groupes[i].attente > groupeChoisi.attente)
			groupeChoisi = groupes[i];
		groupes[i].attente++;
		
	}
	groupeChoisi.attente=0;
	groupeChoisi.matchJoues++;
	return groupeChoisi;
}