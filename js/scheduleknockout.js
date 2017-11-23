
let prescheduledKnockout = {phases: [], trees: []};

let labels = ["Fini", "Finale", "Demi-finale", "Quart de finale", "8e de finale", "16e", "32e"];

let MATCH_ID = 0;
class MatchNode{

    constructor(level, children, categoryIndex){
        this.level = level;
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
        else
            obj.qualifiedIndex = child.qualifiedIndex;
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
    let obj = $.extend({}, slot);
    if(slot.pause === undefined){
        obj.teamA = getTeamObj(slot.childA, slot);
        obj.teamB = getTeamObj(slot.childB, slot);
    }
    let matchElement = $(matchTemplate(obj));
    matchElement.data("match-id", obj.id);
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
    let lastSlot = SCHEDULE.qualif.slice(-1)[0];
    let lastSlotStart = new Time(lastSlot.time);
    // if the last slot is a pause, get the penultimate slot
    let lastMatch = lastSlot.pause ? SCHEDULE.qualif.slice(-2)[0] : lastSlot;
    MATCH_ID = lastMatch.id + 1;
    let knockoutStart = lastSlotStart.addOrPause(pauseBetween, pauses);
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
    });

    let phases = prescheduledKnockout.phases;
    let currentTime = knockoutStart.addOrPause(duration, pauses, {});
    for(let i = phases.length-1; i >= 0; i--){
        let matches = phases[i].slice(0);
        function addMatch(field, time){
            let match = matches.shift();
            match.field = field;
            match.time = time.toString();
            knockoutSlots.push(match);
        }
        while(matches.length){
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
            currentTime = currentTime.addOrPause(duration, pauses, knockoutSlots);
        }
    }


    $("#knockout-schedule input").prop("disabled", true);

    fillKnockoutSchedule(knockoutSlots);
    drawTrees(knockoutSlots);
}


function createCell(node, depth, categoryIndex){
    if(node.level === undefined) throw Error("weshh couz")
    let level = node.level-1;
    let colspan = Math.pow(2, depth - level);
    let cell = $("<td></td>")
        .attr("colspan", colspan)
        .addClass("level" + level)
        .data("node", node);
    if(node.seed){
        cell.addClass("seed");
    }else if(node.name !== undefined){
        cell.text(node.name);
    }else{
        if(node.id !== undefined){
            cell.text("Match "+node.id +" : "+labels[node.level]).addClass("text-muted");
        }else if(node.qualifiedIndex !== undefined){
            cell.text(getTeamPlaceholder(categoryIndex, node.qualifiedIndex)).addClass("text-muted")
        }
    }
    return cell;
}

function getChild(node, slots, childStr, depth){
    let child = node[childStr];
    // if child does not exist, create it if node is a seed-team or return nothing
    if(child === undefined){
        if(depth === node.level)
            return {level: node.level+1, seed: true};
        return;
    }
    // if child is a match, return it
    if(child.matchId !== undefined){
        return slots.find(slot => slot.id === child.matchId);
    }
    // if child is a team, add level and return it
    if(child.name || child.qualifiedIndex !== undefined)
        return $.extend(child, {level: node.level+1});
}

function getChildren(node, slots, depth){
    let children = [];
    ["childA","childB"].forEach(childStr => {
        let child = getChild(node, slots, childStr, depth);
        if(child)
            children.push(child);
    });
    return children;
}

function createCells(final, slots, categoryIndex){
    // Breadth-first traversing to add <td>s in order
    let heap = [final];
    let depth = final.depth;
    let cells = [];
    while(heap.length){
        let node = $.extend({},heap.shift());
        cells.push(createCell(node, depth, categoryIndex));
        heap = heap.concat(getChildren(node, slots, depth));
    }
    return cells;
}

function drawTree(cells, table){
    let tds = [];
    let level = 0;
    // regroup <td>s into <tr>s
    do{
        tds = cells.filter(td => td.hasClass("level" + level));
        let row = $("<tr></tr>").append(tds);
        table.prepend(row);
        level++;
    }while(tds.length);

}

function drawTrees(knockoutSlots){
    $("#knockout-table").empty();
    CONFIG.categories.forEach((category, index) => {
        let table = $("<table class='table table-sm table-bordered'></table>");
        $("#knockout-table").append(table);
        $("<h4>"+category.name+"</h4>").insertBefore(table);

        // get the matches of this category
        let categorySlots = knockoutSlots.filter(slot => slot.categoryIndex===index);
        // get the root/final of the tree
        let final = categorySlots.find(slot => slot.level===1);

        let cells = createCells(final, categorySlots, index);
        drawTree(cells, table);
    });
}