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
    $(".category textarea").trigger("change")
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

    function setMax(elem, max){
        if(+elem.val() > max) elem.val(max);
        elem.attr("max", max);
    }

    $("#configForm").on("change", ".category textarea", e => {
        // clean textarea and get list
        let list = stringToList(e.target.value);
        let categoryElem = $(e.target).closest(".category");
        categoryElem.find(".numElements").text(list.length);
        setMax(categoryElem.find(".qualified"), list.length);
        setMax(categoryElem.find(".qualifGroups"), parseInt(list.length/3));
        e.target.value = listToString(list);
    });
});