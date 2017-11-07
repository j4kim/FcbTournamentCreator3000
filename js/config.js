// TEMPLATES

let pauseTemplate = getTemplate("pause");
let categoryTemplate = getTemplate("category");

function addPause(data){
    $(".pauses-container")
        .removeClass("d-none")
        .append(pauseTemplate(data));
}

function addCategory(data){
    let teams = listToString(data.teams);
    let cat = $.extend({}, data);
    cat.teams = teams;
    $("#addCategory").before(categoryTemplate(cat));
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
                rounds:1
            },
            knockout: {
                qualified: 4
            },teams:[]
        });
        $(".categoryName").focus();
    });

    $("#configForm").on("click", ".removeCategory", e => {
        $(e.target).closest(".category").remove();
    });

    $("#name").on("input", e => {
        document.title = document.getElementById("title").innerHTML  = e.target.value;
    });

    function setMax(elem, max){
        if(+elem.val() > max) elem.val(max);
        elem.attr("max", max);
    }

    $("#configForm").on("change", ".category textarea", e => {
        // clean textarea and get list
        let list = stringToList(e.target.value);
        if(list.length < 3) return;
        let categoryElem = $(e.target).closest(".category");
        categoryElem.find(".numElements").text(list.length);
        setMax(categoryElem.find(".qualified"), list.length);
        setMax(categoryElem.find(".qualifGroups"), parseInt(list.length/3));
        e.target.value = listToString(list);
    });
});