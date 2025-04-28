// https://github.com/uxitten/polyfill/blob/master/string.polyfill.js
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/padStart
if (!String.prototype.padStart) {
    String.prototype.padStart = function padStart(targetLength, padString) {
        targetLength = targetLength >> 0; //truncate if number, or convert non-number to 0;
        padString = String(typeof padString !== 'undefined' ? padString : ' ');
        if (this.length >= targetLength) {
            return String(this);
        } else {
            targetLength = targetLength - this.length;
            if (targetLength > padString.length) {
                padString += padString.repeat(targetLength / padString.length); //append to original to ensure we are longer than needed
            }
            return padString.slice(0, targetLength) + String(this);
        }
    };
}

function registerPartial(name){
    Handlebars.registerPartial(name, $("#" + name + "-partial").html());
}

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

class Time{

    constructor(arg){
        if(typeof arg === "undefined")
            this.minutes = 0;
        else if(typeof arg === "number")
            this.minutes = arg;
        else if(typeof arg === "string"){
            let [h,m] = arg.split(":");
            this.minutes = parseInt(m) + 60 * parseInt(h);
        }
        // 1440 minutes = one day
        this.minutes %= 1440;
    }

    toString(){
        let h = parseInt(this.minutes/60);
        let m = this.minutes%60;
        function pad(n){
            return (''+n).padStart(2,'0');
        }
        return pad(h)+':'+pad(m);
    }

    add(t2){
        return new Time(this.minutes + t2.minutes);
    }

    between(tStart, tEnd){
        let afterStart = this.minutes >= tStart.minutes;
        let beforeEnd = this.minutes < tEnd.minutes;
        return afterStart && beforeEnd;

    }

    addOrPause(t2, pauses, slots){
        let nextTime = this.add(t2);
        pauses.forEach(pause => {
            let end = pause.start.add(pause.duration);
            if(nextTime.between(pause.start, end)){
                if(slots)
                    slots.push({time: nextTime.toString(),pause:true,matches:[]});
                nextTime = end;
            }
        });
        return nextTime;
    }

    static convertPauses(pauses){
        return pauses.map(p => {
            return {
                start: new Time(p.start),
                duration: new Time(p.duration)
            };
        });
    }

}

function isPowerOfTwo(n){
    return n && (n & (n - 1)) === 0;
}


function mergeTimeSlots(table){
    let lastTime = "", rowspan = 1, first;
    table.find("td.time").each((index,elem) => {
        if($(elem).text() === lastTime){
            first.attr("rowspan", ++rowspan);
            $(elem).remove();
        }else{
            lastTime = $(elem).text();
            first = $(elem);
            rowspan = 1;
        }
    })
}

function average(array){
    if(array.length===0) return 0;
    let sum = array.reduce((a,b) => a + b);
    return sum/array.length;
}

function showDiffs(){
    $(`<style id="diffStyles">
        .diff-5{background:#f00}
        .diff-4{background:#f66}
        .diff-3{background:#faa}
        .diff-2{background:#fdd}

        .diff5{background:#0f0}
        .diff4{background:#6f6}
        .diff3{background:#afa}
        .diff2{background:#dfd}
    </style>`).appendTo("head");
}
function hideDiffs(){
    $("#diffStyles").remove();
}

// https://stackoverflow.com/questions/4467539/javascript-modulo-gives-a-negative-result-for-negative-numbers
function mod(n, m) {
    return ((n % m) + m) % m;
}

// https://www.freecodecamp.org/news/javascript-debounce-example/
function debounce(func, timeout = 500){
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => { func.apply(this, args); }, timeout);
    };
}