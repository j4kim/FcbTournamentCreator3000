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

var schedule;

function generateSchedule(){
    schedule = new Schedule(getConfig());

    showSchedule();
}

$(function () {
    $("#showSchedule").click(showSchedule);
    $("#showConfig").click(showConfig);

    $("#generateSchedule").click(generateSchedule);
});
