
let rankingTableTemplate = getTemplate("ranking-table");

function addRankingTable(rankedTeams){
    $("#rankings").append(rankingTableTemplate(rankedTeams));
}

function updateRanking(){
    // reinit team rankings
    SCHEDULE.groups.forEach(group => {
        group.teams = group.teams.map(team => {
            // cast generic json object to class Team instance
            let newTeam = Object.create(Team.prototype);
            newTeam.name = team.name;
            newTeam.index = team.index;
            newTeam.groupIndex = team.groupIndex;
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
        let group = SCHEDULE.groups[groupIndex];
        let teamA = group.teams[A.data("team-index")];
        let teamB = group.teams[B.data("team-index")];

        // find match from id
        let matchId = $(elem).data("match-id");
        let match;
        for(let slot of SCHEDULE.qualif){
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

    SCHEDULE.groups.forEach(group => {
        // clone teams array
        group.rankedTeams = group.teams.slice(0);
        group.rankedTeams.sort(Team.compare);
        addRankingTable({teams:group.rankedTeams, group:group});
    });

    let qualified = getQualified();
}

function getQualified(){
    let qualifiedByCategories = [];
    CONFIG.categories.forEach((category, index) => {
        let qualified = [];
        // retrieve groups of this category
        let groups = SCHEDULE.groups.filter(group => {
            return group.categoryIndex === index;
        });
        let qualifiedByGroup = parseInt(category.knockout.qualified / groups.length);
        let rest = category.knockout.qualified % groups.length;
        for(let i=0; i<qualifiedByGroup; i++){
            groups.forEach(group => {
                qualified.push(group.rankedTeams[i]);
            });
        }
        let nextBests = groups.map(group => group.rankedTeams[qualifiedByGroup]);
        nextBests.sort(Team.compare);
        qualified = qualified.concat(nextBests.slice(0, rest));
        qualified.forEach(team => {
            markQualified(team)
        });
        qualifiedByCategories.push({teams:qualified, category:category.name});
    });
    return qualifiedByCategories;
}

function markQualified(team){
    let g = team.groupIndex;
    let t = team.index;
    $(".g"+g+" .t"+t).addClass("table-success");
}

function randomScores(){
    $("td input").each((index, elem) => {
        $(elem).val(parseInt(Math.random()*5));
    });
    updateRanking();
}