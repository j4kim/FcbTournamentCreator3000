
let labels = ["Fini", "Finale", "Demi-finale", "Quart de finale", "8e de finale", "16e", "32e"];

let prescheduledKnockout = {phases: [], trees: []};

class Node{
    constructor(level, children, categoryIndex, n){
        this.level = level;
        children.forEach(child => child.parent = this, this);
        this.children = children;
        this.categoryIndex = categoryIndex;
        this.n = n;
        this.label = labels[level];
    }
}

// make parents nodes from children nodes, by opposing them
// first node vs last, second vs penultimate etc...
// returns a list of nodes half the size of the entry list
function oppposeNodes(nodes, level, categoryIndex){
    if(nodes.length%2 !== 0)
        throw Error("nodes must be even");
    let parents = [];
    if(prescheduledKnockout.phases[level-1] === undefined)
        prescheduledKnockout.phases[level-1] = [];
    let n = 0;
    while(nodes.length){
        let children = [nodes.shift(), nodes.pop()];
        let node = new Node(level, children, categoryIndex, n++);
        prescheduledKnockout.phases[level-1].push(node);
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

function addKnockoutMatch(data){
    $("#knockout-schedule-table tbody").append(matchTemplate(data));
}

function addKnockoutSlot(slot){
    if(slot.pause){
        addKnockoutMatch(slot);
    }else if(typeof slot === "string"){
        let tr = $("<tr></tr>").addClass("slot table-info");
        let td = $("<td></td>").attr("colspan",6).text(slot);
        $("#knockout-schedule-table tbody").append(tr.append(td));
    }else{
        slot.matches[0].first = true;
        slot.matches[0].numMatches = slot.matches.length;
        slot.matches.forEach(match => {
            match.time = slot.time;
            addKnockoutMatch(match);
        })
    }
}

function fillKnockoutSchedule(slots){
    slots.forEach(slot => {
        addKnockoutSlot(slot);
    })
}

function prescheduleKnockout() {
    let pauseBetween = new Time(CONFIG.pauseBetween);
    let pauses = Time.convertPauses(CONFIG.pauses);
    let lastSlice = SCHEDULE.qualif.slice(-1)[0];
    let lastMatchStart = new Time(lastSlice.time);
    let knockoutStart = lastMatchStart.addOrPause(pauseBetween, pauses);
    let duration = new Time(CONFIG.matchDuration);

    // reinit
    $("#knockout-table").empty();
    $("#knockout-schedule-table .slot").remove();
    prescheduledKnockout.phases = [];

    CONFIG.categories.forEach((category, index) => {
        let qualified = category.knockout.qualified;

        let nodes = [];
        for (let i = 0; i < qualified; i++) {
            nodes.push({
                qualifiedIndex: i,
                label: category.name + "#" + (i + 1)
            });
        }

        let level = parseInt(Math.log2(qualified));
        let depth = level;

        if (!isPowerOfTwo(qualified)) {
            depth++;
            // the number of teams qualified for the 'level' fraction of final
            let seats = Math.pow(2, level);
            // the number of overflowing teams
            let rest = qualified - seats;
            let playoffParticipants = rest * 2;
            let playoffTeams = nodes.slice(-playoffParticipants);
            // associate playoff teams into nodes
            let playoffNodes = oppposeNodes(playoffTeams, level + 1, index);

            // remove the playoff teams and replace them by the nodes
            nodes.splice(seats - rest, rest * 2, ...playoffNodes);
        }

        let tree = createTree(nodes, level, index);
        tree.depth = depth;
        prescheduledKnockout.trees[index] = tree;

        addTree(tree, category);
    });

    let phases = prescheduledKnockout.phases;
    let slots = [];
    let currentTime = knockoutStart;
    for(let i = phases.length-1; i >= 0; i--){
        slots.push(labels[i+1]);
        let matches = phases[i].slice(0);
        while(matches.length){
            let slot = {time:currentTime.toString(), matches:[]};
            // finale solo
            if(i === 0){
                let match = matches.shift();
                match.field = CONFIG.fields[0];
                slot.matches.push(match);
            }else {
                for (let field of CONFIG.fields) {
                    if (matches.length === 0)
                        break;
                    let match = matches.shift();
                    match.field = field;
                    slot.matches.push(match);
                }
            }
            slots.push(slot);
            currentTime = currentTime.addOrPause(duration, pauses, slots);
        }
    }
    fillKnockoutSchedule(slots);

    console.log(prescheduledKnockout);


}

function addCell(table, node){
    let td = $("<td></td>")
        .attr("colspan", node.colspan)
        .addClass("level"+node.level)
        .addClass("text-muted")
        .data("node", node)
        .text(node.label);
    if(node.label === undefined)
        td.addClass("seed");
    table.prepend(td);
}

// make the tree a complete tree till the last level
function completeTree(node, depth, level){
    node.colspan = Math.pow(2, depth-level);
    node.level = level;
    if(level === depth)
        return;
    if(node.children === undefined)
        node.children = [{},{}];
    for(let child of node.children)
        completeTree(child, depth, level+1);
}

function addTree(tree, category){
    let table = $("<table class='table table-sm table-bordered'></table>");
    $("#knockout-table").append(table);
    $("<h4>"+category.name+"</h4>").insertBefore(table);
    completeTree(tree, tree.depth, 0);
    // Breadth-first traversing to add <td>s in order
    let heap = [tree];
    while(heap.length){
        let node = heap.shift();
        addCell(table, node);
        if(node.children)
            heap = heap.concat(node.children)
    }
    // regroup td in tr by their level class
    let depth = tree.depth;
    do{
        let cells = table.find("td.level"+depth);
        let row = $("<tr></tr>").append(cells);
        table.append(row);
    }while(depth--)
}