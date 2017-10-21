$(function(){

    // PAUSES

    let pauseTemplate = Handlebars.compile(
        $("#pause-template").html()
    );

    function addPause(data){
        $(".pauses-container")
            .removeClass("d-none")
            .append(pauseTemplate(data));
    }

    $("#addPause").click(addPause);

    $(".pauses-container").on("click", ".removePause", e => {
        $(e.target).closest(".pause").remove();
    });


    // CATEGORIES

    let categoryTemplate = Handlebars.compile(
        $("#category-template").html()
    );

    function addCategory(data){
        $("#addCategory").before(categoryTemplate(data));
    }

    $("#addCategory").click(addCategory);

    $("#configForm").on("click", ".removeCategory", e => {
        $(e.target).closest(".category").remove();
    });

    // FILL FORM

    let json = $("#configuration").data("config");

    if(json) fillFormFromJson(json);

    function fillFormFromJson(j){
        $("#name").val(j.name);
        $("#start").val(j.config.start);
        j.config.pauses.forEach(p => addPause(p));
        j.config.fields.forEach(f => {
            $("#fields").append(f + '\n');
        });
        j.config.categories.forEach(c => {
            c.teams = c.teams.reduce((t1,t2) => {
                return t1 + '\n' + t2;
            });
            addCategory(c);
        });
    }

    // FILL JSON

    // Tidy a textarea content and fill a list separating elements with linebreaks
    function getListFromTextarea(textarea){
        return $(textarea).val().split("\n").map(str => {
            return str.trim();
        }).filter(str => {
            return str.length > 0;
        });
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
        j.config.fields = getListFromTextarea('#fields');
        $(".category").each((i,elem) => {
            j.config.categories.push({
                name: $(elem).find(".categoryName").val(),
                teams: getListFromTextarea($(elem).find(".categoryTeams")),
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

    $("#saveConfig").click(e => {
        let json = fillJsonFromForm();
        // fill and click the hidden download link
        $('#hiddenDownloadLink').attr({
            href: 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(json,0,2)),
            download: json.name + '.json'
        })[0].click();
        // this [0] is necessary because the onclick event is not registered, we click the element, not the jQuery selection
    });

});