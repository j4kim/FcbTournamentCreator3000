var container = $("body > div");
var displayRankingMode = false;
var reloadInterval;

function displayRanking(seconds){
    if(!seconds) seconds = 60;
    displayRankingMode = !displayRankingMode;
    $("#rankings").toggleClass("flex").siblings().toggle()
    $("#rankings").parent().siblings().toggle();
    container.toggleClass("container");
    if(displayRankingMode){
        reloadInterval = setInterval(function(){
            console.log("reload");
            loadFileFromUrl();
        },seconds*1000)
    }else{
        clearInterval(reloadInterval)
    }
}