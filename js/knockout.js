
function createRoundMatches(teams){
    if(teams.length%2 !== 0) throw Error("teams must be even");
    let schedule = [];
    while(teams.length){
        schedule.push(new Match([teams.shift(), teams.pop()]));
    }
    return schedule;
}

function prescheduleKnockout(){
    console.log("prescheduling knockout", CONFIG);
    let pauseBetween = new Time(CONFIG.pauseBetween);
    let pauses = Time.convertPauses(CONFIG.pauses);
    let lastMatchStart = new Time(SCHEDULE.qualif.slice(-1)[0].time);
    let knockoutStart = lastMatchStart.addOrPause(pauseBetween, pauses);

    let schedule = [];

    CONFIG.categories.forEach(category => {
        let qualified = category.knockout.qualified;

        let fakeTeams = [];
        for(let i = 0; i < qualified; i++){
            fakeTeams.push({
                qualifiedIndex: i,
                name: category.name + "#" + (i+1)
            });
        }

        let level = parseInt(Math.log2(qualified));
        let labels = ["finished", "final", "semifinals", "quarterfinals", "eighth-finals", "16th-finals", "32nd-finals"];
        let label = labels[level];
        // the number of teams qualified for the 'level' fraction of final
        let seats = Math.pow(2, level);
        // the number of overflowing teams
        let rest = qualified - seats;
        if(rest){
            // Schedule playoffs for the 2*rest last qualified teams
            console.log(rest*2 + "/" + qualified + " teams participate to the " + labels[level+1]);
            let playoffParticipants = fakeTeams.slice(-rest*2);
            schedule = schedule.concat(createRoundMatches(playoffParticipants));
        }
    });

    console.log(schedule);
}