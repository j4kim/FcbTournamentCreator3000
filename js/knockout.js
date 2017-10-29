
let labels = ["Fini", "Finale", "Demi-finale", "Quart de finale", "8e de finale", "16e", "32e"];

let prescheduledKnockout = {phases: [], categories: []};

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
    let n = 0;
    prescheduledKnockout.phases[level] = [];
    while(nodes.length){
        let children = [nodes.shift(), nodes.pop()];
        let node = new Node(level, children, categoryIndex, n++);
        prescheduledKnockout.phases[level].push(node);
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

function prescheduleKnockout() {
    console.log("prescheduling knockout", CONFIG);
    let pauseBetween = new Time(CONFIG.pauseBetween);
    let pauses = Time.convertPauses(CONFIG.pauses);
    let lastMatchStart = new Time(SCHEDULE.qualif.slice(-1)[0].time);
    let knockoutStart = lastMatchStart.addOrPause(pauseBetween, pauses);

    $("#knockout-table").empty();

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
            console.log(playoffParticipants + "/" + qualified + " teams participate to the " + labels[level + 1]);
            let playoffTeams = nodes.slice(-playoffParticipants);
            // associate playoff teams into nodes
            let playoffNodes = oppposeNodes(playoffTeams, level + 1, index);

            // remove the playoff teams and replace them by the nodes
            nodes.splice(seats - rest, rest * 2, ...playoffNodes);
        }

        let tree = createTree(nodes, level, index);
        tree.depth = depth;
        prescheduledKnockout.categories[index] = tree;

        addTree(tree, category);
        console.log(prescheduledKnockout);
    });

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