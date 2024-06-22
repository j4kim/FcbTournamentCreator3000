var container = $("body > div");
var displayRankingMode = false;
var reloadInterval;

function displayRanking(seconds){
    if(!seconds) seconds = 10;
    displayRankingMode = !displayRankingMode;
    $("body").toggleClass("ranking-mode", displayRankingMode)
    if(displayRankingMode){
        reloadInterval = setInterval(function(){
            console.log("reload");
            loadConfig();
        },seconds*1000)
    }else{
        clearInterval(reloadInterval)
    }
}

$(function(){
    $("#groups").on("click", "li", function(){
        if ($(this).hasClass("marked")) {
            $(".marked").removeClass("marked");
            return;
        }
        $(".marked").removeClass("marked");
        let mark = $(this).attr("data-mark");
        if (mark) {
            $(`[data-mark=${mark}]`).addClass("marked")
        }
    })
})