
function knockoutUi(yes=true){
    // disable button
    $("#goKnockout").prop("disabled", yes);
    // disable qualif score inputs
    $("#qualifTable input").prop("disabled", yes);
    // enable knockout score inputs
    $("#knockout-schedule input").prop("disabled", !yes);
}

$("#goKnockout").click(e => {
    knockoutUi();

    let qualifiedByCategory = getQualified();

    function replaceTeamName(child, catIndex){
        if(child.qualifiedIndex === undefined)
            return;
        child.name = qualifiedByCategory[catIndex][child.qualifiedIndex].name;
        delete child.qualifiedIndex;
    }

    // insert qualified teams in the knockout schedule
    knockoutSlots.forEach((_, index) => {
        let slot = knockoutSlots[index];
        let catIndex = slot.categoryIndex;
        replaceTeamName(slot.childA, catIndex);
        replaceTeamName(slot.childB, catIndex);
    });

    SCHEDULE.knockout = knockoutSlots.slice(0);

    fillKnockoutSchedule(SCHEDULE.knockout);
    drawTrees(SCHEDULE.knockout);
});

function playMatch(matchElem){
    let scoreA = matchElem.find(".scoreA").val();
    let scoreB = matchElem.find(".scoreB").val();

    let matchId = matchElem.data("match-id");
    let match = SCHEDULE.knockout.find(slot => slot.id === matchId);
    match.scoreA = scoreA;
    match.scoreB = scoreB;

    if(scoreA === "" || scoreB === "" || scoreA === scoreB)
        return;

    let winner = scoreA > scoreB ? match.childA : match.childB;
    match.name = winner.name;

    let parent = SCHEDULE.knockout.find(slot => slot.id === match.parentId);
    if(parent !== undefined){
        let childInParent = [parent.childA, parent.childB].find(child => child.matchId === matchId);
        childInParent.name = winner.name;
    }

    fillKnockoutSchedule(SCHEDULE.knockout);
    drawTrees(SCHEDULE.knockout);
}

$("#knockout-schedule").on("focusout", ".score > input", e => {
    playMatch($(e.target).closest(".match"));
});