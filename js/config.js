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

    $("#configForm").on("input", ".qualified", e => {
        let warning = $(e.target).next(".warning");
        warning.removeClass("d-none");
        let n = e.target.value;
        // test if n is a power of 2
        if(n && (n & (n - 1)) === 0)
            warning.addClass("d-none");
    });
});