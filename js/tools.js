
function getTemplate(name){
    return Handlebars.compile($("#" + name + "-template").html());
}

function listToString(list){
    return list.join('\n');
}

// Tidy a multiline string and fill a list separating elements with linebreaks
function stringToList(str){
    return str.split("\n").map(line => {
        return line.trim();
    }).filter(line => {
        return line.length > 0;
    });
}

function initArray(object, arrayName){
    if(object[arrayName] === undefined)
        object[arrayName] = [];
}

function initArrays(object, arrayNamesArray){
    arrayNamesArray.forEach(arrayName => initArray(object, arrayName));
}


// JSON <-> DOM CONVERSIONS

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

    if(j.schedule)
        showSchedule();
}