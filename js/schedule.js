
let matchTemplate = getTemplate("match");
let groupTemplate = getTemplate("group");

function addMatch(data){
    $("#qualifTable").append(matchTemplate(data));
}

function addSlot(slot){
    if(slot.pause){
        addMatch(slot);
    }else{
        slot.matches[0].first = true;
        slot.matches[0].numMatches = slot.matches.length;
        slot.matches.forEach(match => {
            match.time = slot.time;
            addMatch(match);
        })
    }
}

function showConfig(){
    $("#schedule").addClass('d-none');
    $("#configuration").removeClass('d-none');
    $("#showSchedule").removeClass("d-none");
    return false;
}

function showSchedule() {
    $("#schedule").removeClass('d-none');
    $("#configuration").addClass('d-none');
    return false;
}

function fillGroups(groups){
    groups.forEach(group => {
        $("#groups").append(groupTemplate(group));
    })
}

function fillSchedule(qualif){
    qualif.forEach(slot => {
        addSlot(slot);
    })
}

let schedule;

function generateSchedule(){
    schedule = new Schedule(getConfig());
    loadSchedule(schedule);
}

function loadSchedule(newSchedule){
    schedule = newSchedule;
    console.log("Loaded schedule",schedule);
    // empty schedule
    $(".group, .match, .pauseSlot").remove();

    fillGroups(schedule.groups);
    fillSchedule(schedule.qualif);
    updateRanking();

    showSchedule();
}

$(function () {
    $("#showSchedule").click(showSchedule);
    $("#showConfig").click(showConfig);

    $("#generateSchedule").click(generateSchedule);

    $("#qualif").on("change", ".score > input", e => {
        updateRanking();
    });
});
