var container = $("body > div");

function displayRanking(show){
    $("#rankings").toggleClass("flex").siblings().toggle()
    $("#rankings").parent().siblings().toggle();
    container.toggleClass("container");
}