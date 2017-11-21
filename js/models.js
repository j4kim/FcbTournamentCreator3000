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
        this.played = this.difference = this.won = this.drawn = this.lost = 0;
    }

    playMatch(goalsFor, goalsAgainst){
        this.played++;
        this.difference += (goalsFor - goalsAgainst);
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
        if(pointDifference === 0)
            return t2.difference - t1.difference;
        return pointDifference;
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
            teamWait: this.teamWait
        };
    }
}

// let groupId = 0;

class Group{
    constructor(teams, rounds, name, category){
        this.teams = teams;
        this.name = name;
        this.categoryIndex = category.index;
        // this.id = groupId++;
        console.log("New Group", name, teams);

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

        console.log("schedule", this.schedule);
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
        console.log(qualifMatches);
        this.qualif = this.makeTimeSlots(qualifMatches, config);
        this.equilibrate(this.qualif);
    }

    distributeMatches(matchGroups, numMatches){
        let schedule = new Array(numMatches);
        matchGroups.forEach(matchGroup => {
            let ratio = numMatches / matchGroup.length;
            matchGroup.forEach((match, index) => {
                let newIndex = parseInt(index * ratio);
                // find the first empty slot after this index
                while(schedule[newIndex] !== undefined){
                    newIndex = (newIndex+1)%numMatches;
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
                [match.teamA, match.teamB].forEach(t => {
                    let group = this.groups
                        .find(group => group.index === t.groupIndex);
                    let team = group.teams.find(team => team.index === t.index)
                    team.matchIds.push(match.id);
                });
                slots.push(match);
                matches.shift();
            }
            timeUnit++;
            currentTime = currentTime.addOrPause(duration, pauses, slots);
        }

        return slots;
    }

    equilibrate(slots){
        this.groups.forEach(group => {
            let teamWaitUnisAverages = [];
            group.teams.forEach(team => {
                let last, teamWaitUnits=[];
                team.matchIds.forEach(matchId => {
                    let match = this.qualif.find(match => match.id === matchId);
                    if(last !== undefined){
                        let waitUnits = match.timeUnit - last;
                        teamWaitUnits.push(waitUnits);
                        if(match.teamWait === undefined) match.teamWait = [];
                        match.teamWait.push(waitUnits)
                    }
                    last = match.timeUnit;
                });
                console.log(team.name, average(teamWaitUnits));
                teamWaitUnisAverages.push(average(teamWaitUnits));
            });
            console.log(">>", group.name, average(teamWaitUnisAverages));
            group.waitAverage = Math.round(average(teamWaitUnisAverages));
        });
        this.qualif.forEach(slot => {
            if(slot.pause || slot.teamWait === undefined) return;
            slot.matchClasses = "";
            let group = this.groups[slot.group.index];
            slot.teamWait.forEach(waitUnits => {
                // todo: ajouter la taille du retard
                if(waitUnits > group.waitAverage+1){
                    slot.matchClasses += "late ";
                }else if(waitUnits < group.waitAverage-1){
                    slot.matchClasses += "advance ";
                }
            })
        })
    }
}