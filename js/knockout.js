
let labels = ["finished", "final", "semifinals", "quarterfinals", "eighth-finals", "16th-finals", "32nd-finals"];

class Node{
    constructor(level, children, categoryIndex, n){
        this.level = level;
        this.children = children;
        this.categoryIndex = categoryIndex;
        this.n = n;
        this.label = CONFIG.categories[categoryIndex].name + " " + labels[level];
        if(level>1)
            this.label += " #"+(n+1); // write semifinals #1 / semifinals #2
    }
}

// make parents nodes from children nodes, by opposing them
// first node vs last, second vs penultimate etc...
// returns a list of nodes half the size of the entry list
function oppposeNodes(nodes, level, categoryIndex){
    if(nodes.length%2 !== 0)
        throw Error("nodes must be even");
    let parents = [];
    let n = 0;
    SCHEDULE.knockout.phases[level] = [];
    while(nodes.length){
        let children = [nodes.shift(), nodes.pop()];
        let node = new Node(level, children, categoryIndex, n++);
        SCHEDULE.knockout.phases[level].push(node);
        parents.push(node);
    }
    return parents;
}

function createTree(nodes, level, categoryIndex){
    if(level == 0)
        // node is final
        return nodes[0];
    let parents = oppposeNodes(nodes, level, categoryIndex);
    return createTree(parents, level-1, categoryIndex)
}

function prescheduleKnockout(){
    console.log("prescheduling knockout", CONFIG);
    let pauseBetween = new Time(CONFIG.pauseBetween);
    let pauses = Time.convertPauses(CONFIG.pauses);
    let lastMatchStart = new Time(SCHEDULE.qualif.slice(-1)[0].time);
    let knockoutStart = lastMatchStart.addOrPause(pauseBetween, pauses);

    CONFIG.categories.forEach((category, index) => {
        let qualified = category.knockout.qualified;
        SCHEDULE.knockout = {phases: []};

        let nodes = [];
        for(let i = 0; i < qualified; i++){
            nodes.push({
                qualifiedIndex: i,
                name: category.name + "#" + (i+1)
            });
        }

        let level = parseInt(Math.log2(qualified));
        console.log("level",level);
        if(!isPowerOfTwo(qualified)){
            // the number of teams qualified for the 'level' fraction of final
            let seats = Math.pow(2, level);
            // the number of overflowing teams
            let rest = qualified - seats;
            let playoffParticipants = rest*2;
            console.log(playoffParticipants + "/" + qualified + " teams participate to the " + labels[level+1]);
            let playoffTeams = nodes.slice(-playoffParticipants);
            // associate playoff teams into nodes
            let playoffNodes = oppposeNodes(playoffTeams, level+1, index);

            // remove the playoff teams and replace them by the nodes
            nodes.splice(seats-rest, rest*2, ...playoffNodes);
        }

        SCHEDULE.knockout.tree = createTree(nodes, level, index);
        console.log(SCHEDULE.knockout);
    });

}