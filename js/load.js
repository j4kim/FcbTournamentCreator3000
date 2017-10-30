
$(function(){

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

    // Load file from the server

    function loadFileFromUrl(){
        // Make the hash string a query string
        let params = location.hash.replace(/#/, "?");
        // parse the query string and get the 'file' parameter
        let file = new URLSearchParams(params).get("file");
        // if there is one, download the file and fill the form
        if(file){
            if(file === "new") return;
            $.get("get.php" + params).done(data => {
                loadJson(JSON.parse(data));
            }).fail(error => {
                alert(error.responseText);
                window.location.hash = "";
                loadJson();
            });
        }else{
            loadJson();
        }
    }

    if(location.hash)
        loadFileFromUrl();

    $(window).on("hashchange", loadFileFromUrl);

    // Store data on the server

    $("#save").click(e => {
        $.post("save.php", {
            tournament:JSON.stringify(getJson())
        }).done(filename => {
            window.location = "#file=" + filename;
        }).fail(error => {
            alert(error.responseText);
        });
    });

    // disable if server is not reachable
    $.get("test.php").fail(error => {
        $("#save").prop("disabled", true).append("(serveur inaccessible)")
    });

});