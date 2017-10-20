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

    $("form").on("click", ".removeCategory", e => {
        $(e.target).closest(".category").remove();
    });

    // OPEN JSON FILE

    let json = $("#configuration").data("config");

    if(json) fillFormFromJson(json);

    // FILL FORM
    function fillFormFromJson(j){
        $("#name").val(j.name);
        $("#start").val(j.config.start);
        j.config.pauses.forEach(p => addPause(p));
        j.config.fields.forEach(f => {
            $("#fields").append(f + '\r\n');
        });
        j.config.categories.forEach(c => {
            c.teams = c.teams.reduce((t1,t2) => {
                return t1 + '\r\n' + t2;
            });
            addCategory(c);
        });
    }

    // FILL JSON

    function fillJsonFromForm(){}

});