
let prescheduledKnockout = {phases: [], trees: []};

let labels = ["Fini", "Finale", "Demi-finale", "Quart de finale", "8e de finale", "16e", "32e"];

let MATCH_ID = 0;
class MatchNode{

    constructor(level, children, categoryIndex){
        this.level = level;
        // this.children = children;
        this.id = MATCH_ID++;
        children.forEach(child => child.parentId = this.id, this);
        this.childA = MatchNode.getChildObject(children[0]);
        this.childB = MatchNode.getChildObject(children[1]);
        this.categoryIndex = categoryIndex;
    }

    static getChildObject(child){
        let obj = {};
        if(child instanceof MatchNode)
            obj.matchId = child.id;
        else{
            // obj.placeholder = "team#"+child.qualifiedIndex;
            obj.qualifiedIndex = child.qualifiedIndex;
        }
        return obj;
    }

    get label(){
        return labels[this.level]
    }
}

// make parents nodes from children nodes, by opposing them
// first node vs last, second vs penultimate etc...
// returns a list of nodes half the size of the entry list
/*
    A,B,C,D
 -> A/D, B/C
 */
function createParentNodes(nodes, level, categoryIndex){
    if(nodes.length%2 !== 0)
        throw Error("nodes must be even");
    let parents = [];
    if(prescheduledKnockout.phases[level-1] === undefined)
        prescheduledKnockout.phases[level-1] = [];
    while(nodes.length){
        // pop first and last from node list, these are the children of the generated parent
        let children = [nodes.shift(), nodes.pop()];
        let node = new MatchNode(level, children, categoryIndex);
        prescheduledKnockout.phases[level-1].push(node);
        parents.push(node);
    }
    return parents;
}

// Create a tree from a power-of-2-length list
/*
    A,B,C,D,E,F,G,H    ordered teams           level 4
 -> AH, BG, CF, DE     quarterfinals nodes     level 3
 -> AH/DE, BG/CF       semifinals nodes        level 2
 -> AH/DE//BG/CF       final node returned     level 1
 */
function createTree(nodes, level, categoryIndex){
    if(level === 0)
        // node is final
        return nodes[0];
    if(!isPowerOfTwo(nodes.length))
        throw Error("nodes must be a power of two length array");
    let parents = createParentNodes(nodes, level, categoryIndex);
    return createTree(parents, level-1, categoryIndex)
}

function getTeamObj(child, slot){
    if(child.name !== undefined)
        return {name:child.name};
    if(child.matchId !== undefined)
        return {class:"text-muted", name:"Vainqueur match #"+child.matchId};
    if(child.qualifiedIndex !== undefined)
        return {
            class:"text-muted",
            name: getTeamPlaceholder(slot.categoryIndex, child.qualifiedIndex)
        }
}

function getMatchElement(slot){
    let obj = $.extend({first:true}, slot);
    obj.teamA = getTeamObj(slot.childA, slot);
    obj.teamB = getTeamObj(slot.childB, slot);
    let matchElement = $(matchTemplate(obj));
    matchElement.data("match-id",obj.id);
    return matchElement;
}

function addKnockoutMatch(slot){
    let matchElement = getMatchElement(slot);
    $("#knockout-schedule tbody").append(matchElement);
}

function addKnockoutPhase(level){
    let tr = $("<tr></tr>").addClass("slot table-info");
    let td = $("<td></td>").attr("colspan",6).text(labels[level]);
    $("#knockout-schedule tbody").append(tr.append(td));
}

function getTeamPlaceholder(categoryIndex, rank){
    let rankStr = rank===0 ? "1er" : (rank+1)+"ème";
    return rankStr + " catégorie " + CONFIG.categories[categoryIndex].name;
}


function mergeTimeSlots(table){
    let lastTime = "";
    let rowspan = 1;
    let first;
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

function fillKnockoutSchedule(knockoutSlots){
    $("#knockout-schedule .slot").remove();
    let level = -1;
    knockoutSlots.forEach(slot => {
        if(slot.pause){
            addKnockoutMatch(slot);
            return;
        }
        if(level !== slot.level){
            level = slot.level;
            addKnockoutPhase(level);
        }
        addKnockoutMatch(slot);
    });
    mergeTimeSlots($("#knockout-schedule"));
}

let knockoutSlots = [];

function prescheduleKnockout() {
    let pauseBetween = new Time(CONFIG.pauseBetween);
    let pauses = Time.convertPauses(CONFIG.pauses);
    let lastSlice = SCHEDULE.qualif.slice(-1)[0];
    let lastMatchStart = new Time(lastSlice.time);
    let lastMatchId = lastSlice.matches.slice(-1)[0].id;
    MATCH_ID = lastMatchId+1;
    let knockoutStart = lastMatchStart.addOrPause(pauseBetween, pauses);
    let duration = new Time(CONFIG.matchDuration);

    // reinit
    prescheduledKnockout.phases = [];
    knockoutSlots = [];

    CONFIG.categories.forEach((category, index) => {
        let qualified = category.knockout.qualified;

        let nodes = [];
        for (let i = 0; i < qualified; i++) {
            let team = {
                qualifiedIndex: i
            };
            nodes.push(team);
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
            let playoffNodes = createParentNodes(playoffTeams, level + 1, index);

            // remove the playoff teams and replace them by the nodes
            nodes.splice(seats - rest, rest * 2, ...playoffNodes);
        }

        let tree = createTree(nodes, level, index);
        tree.depth = depth;
        // completeTree(tree, depth, 0);
        prescheduledKnockout.trees[index] = tree;

    });

    let phases = prescheduledKnockout.phases;
    let currentTime = knockoutStart.addOrPause(duration, pauses, {});
    // let matchId = lastMatchId+1;
    for(let i = phases.length-1; i >= 0; i--){
        // slots.push(labels[i+1]);
        let matches = phases[i].slice(0);
        function addMatch(field, time){
            let match = matches.shift();
            match.field = field;
            match.time = time.toString();
            // match.id = matchId++;
            // slot.matches.push(match);
            knockoutSlots.push(match);
        }
        while(matches.length){
            // let slot = {time:currentTime.toString(), matches:[]};
            // final solo (one time slot by final)
            if(i === 0){
                addMatch(CONFIG.fields[0], currentTime);
            }else {
                for (let field of CONFIG.fields) {
                    if (matches.length === 0)
                        break;
                    addMatch(field, currentTime);
                }
            }
            // slots.push(slot);
            currentTime = currentTime.addOrPause(duration, pauses, knockoutSlots);
        }
    }

    fillKnockoutSchedule(knockoutSlots);

    $("#knockout-schedule input").prop("disabled", true);

    // drawTrees();

}

// function addCell(table, node){
//     let td = $("<td></td>")
//         .attr("colspan", node.colspan)
//         .addClass("level"+node.level)
//         .data("node", node)
//         .text(node.name);
//     if(node.name === undefined)
//         td.text(node.label).addClass("text-muted");
//     if(node.seed)
//         td.addClass("seed");
//     // nodes that have ids are matches
//     if(node.id !== undefined)
//         td.prepend("match " + node.id + ": ");
//     table.prepend(td);
// }
//
// // make the tree a complete tree till the last level
// function completeTree(node, depth, level){
//     node.colspan = Math.pow(2, depth-level);
//     if(level === depth)
//         return;
//     if(node.children === undefined)
//         node.children = [{seed:true},{seed:true}];
//     for(let child of node.children)
//         completeTree(child, depth, level+1);
// }
//
// function addTree(tree, category){
//     let table = $("<table class='table table-sm table-bordered'></table>");
//     $("#knockout-table").append(table);
//     $("<h4>"+category.name+"</h4>").insertBefore(table);
//     // Breadth-first traversing to add <td>s in order
//     let heap = [tree];
//     while(heap.length){
//         let node = heap.shift();
//         addCell(table, node);
//         if(node.children)
//             heap = heap.concat(node.children)
//     }
//     // regroup td into tr by their level class
//     let depth = tree.depth;
//     do{
//         let cells = table.find("td.level"+depth);
//         let row = $("<tr></tr>").append(cells);
//         table.append(row);
//     }while(depth--)
// }
//
// function drawTrees(){
//     $("#knockout-table").empty();
//     CONFIG.categories.forEach((category, index) => {
//         addTree(prescheduledKnockout.trees[index], category);
//     });
// }