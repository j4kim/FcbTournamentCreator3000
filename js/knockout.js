
$("#goKnockout").click(e => {
    // disable butotn
    $(e.target).prop("disabled", true);
    // disable qualif score inputs
    $("#qualifTable input").prop("disabled", true);
    $("#knockout-schedule input").prop("disabled", false);

    let qualifiedByGroups = getQualified();

    qualifiedByGroups.forEach((group, groupIndex) => {
        group.teams.forEach((team, index) => {
            qualifiedTeamNodes[groupIndex][index].name = team.name;
        })
    });
    fillKnockoutSchedule();
    drawTrees();

});

function findTeamClass(parent, matchId){
    if(parent.teamA.childId === matchId)
        return "teamA";
    else if(parent.teamB.childId === matchId)
        return "teamB";
    throw new Error("invalid match id : " + matchId, parent)
}

function setWinner(matchNode, winner){
    let parent = matchNode.parent;
    if(parent === undefined){
        // matchNode is a final
        return;
    }

    let tr = $("[data-match-id="+ parent.id +"]");
    let teamClass = findTeamClass(parent, matchNode.id);
    let td = tr.find("."+teamClass);
    td.text(winner.name).removeClass("text-muted");
    parent[teamClass] = {name: winner.name, childId:matchNode.id};
}

function playMatch(matchElem){
    let scoreA = matchElem.find(".scoreA").val();
    let scoreB = matchElem.find(".scoreB").val();

    if(scoreA === "" || scoreB === "" || scoreA === scoreB)
        return;
}

$("#knockout-schedule").on("change", ".score > input", e => {
    playMatch($(e.target).closest(".match"));
});