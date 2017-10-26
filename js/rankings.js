
let rankingTableTemplate = getTemplate("ranking-table");

function addRankingTable(rankedTeams){
    $("#rankings").append(rankingTableTemplate(rankedTeams));
}

function updateRanking(){
    // reinit team rankings
    schedule.groups.forEach(group => {
        group.teams = group.teams.map(team => {
            // cast generic json object to class Team instance
            let newTeam = Object.create(Team.prototype);
            newTeam.name = team.name;
            newTeam.index = team.index;
            newTeam.reinit();
            return newTeam;
        })
    });
    // remove ranking tables
    $(".ranking-table").remove();

    $(".match").each((index, elem) => {
        // get scores, return if score is missing
        let A = $(elem).find(".scoreA");
        let B = $(elem).find(".scoreB");
        if(A.val() === "" || B.val() === "")
            return;
        [scoreA,scoreB] = [+A.val(), +B.val()]; // '+' to get int value

        // find teams from group and team indexes
        let groupIndex = $(elem).data("group-index");
        let group = schedule.groups[groupIndex];
        let teamA = group.teams[A.data("team-index")];
        let teamB = group.teams[B.data("team-index")];

        // find match from id
        let matchId = $(elem).data("match-id");
        let match;
        for(let slot of schedule.qualif){
            let tmp = slot.matches.find(match => match.id === matchId);
            if(tmp){
                match = tmp;
                break;
            }
        }
        // write score
        match.scoreA = scoreA;
        match.scoreB = scoreB;

        teamA.playMatch(scoreA, scoreB);
        teamB.playMatch(scoreB, scoreA);
    });

    schedule.groups.forEach(group => {
        // clone teams array
        let rankedTeams = group.teams.slice(0);
        rankedTeams.sort(Team.compare);
        addRankingTable({teams:rankedTeams,group:group.name});
    });

}