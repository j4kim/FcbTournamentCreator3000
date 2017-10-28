
let labels = ["finished", "final", "semifinals", "quarterfinals", "eighth-finals", "16th-finals", "32nd-finals"];

class Node{
    constructor(level, categoryIndex, label, n){
        this.level = level;
        this.categoryIndex = categoryIndex;
        this.label = label;
        this.n = n;
    }
}

function createTree(nodes, level, categoryIndex){
    if(level == 0)
        // node is final
        return nodes;
    let parents = [];
    let n = 0;
    while(nodes.length){
        let label = CONFIG.categories[categoryIndex].name + " " + labels[level];
        if(level>1)
            label += " #"+(n+1); // write semifinals #1 / semifinals #2
        let node = new Node(level-1, categoryIndex, label, n++);
        node.children = [nodes.shift(), nodes.pop()];
        parents.push(node);
    }
    return createTree(parents, level-1, categoryIndex)
}

// make matches from teams -> last team vs first, second vs penultimate etc...
function createRoundMatches(teams, categoryIndex, level){
    if(teams.length%2 !== 0) throw Error("teams must be even");
    let matches = [];
    let i = 0;
    while(teams.length){
        let match = new Match([teams.shift(), teams.pop()]);
        match.level = level;
        match.index = i;
        match.categoryIndex = categoryIndex;
        match.label = CONFIG.categories[categoryIndex].name + " " + labels[level] + " #" + (++i);
        matches.push(match);
    }
    return matches;
}

function prescheduleKnockout(){
    console.log("prescheduling knockout", CONFIG);
    let pauseBetween = new Time(CONFIG.pauseBetween);
    let pauses = Time.convertPauses(CONFIG.pauses);
    let lastMatchStart = new Time(SCHEDULE.qualif.slice(-1)[0].time);
    let knockoutStart = lastMatchStart.addOrPause(pauseBetween, pauses);

    let matches = [];

    CONFIG.categories.forEach((category, index) => {
        let qualified = category.knockout.qualified;

        let fakeTeams = [];
        for(let i = 0; i < qualified; i++){
            fakeTeams.push({
                qualifiedIndex: i,
                name: category.name + "#" + (i+1)
            });
        }

        let level = parseInt(Math.log2(qualified));

        if(!isPowerOfTwo(qualified)){
            // the number of teams qualified for the 'level' fraction of final
            let seats = Math.pow(2, level);
            // the number of overflowing teams
            let rest = qualified - seats;
            // Schedule playoffs for the 2*rest last qualified teams
            console.log(rest*2 + "/" + qualified + " teams participate to the " + labels[level+1]);
            let playoffParticipants = fakeTeams.slice(-rest*2);
            matches = matches.concat(createRoundMatches(playoffParticipants, index, level+1));
        }

        let tree = createTree(fakeTeams, level, index);
        console.log(tree);

    });

    console.log(matches);
}