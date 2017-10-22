// TEMPLATES

let pauseTemplate = getTemplate("pause");
let categoryTemplate = getTemplate("category");

function addPause(data){
    $(".pauses-container")
        .removeClass("d-none")
        .append(pauseTemplate(data));
}

function addCategory(data){
    $("#addCategory").before(categoryTemplate(data));
}

function fillJsonFromForm(){
    let j = {config:{pauses:[],categories:[]}};
    j.name = $("#name").val();
    j.config.start = $("#start").val();
    $(".pause").each((i,elem) => {
        j.config.pauses.push({
            start: $(elem).find(".pauseStart").val(),
            duration: $(elem).find(".pauseDuration").val(),
        });
    });
    j.config.fields = stringToList($('#fields').val());
    $(".category").each((i,elem) => {
        j.config.categories.push({
            name: $(elem).find(".categoryName").val(),
            teams: stringToList($(elem).find(".categoryTeams").val()),
            qualif:{
                groups: $(elem).find(".qualifGroups").val(),
                rounds: $(elem).find(".qualifRounds").val(),
                matchDuration: $(elem).find(".qualifMatchDuration").val(),
            },
            knockout:{
                pauseBetween: $(elem).find(".pauseBetween").val(),
                qualified: $(elem).find(".qualified").val(),
                finalDuration: $(elem).find(".finalDuration").val(),
            }
        });
    });
    return j;
}

function fillFormFromJson(j){
    // empty form
    $("#name, #start, #fields").val("");
    $(".pause, .category").remove();

    if(j === undefined) return;

    initArrays(j.config, ["pauses","fields","categories"]);

    // fill form
    $("#name").val(j.name);
    $("#start").val(j.config.start);
    j.config.pauses.forEach(p => addPause(p));
    j.config.fields = listToString(j.config.fields);
    $("#fields").val(j.config.fields);
    j.config.categories.forEach(c => {
        c.teams = listToString(c.teams);
        addCategory(c);
    });
}

$(function() {

    // ADD/REMOVE PAUSES

    $("#addPause").click(e => {
        addPause({start:"12:00",duration:"00:30"});
        $(".pauseStart").focus();
    });

    $(".pauses-container").on("click", ".removePause", e => {
        $(e.target).closest(".pause").remove();
    });

    // ADD/REMOVE CATEGORY

    $("#addCategory").click(e => {
        addCategory({
            qualif: {
                groups:1,
                rounds:1,
                matchDuration:"00:15"
            },
            knockout: {
                pauseBetween: "00:00",
                qualified: 4,
                finalDuration: "00:30"
            }
        });
        $(".categoryName").focus();
    });

    $("#configForm").on("click", ".removeCategory", e => {
        $(e.target).closest(".category").remove();
    });
});