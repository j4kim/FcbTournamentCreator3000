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