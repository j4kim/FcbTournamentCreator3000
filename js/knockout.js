
$("#goKnockout").click(e => {
    // disable butotn
    $(e.target).prop("disabled", true);
    // disable qualif score inputs
    $("#qualifTable input").prop("disabled", true);
    $("#knockout-schedule input").prop("disabled", false);

    let qualifiedByGroups = getQualified();

    qualifiedByGroups.forEach((group, groupIndex) => {
        group.teams.forEach((team, index) => {
            // qualifiedTeamNodes[groupIndex][index].team = team;
            qualifiedTeamNodes[groupIndex][index].name = team.name;
        })
    });
    fillKnockoutSchedule();
    drawTrees();

});