
function addKnockoutMatch(slot){
    let matchElement = getMatchElement(slot);
    $("#knockout-schedule tbody").append(matchElement);
}

function prescheduleRankingFinals() {
    let pauseBetween = new Time(CONFIG.pauseBetween);
    let pauses = Time.convertPauses(CONFIG.pauses);
    let lastSlot = SCHEDULE.qualif.slice(-1)[0];
    let lastSlotStart = new Time(lastSlot.time);
    // if the last slot is a pause, get the penultimate slot
    let lastMatch = lastSlot.pause ? SCHEDULE.qualif.slice(-2)[0] : lastSlot;
    MATCH_ID = lastMatch.id + 1;
    let knockoutStart = lastSlotStart.addOrPause(pauseBetween, pauses);
    let duration = new Time(CONFIG.matchDuration);

    debugger;
}