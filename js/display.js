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