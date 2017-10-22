
function getTemplate(name){
    return Handlebars.compile($("#" + name + "-template").html());
}

function listToString(list){
    return list.join('\n');
}

// Tidy a multiline string and fill a list separating elements with linebreaks
function stringToList(str){
    return str.split("\n").map(line => {
        return line.trim();
    }).filter(line => {
        return line.length > 0;
    });
}

function initArray(object, arrayName){
    if(object[arrayName] === undefined)
        object[arrayName] = [];
}

function initArrays(object, arrayNamesArray){
    arrayNamesArray.forEach(arrayName => initArray(object, arrayName));
}
