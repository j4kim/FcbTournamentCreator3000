$(function(){

    // TEMPLATES

    function getTemplate(name){
        return Handlebars.compile($("#" + name + "-template").html());
    }

    let pauseTemplate = getTemplate("pause");
    let categoryTemplate = getTemplate("category");

    // ADD/REMOVE PAUSES

    function addPause(data){
        $(".pauses-container")
            .removeClass("d-none")
            .append(pauseTemplate(data));
    }

    $("#addPause").click(e => {
        addPause({start:"12:00",duration:"00:30"});
        $(".pauseStart").focus();
    });

    $(".pauses-container").on("click", ".removePause", e => {
        $(e.target).closest(".pause").remove();
    });

    // ADD/REMOVE CATEGORY

    function addCategory(data){
        $("#addCategory").before(categoryTemplate(data));
    }

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

    // FILL FORM

    $("#file").change(e => {
        // thanks to https://stackoverflow.com/a/27523255/8345160
        let file = e.target.files[0];
        if (file.type === "application/json") {
            let reader = new FileReader();
            reader.onload = function(e) {
                fillFormFromJson(JSON.parse(reader.result));
            };
            reader.readAsText(file);
        } else {
            alert("Fichier non valide");
        }
    }).click(e => e.target.value = null); // force change event if same file is reopen

    // Parse url to download a config file
    let params = window.location.search;
    let file = new URLSearchParams(params).get("file");
    if(file){
        $.get("get.php" + params).done(data => {
            fillFormFromJson(JSON.parse(data));
        }).fail(error => {
            alert(error.responseText);
        });
    }

    function listToString(list){
        if (list.length === 0) return "";
        return list.reduce((t1,t2) => {
            return t1 + '\n' + t2;
        });
    }

    function fillFormFromJson(j){
        // empty form
        $("#name, #start, #fields").val("");
        $(".pause, .category").remove();

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

    $("#download").click(e => {
        let json = fillJsonFromForm();
        json.name = json.name ? json.name : "tournoi";
        // fill and click the hidden download link
        $('#hiddenDownloadLink').attr({
            href: 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(json,0,2)),
            download: json.name + '.json'
        })[0].click();
        // this [0] is necessary because the onclick event is not registered,
        // we click the element, not the jQuery selection
    });

    // SAVE ONLINE

    $("#save").click(e => {
        $.post("save.php", {
            tournament:fillJsonFromForm()
        }).done(filename => {
            window.location.search = "?file=" + filename;
        }).fail(error => {
            alert(error.responseText);
        });
    });

    // disable if server is not reachable
    $.get("test.php").fail(error => {
        $("#save").prop("disabled", true).append("(serveur inaccessible)")
    });

});