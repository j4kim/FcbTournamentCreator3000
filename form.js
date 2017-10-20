$(function(){

    // PAUSES

    let pauseTemplate = Handlebars.compile(
        $("#pause-template").html()
    );

    function addPause(data){
        $(".pauses-container")
            .removeClass("d-none")
            .append(pauseTemplate(data));
        $("#addPause").parent().addClass("offset-md-3");
    }

    $("#addPause").click(addPause);

    $(".pauses-container").on("click", ".removePause", e => {
        $(e.target).closest(".pause").remove();
        if($(".pause").length == 0){
            $("#addPause").parent().removeClass("offset-md-3");
            $(".pauses-container").addClass("d-none")
        }
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



});