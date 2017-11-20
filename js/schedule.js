
let matchTemplate = getTemplate("match");
let groupTemplate = getTemplate("group");

function addSlot(slot){
    $("#qualifTable tbody").append(matchTemplate(slot));
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
    });
    mergeTimeSlots($("#qualifTable"));
}

let SCHEDULE;

function generateSchedule(){
    CONFIG = getConfig();
    SCHEDULE = new Schedule(CONFIG);
    loadSchedule(SCHEDULE);
}

function loadSchedule(newSchedule){
    SCHEDULE = newSchedule;
    console.log("Loaded schedule", SCHEDULE);
    // empty schedule
    $(".group, .match, .pauseSlot").remove();

    fillGroups(SCHEDULE.groups);
    fillSchedule(SCHEDULE.qualif);
    updateRanking();
    prescheduleKnockout();

    showSchedule();

    if(SCHEDULE.knockout){
        fillKnockoutSchedule(SCHEDULE.knockout);
        drawTrees(SCHEDULE.knockout);
        knockoutUi(true);
    }else{
        knockoutUi(false)
    }
}

$(function () {
    $("#showSchedule").click(showSchedule);
    $("#showConfig").click(showConfig);

    $("#generateSchedule").click(generateSchedule);

    $("#qualif").on("change", ".score > input", e => {
        updateRanking();
    });
});
