
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
    $("#qualifTable tbody").empty();
    qualif.forEach(slot => {
        addSlot(slot);
    });
    mergeTimeSlots($("#qualifTable"));
}

let SCHEDULE;


// report: [diffMin, diffMax, diffMinCount, diffMaxCount, criticalLate, criticalAdvance, diffAverage]
function betterReport(a, b){
    let [maxA, maxB] = [Math.max(-a[0], a[1]), Math.max(-b[0], b[1])];
    if(maxA === maxB){
        return a[6] < b[6];
    }
    return maxA < maxB;
}

function generateSchedule(){
    $(".fa-spinner").removeClass("d-none");
    // a small timeout is required to show the spinner
    setTimeout(() => {
        CONFIG = getConfig();
        let best = new Schedule(CONFIG);
        for(let i=1; i<10; i++){
            let schedule = new Schedule(CONFIG);
            if(betterReport(schedule.score, best.score)){
                best = schedule;
            }
        }
        SCHEDULE = best;
        loadSchedule(SCHEDULE);
        $(".fa-spinner").addClass("d-none");
    }, 10);
}

function loadSchedule(newSchedule){
    SCHEDULE = newSchedule;
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
