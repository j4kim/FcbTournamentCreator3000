class Team{
    constructor(name){
        this.name = name;
        this.played = this.waiting = 0;
    }

    get priority(){
        return this.waiting - this.played;
    }

    playVirtually(){
        this.played++;
        this.waiting=0;
    }

    toString(){
        return this.name + " (" + this.waiting + " - " + this.played + ")";
    }
}

class Match{
    constructor(teams, group){
        // randomize first/second
        if(teams && teams.length === 2){
            let r = Math.random() > .5 ? 0 : 1;
            this.teamA = teams[r];
            this.teamB = teams[1-r];
        }
        this.group = group;
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

    static testComparison(){
        let t1 = new Team("t1");
        let t2 = new Team("t2");
        let t3 = new Team("t3");
        let m1 = new Match([t1,t2]);
        let m2 = new Match([t1,t3]);
        let m3 = new Match([t2,t3]);
        let matches = [m1,m2,m3];
        t1.played = 12;
        t2.waiting = 42;
        console.log("before sort");
        console.log(matches[0].toString());
        console.log(matches[1].toString());
        console.log(matches[2].toString());
        matches.sort(Match.compare);
        console.log("after");
        console.log(matches[0].toString()); // should be t2-t3 (42)
        console.log(matches[1].toString()); // t2-t1 (30)
        console.log(matches[2].toString()); // t3-t1 (-12)
        let chosen = matches.shift();
        return chosen === m3;
    }

    toString(){
        return this.teamA + " - " + this.teamB + " (" + this.priority + ")";
    }

    toJSON(){
        return {
            teams: [this.teamA.name, this.teamB.name]
        };
    }
}

class Group{
    constructor(teams, rounds, name){
        this.teams = teams;
        this.name = name;
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
}

class Category{
    constructor(obj){
        this.name = obj.name;
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
            this.groups.push(
                new Group(slice, rounds, this.name +" "+ (index+1))
            );
        }, this);
    }
}

class Schedule{
    constructor(config){
        // let categories = [];
        let groupSchedules = [];
        let numMatches = 0;
        for(let cat of config.categories){
            let category = new Category(cat);
            // categories.push(category);
            category.groups.forEach(group => {
                groupSchedules.push(group.schedule);
                numMatches += group.schedule.length;
            })
        }
        let qualifMatches = this.distributeMatches(groupSchedules, numMatches);
        console.log(qualifMatches);
        this.qualif = this.makeTimeSlots(qualifMatches, config);
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
        let pauses = config.pauses.map(p => {
            return {
                start: new Time(p.start),
                duration: new Time(p.duration)
            };
        });
        let fields = config.fields;
        let slots = [];

        // loop over time and matches to put them in time slots
        let currentTime = start;
        while(matches.length){
            let slot = {time:currentTime.toString(), matches:[]};
            let teams = [];
            for(let field of fields){
                if(matches.length === 0) break;
                let match = matches[0];
                // prevent a team from playing two games at the same time
                if(teams.includes(match.teamA) || teams.includes(match.teamB))
                    break;
                teams.push(match.teamA, match.teamB);
                match.field = field;
                slot.matches.push(match);
                matches.shift();
            }
            slots.push(slot);
            currentTime = currentTime.addOrPause(duration, pauses, slots);
        }
        return slots;
    }
}