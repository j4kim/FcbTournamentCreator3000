
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

function getConfig(){
    let config = {pauses:[],categories:[]};
    config.start = $("#start").val();
    config.matchDuration = $("#matchDuration").val();
    $(".pause").each((i,elem) => {
        config.pauses.push({
            start: $(elem).find(".pauseStart").val(),
            duration: $(elem).find(".pauseDuration").val(),
        });
    });
    config.fields = stringToList($('#fields').val());
    $(".category").each((i,elem) => {
        config.categories.push({
            name: $(elem).find(".categoryName").val(),
            teams: stringToList($(elem).find(".categoryTeams").val()),
            qualif:{
                groups: parseInt($(elem).find(".qualifGroups").val()),
                rounds: parseInt($(elem).find(".qualifRounds").val()),
                // matchDuration: $(elem).find(".qualifMatchDuration").val(),
            },
            knockout:{
                pauseBetween: $(elem).find(".pauseBetween").val(),
                qualified: parseInt($(elem).find(".qualified").val()),
                finalDuration: $(elem).find(".finalDuration").val(),
            }
        });
    });
    return config;
}

function getJson(){
    let j = {};
    j.name = $("#name").val();
    j.config = getConfig();
    if(SCHEDULE)
        j.schedule = SCHEDULE;
    return j;
}

let CONFIG;

function loadJson(j){
    // empty form
    $("#name, #start, #fields").val("");
    $(".pause, .category").remove();

    if(j === undefined) return;

    initArrays(j.config, ["pauses","fields","categories"]);

    // fill form
    $("#name").val(j.name);
    $("#start").val(j.config.start);
    $("#matchDuration").val(j.config.matchDuration);
    j.config.pauses.forEach(p => addPause(p));
    j.config.fields = listToString(j.config.fields);
    $("#fields").val(j.config.fields);
    j.config.categories.forEach(c => {
        c.teams = listToString(c.teams);
        addCategory(c);
    });

    CONFIG = j.config;

    if(j.schedule){
        loadSchedule(j.schedule);
    }
}

class Time{

    constructor(arg){
        if(typeof arg === "undefined")
            this.minutes = 0;
        else if(typeof arg === "number")
            this.minutes = arg;
        else if(typeof arg === "string"){
            let [h,m] = arg.split(":");
            this.minutes = parseInt(m) + 60 * parseInt(h);
        }
    }

    toString(){
        let h = parseInt(this.minutes/60);
        let m = this.minutes%60;
        let date = new Date(0, 0, 0, h, m, 0, 0);

        let options = {hour: "numeric", minute: "numeric"};
        return new Intl.DateTimeFormat("fr-Fr", options).format(date);
    }

    add(t2){
        return new Time(this.minutes + t2.minutes);
    }

    between(tStart, tEnd){
        let afterStart = this.minutes >= tStart.minutes;
        let beforeEnd = this.minutes < tEnd.minutes;
        return afterStart && beforeEnd;

    }

    addOrPause(t2, pauses, slots){
        let nextTime = this.add(t2);
        pauses.forEach(pause => {
            let end = pause.start.add(pause.duration);
            if(nextTime.between(pause.start, end)){
                slots.push({time: nextTime.toString(),pause:true,matches:[]});
                nextTime = end;
            }
        });
        return nextTime;
    }

}