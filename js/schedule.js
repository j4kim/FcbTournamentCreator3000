
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

//          0        1        2             3             4             5                6
// report: [diffMin, diffMax, diffMinCount, diffMaxCount, criticalLate, criticalAdvance, diffAverage]
// the diff of a match is the sum of its 2 team advances over their last match
// if a match is "late", its diff is negative.
// 0,1 : diffMin and diffMax are the extreme diffs
// 2,3 : the number of matches that have these extreme diffs (the number of critically misplaced matches)
// 4,5 : the worst late/advance of a team on a match
// 6 : The absolute average of every match diff
function betterReport(a, b){
    let [criticA, criticB] = [Math.max(-a[4], a[5]), Math.max(-b[4], b[5])];
    if(criticA !== criticB)
        return criticA < criticB;
    let [maxA, maxB] = [Math.max(-a[0], a[1]), Math.max(-b[0], b[1])];
    if(maxA !== maxB)
        return maxA < maxB;
    let [countA, countB] = [Math.max(-a[2], a[3]), Math.max(-b[2], b[3])];
    if(countA !== countB)
        return countA < countB;
    return a[6] < b[6];
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
