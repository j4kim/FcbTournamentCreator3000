
function preScheduleKnockout(){
    console.log("prescheduling knockout", CONFIG);
    let pauseBetween = new Time(CONFIG.pauseBetween);
    let pauses = Time.convertPauses(CONFIG.pauses);
    let lastMatchStart = new Time(SCHEDULE.qualif.slice(-1)[0].time);
    let knockoutStart = lastMatchStart.addOrPause(pauseBetween, pauses);

    CONFIG.categories.forEach(category => {
        let qualified = category.knockout.qualified;
        let level = parseInt(Math.log2(qualified));
        let labels = ["finished", "final", "semifinals", "quarterfinals", "eighth-finals", "16th-finals", "32nd-finals", "64th-finals"];
        let label = labels[level];
        // the number of teams qualified for the knockout
        let seats = Math.pow(2, level);
        let rest = qualified - seats;
        if(rest){
            // TODO:
            // schedule playoffs for the rest+1 last qualified teams
            // the playoff winner take the last "seat"
        }
        console.log(category.name, qualified, label);
    });
}