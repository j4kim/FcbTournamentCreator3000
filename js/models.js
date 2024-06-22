// let teamId = 0;

class Team{
    constructor(name){
        this.name = name;
        this.matchIds = [];
        this.played = this.waiting = 0;
    }

    get priority(){
        return this.waiting - this.played;
    }

    playVirtually(){
        this.played++;
        this.waiting=0;
    }

    reinit(){
        this.played = this.difference = this.totalGoalsFor = this.won = this.drawn = this.lost = 0;
    }

    playMatch(goalsFor, goalsAgainst){
        this.played++;
        this.difference += (goalsFor - goalsAgainst);
        this.totalGoalsFor += goalsFor
        if(goalsFor < goalsAgainst)
            this.lost++;
        else if(goalsFor === goalsAgainst)
            this.drawn++;
        else
            this.won++;

    }

    get points(){
        return this.won*3 + this.drawn;
    }

    toString(){
        // return this.name + " (" + this.waiting + " - " + this.played + ")";
        return this.name;
    }

    toJSON(){
        return {
            name: this.name,
            index: this.index,
            groupIndex: this.groupIndex,
            matchIds: this.matchIds
        };
    }

    static compare(t1, t2){
        let pointDifference = t2.points - t1.points;
        if (pointDifference !== 0) return pointDifference

        let diffDiff = t2.difference - t1.difference
        if (diffDiff !== 0) return diffDiff

        return t2.totalGoalsFor - t1.totalGoalsFor
    }
}

// let matchId = 0;

class Match{
    constructor(teams, group){
        // randomize first/second
        if(teams && teams.length === 2){
            let r = Math.random() > .5 ? 0 : 1;
            this.teamA = teams[r];
            this.teamB = teams[1-r];
        }
        this.group = group;
        // this.id = matchId++;
    }

    get priority(){
        return this.teamA.priority + this.teamB.priority;
    }

    playVirtually(){
        this.group.wait();
        this.teamA.playVirtually();
        this.teamB.playVirtually();
    }

    static compare(m1, m2){
        return m2.priority - m1.priority;
    }

    toString(){
        return this.teamA + " - " + this.teamB + " (" + this.priority + ")";
    }

    toJSON(){
        return {
            id: this.id,
            teamA: this.teamA,
            teamB: this.teamB,
            field: this.field,
            time: this.time,
            timeUnit: this.timeUnit,
            scoreA: this.scoreA,
            scoreB: this.scoreB,
            group: {index: this.group.index},
            teamWait: this.teamWait,
            matchClasses: this.matchClasses
        };
    }
}

// let groupId = 0;

class Group{
    constructor(teams, rounds, name, category){
        this.teams = teams;
        this.name = name;
        this.categoryIndex = category.index;

        let matches = this.makeMatchList(teams);
        let firstRound = this.makeFirstRound(matches);
        rounds--;
        this.schedule = [].concat(firstRound);

        let lastRound = firstRound;
        while(rounds > 0){
            let nextRound = this.makeNextRound(lastRound);
            this.schedule = this.schedule.concat(nextRound);
            lastRound = nextRound;
            rounds--;
        }

        this.teams.forEach(team => {
            delete team.waiting;
            delete team.played;
        });
    }

    wait(){
        this.teams.forEach(team => team.waiting++);
    }

    makeMatchList(teams) {
        let matches = [];
        for (let i = 0; i < teams.length; i++) {
            for (let j = i + 1; j < teams.length; j++) {
                matches.push(new Match([teams[i], teams[j]], this));
            }
        }
        return shuffle(matches);
    }

    makeFirstRound(matches) {
        let schedule = [];
        // empty the match list by popping the most important
        while(matches.length){
            matches.sort(Match.compare);
            let chosenMatch = matches.shift();
            chosenMatch.playVirtually();
            schedule.push(chosenMatch);
        }
        return schedule;
    }

    makeNextRound(lastRound){
        let nextRound = [];
        lastRound.forEach(pastMatch => {
            // copy match inverting team order
            let newMatch = new Match();
            newMatch.teamB = pastMatch.teamA;
            newMatch.teamA = pastMatch.teamB;
            newMatch.group = pastMatch.group;
            nextRound.push(newMatch);
        });
        return nextRound;
    }

    toJSON(){
        return {
            name: this.name,
            teams: this.teams,
            index: this.index,
            categoryIndex: this.categoryIndex,
            waitAverage: this.waitAverage
        };
    }
}

class Category{
    constructor(obj, index){
        this.name = obj.name;
        this.index = index;
        this.formGroups(obj.teams, obj.qualif.groups, obj.qualif.rounds);
    }

    formGroups(teams, groups, rounds){
        // randomize teams array and form groups
        teams = shuffle(teams, { 'copy': true })
        // empty array
        let slices = new Array(groups);
        let i = 0;
        // distribute teams one by one until there are no more
        while(teams.length){
            if(!Array.isArray(slices[i]))
                slices[i] = [];
            slices[i].push(new Team(teams.pop()));
            i++;
            i %= groups;
        }
        // create Groups from the team slices
        this.groups = [];
        slices.forEach(function(slice, index){
            let teamIndex = 0;
            slice.forEach(team => {
                team.index = teamIndex++;
            });
            this.groups.push(
                new Group(slice, rounds, this.name +" "+ (index+1), this)
            );
        }, this);
    }
}

class Schedule{
    constructor(config){
        let groupSchedules = [];
        this.groups = [];
        let numMatches = 0;
        let groupIndex = 0;
        let categoryIndex = 0;
        for(let cat of config.categories){
            let category = new Category(cat, categoryIndex++);
            category.groups.forEach(group => {
                group.index = groupIndex++;
                group.teams.forEach(team => team.groupIndex = group.index);
                this.groups.push(group);
                groupSchedules.push(group.schedule);
                numMatches += group.schedule.length;
            })
        }
        let qualifMatches = this.distributeMatches(groupSchedules, numMatches);

        this.qualif = this.makeTimeSlots(qualifMatches, config);
        this.qualif = this.homogenize(this.qualif);
    }

    distributeMatches(matchGroups, numMatches){
        // 1, -2, 3, -4...
        function next(n){
            n = -n; // change sign
            return n>0 ? n+1 : n-1; // add -1 or 1
        }

        // shuffle(matchGroups);
        let schedule = new Array(numMatches);
        matchGroups.forEach(matchGroup => {
            let ratio = numMatches / matchGroup.length;
            matchGroup.forEach((match, index) => {
                let newIndex = ((index+1)*ratio + index*ratio)/2;
                newIndex = parseInt(newIndex);
                let direction = shuffle([-1,1])[0];
                while(schedule[newIndex] !== undefined){
                    newIndex = mod((newIndex+direction), numMatches);
                    direction = next(direction);
                }
                schedule[newIndex] = match;
            })
        });
        return schedule;
    }

    makeTimeSlots(matches, config){
        // convert from string to Time objects
        let start = new Time(config.start);
        let duration = new Time(config.matchDuration);
        let pauses = Time.convertPauses(config.pauses);
        let fields = config.fields;
        let slots = [];
        let matchId = 1;

        // loop over time and matches to put them in time slots
        let currentTime = start;
        let timeUnit = 1;
        while(matches.length){
            let teams = [];
            for(let field of fields){
                if(matches.length === 0) break;
                let match = matches[0];
                // prevent a team from playing two games at the same time
                if(teams.includes(match.teamA) || teams.includes(match.teamB))
                    break;
                teams.push(match.teamA, match.teamB);
                match.field = field;
                match.time = currentTime.toString();
                match.timeUnit = timeUnit;
                match.id = matchId++;
                slots.push(match);
                matches.shift();
            }
            timeUnit++;
            currentTime = currentTime.addOrPause(duration, pauses, slots);
        }

        return slots;
    }

    homogenize(slots){
        this.computeWaitAverage(slots);
        let oldReport = this.controlTimingBalance(slots);
        let bestReport = oldReport;
        let newSlots;
        let bestSlots = slots;

        let failures = 0;
        for(let i=0; i<1000; i++){
            newSlots = this.grandSwapping(slots, oldReport);
            this.computeWaitAverage(newSlots);
            let newReport = this.controlTimingBalance(newSlots);
            if(betterReport(newReport, bestReport)){
                bestSlots = newSlots;
                bestReport = newReport;
                failures = 0;
            }else{
                if(++failures > 10) break;
            }
            oldReport = newReport;
            slots = newSlots;
        }
        this.score = bestReport;
        return bestSlots;
    }

    /**
     * copy slots and swap the most critically misplaced matches
     * @param oldSlots: match list
     * @param report: a 4 values array [diffMin, diffMax, diffMinCount, diffMaxCount...]
     * @returns {Array|*} the new slots containing the swapped matches
     */
    grandSwapping(oldSlots, report){
        let slots = oldSlots.map(slot => $.extend({}, slot));
        let [diffMin, diffMax, diffMinCount, diffMaxCount] = report;

        let direction = 1;
        if(diffMin < -diffMax || (diffMin === diffMax && diffMinCount > diffMaxCount)){
            direction = -1;
        }
        let criticalDiff = direction > 0 ? diffMax : diffMin;
        let criticals = slots.filter(slot => slot.diff === criticalDiff);

        criticals.forEach(criticalSlot => {
            let candidates = [];
            let level = 1;
            do{
                candidates = slots.filter(slot =>{
                    if(direction > 0){
                        return slot.diff <= level && slot.timeUnit === criticalSlot.timeUnit + level;
                    }else{
                        return slot.diff >= level && slot.timeUnit === criticalSlot.timeUnit - level;
                    }
                });
                level++;
            }while(candidates.length === 0 && level < 4);

            if(candidates.length === 0) // tant pis
                return;

            let chosen = candidates.sort((a,b) => direction*(a.diff - b.diff))[0];

            this.swap(criticalSlot, chosen, slots)
        });

        return slots;
    }

    swap(slotA, slotB, slots){
        // todo: s'assurer qu'on peut faire ce swap
        // return the match data of a slot, what defines a match is teams and group
        function getData(slot){
            return {teamA: slot.teamA, teamB:slot.teamB, group:slot.group }
        }
        // slotA -> tmp
        // slotB -> slotA
        // tmp -> slotB
        let tmp = getData(slotA);
        $.extend(slotA, getData(slotB));
        $.extend(slotB, tmp);
    }

    computeWaitAverage(slots){
        if(slots === undefined) slots = this.qualif;
        // reinit wait gaps
        slots.forEach(slot => slot.waitGaps = undefined);
        // for each team, iterate over its matches and compute the wait gaps between them
        this.groups.forEach((group, groupIndex) => {
            let teamWaitUnisAverages = [];
            group.teams.forEach((team, teamIndex) => {
                let teamMatches = slots
                    .filter(slot => slot.pause === undefined)
                    .filter(match => {
                        // test if team is one of this match teams
                        return ["teamA","teamB"].some(team =>
                            match[team].index===teamIndex && match[team].groupIndex===groupIndex);
                    });
                let last, teamWaitUnits=[];
                teamMatches.forEach(match => {
                    if(last !== undefined){
                        let waitUnits = match.timeUnit - last;
                        teamWaitUnits.push(waitUnits);
                        if(match.waitGaps === undefined) match.waitGaps = [];
                        match.waitGaps.push(waitUnits)
                    }
                    last = match.timeUnit;
                });
                teamWaitUnisAverages.push(average(teamWaitUnits));
            });
            group.waitAverage = Math.round(average(teamWaitUnisAverages));
        });
    }

    controlTimingBalance(slots){
        if(slots === undefined) slots = this.qualif;
        // mark late or advance on each match
        let criticalLate = 0;
        let criticalAdvance = 0;
        let diffMin = 0, diffMax = 0, diffs = [];
        slots.forEach(slot => {
            if(slot.pause || slot.waitGaps === undefined) return;
            slot.matchClasses = "";
            slot.diff = 0;
            let group = this.groups[slot.group.index];
            slot.waitGaps.forEach(waitGap => {
                let waitDiff = group.waitAverage - waitGap;
                slot.diff += waitDiff;
                if(waitDiff === 0){
                    slot.matchClasses += " ontime";
                }else if(waitDiff < 0){
                    slot.matchClasses += " late"+(-waitDiff);
                    criticalLate = waitDiff < criticalLate ? waitDiff : criticalLate;
                }else if(waitDiff > 0){
                    slot.matchClasses += " advance"+waitDiff;
                    criticalAdvance = waitDiff > criticalAdvance ? waitDiff : criticalAdvance;
                }
            });
            if(Math.abs(slot.diff) > 0)
                slot.matchClasses += " diff"+slot.diff;
            diffMin = slot.diff < diffMin ? slot.diff : diffMin;
            diffMax = slot.diff > diffMax ? slot.diff : diffMax;
            diffs.push(slot.diff);
        });
        let diffAverage = average(diffs.map(diff => Math.abs(diff)));
        let diffMinCount = diffs.filter(diff => diff === diffMin).length;
        let diffMaxCount = diffs.filter(diff => diff === diffMax).length;
        return [diffMin, diffMax, diffMinCount, diffMaxCount, criticalLate, criticalAdvance, diffAverage];
    }
}