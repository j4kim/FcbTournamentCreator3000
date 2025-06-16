


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
    config.pauseBetween = $("#pauseBetween").val();
    config.fields = stringToList($('#fields').val());
    $(".category").each((i,elem) => {
        config.categories.push({
            name: $(elem).find(".categoryName").val(),
            teams: stringToList($(elem).find(".categoryTeams").val()),
            qualif:{
                groups: parseInt($(elem).find(".qualifGroups").val()),
                rounds: parseInt($(elem).find(".qualifRounds").val()),
            },
            knockout:{
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
    if(SCHEDULE){
        j.schedule = SCHEDULE;
        j.config = CONFIG;
    }else{
        j.config = getConfig();
    }
    j.finalDisplay = $("#knockout input[type=checkbox]:checked").map((i, cb) => cb.name).toArray()
    j.iframeUrl = $("#iframeUrl").val();
    if (quill) {
        j.prologue = quill.getSemanticHTML().replaceAll(/((?:&nbsp;)*)&nbsp;/g, '$1 ')
    }
    return j;
}

let CONFIG;
let quill;

function loadJson(j){
    // empty form
    $("#name, #start, #fields").val("");
    $(".pause, .category").remove();

    if(j === undefined) return;

    initArrays(j.config, ["pauses","fields","categories"]);

    // fill form
    $("#name").val(j.name).trigger("input");
    $("#start").val(j.config.start);
    $("#matchDuration").val(j.config.matchDuration);
    j.config.pauses.forEach(p => addPause(p));
    $("#pauseBetween").val(j.config.pauseBetween);
    let fields = listToString(j.config.fields);
    $("#fields").val(fields);
    j.config.categories.forEach(c => {
        addCategory(c);
    });

    CONFIG = j.config;

    if(j.schedule){
        // cast generic object to class instance
        let schedule = Object.create(Schedule.prototype);
        schedule.groups = j.schedule.groups;
        schedule.qualif = j.schedule.qualif;
        schedule.knockout = j.schedule.knockout;
        schedule.computeWaitAverage(schedule.qualif);
        loadSchedule(schedule);
    }

    if (j.finalDisplay && j.finalDisplay.length) {
        j.finalDisplay.forEach(name => {
            $("#" + name).prop("checked", true)
            $("body").addClass(name)
        })
    }

    if (j.iframeUrl) {
        var $iframe = $("iframe")
        $iframe.attr("src", j.iframeUrl)
        $iframe.next().find("a").attr("href", j.iframeUrl)
        $("#iframeUrl").val(j.iframeUrl);
    }

    if (j.prologue) {
        $(".prologue").html(j.prologue)
    }
}


// Load file from the server
function loadConfig(){
    let file = document.body.dataset.file;
    if (!file) {
        if (!$("body").hasClass("admin")) {
            $("#title").append("Il n'y a rien ici 😔");
        }
        return
    };
    $.get("get.php?file=" + file).done(data => {
        loadJson(data.config);
        if (data.role) {
            $("body").addClass(data.role)
            $("#qualifTable input").prop("disabled", false);
            if (data.role === "admin") {
                quill = new Quill(".prologue.editor", {
                    theme: "snow",
                    modules: {
                        toolbar: {
                            container: [
                                ["bold", "italic", "underline", "strike"],
                                ["blockquote"],
                                ["clean"],
                                ["image"],
                            ],
                            handlers: {
                                image: function () {
                                    var range = this.quill.getSelection();
                                    const url = prompt("Image URL")
                                    if (url) {
                                        this.quill.insertEmbed(range.index, "image", url, "user");
                                    }
                                },
                            },
                        },
                    },
                });
                $(".prologue:not(.editor)").hide()
            }
        } else {
            setTimeout(loadConfig, 60 * 1000)
        }
    }).fail(error => {
        alert(error.responseText);
        loadJson();
    });
}

$(function(){

    loadConfig();

    if (window.location.hash === "#ranking") {
        displayRanking();
    }

    // Read tounament data from file input

    $("#file").change(e => {
        // thanks to https://stackoverflow.com/a/27523255/8345160
        let file = e.target.files[0];
        let reader = new FileReader();
        reader.onload = function(e) {
            loadJson(JSON.parse(reader.result));
            window.location = "#file=new"
        };
        reader.readAsText(file);
    }).click(e => e.target.value = null); // force change event if same file is reopen

    // Download file

    $("#download").click(e => {
        let json = getJson();
        json.name = json.name ? json.name : "tournoi";
        // fill and click the hidden download link
        $('#hiddenDownloadLink').attr({
            href: 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(json,0,2)),
            download: json.name + '.json'
        })[0].click();
        // this [0] is necessary because the onclick event is not registered,
        // we click the element, not the jQuery selection
    });

    // Store data on the server

    $("#save").click(e => {
        var config = getJson()
        $.post("save.php", {
            tournament: JSON.stringify(config)
        }).done(filename => {
            var btnContent = $("#save").html()
            $("#save").html("👍")
            $("title").text("👍")
            setTimeout(() => {
                $("#save").html(btnContent)
                $("title").text(document.getElementById("title").innerHTML) 
            }, 1000)
            var url = location.origin + location.pathname + '?file=' + config.name + '.json'
            history.replaceState({}, null, url);
        }).fail(error => {
            alert(error.responseText ?? "Error while saving");
        });
    });

    // disable if server is not reachable
    $.get("test.php").fail(error => {
        $("#save").prop("disabled", true).append("(serveur inaccessible)")
    });

    // update iframe
    setInterval(function(){
        var src = $("iframe").attr("src")
        var index = src.search(/&ts=\d+$/)
        if (index > 0) {
            src = src.substring(0, index)
        }
        src += "&ts=" + Date.now()
        $("iframe").attr("src", src)
    }, 2 * 60 * 1000)

    $("#knockout input[type=checkbox]").change(function() {
        $("body").toggleClass(this.id, $(this).prop('checked'))
    })
});

// listen to keyboard
$(window).keydown(function(e) {
    if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        $("#save").click();
    }

    if (e.ctrlKey && e.key === 'e') {
        const pwd = prompt("Mot de passe éditeur")
        $.post("set-editor-mode.php", { pwd }).done((data) => {
            $("body").addClass(data)
            $("#qualifTable input").prop("disabled", false);
        }).fail(error => {
            alert(error.responseText);
            $("body").removeClass("editor", "admin")
            $("#qualifTable input").prop("disabled", true);
        });
    }
});