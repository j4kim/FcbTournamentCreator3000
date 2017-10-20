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

    console.log($("#configuration").data("config"))

});