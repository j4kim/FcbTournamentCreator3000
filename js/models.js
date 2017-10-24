class Team{
    constructor(name){
        this.name = name;
        this.played = this.waiting = 0;
    }

    get priority(){
        return this.waiting - this.played;
    }
}

class Match{
    constructor(teams){
        // randomize first/second
        let r = Math.random() > .5 ? 0 : 1;
        this.teamA = teams[r];
        this.teamB = teams[1-r];
    }

    get priority(){
        return this.teamA.priority + this.teamB.priority;
    }
}

class Round{
    constructor(teams){
        let matchs = Round.makeMatchList(teams);
        console.log(matchs);
        this.schedule = this.makeSchedule(matchs);
    }

    static makeMatchList(teams) {
        let matchs = [];
        for (let i = 0; i < teams.length; i++) {
            for (let j = i + 1; j < teams.length; j++) {
                matchs.push(new Match([teams[i], teams[j]]));
            }
        }
        return shuffle(matchs);
    }

    makeSchedule(matchs) {
        let schedule = [];
        // empty the match list by popping the most important

    }
}

class Group{
    constructor(teams, rounds, name){
        console.log("new group", name, teams)
        let firstRound = new Round(teams);
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
            slices[i].push(teams.pop());
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
        let categories = [];
        for(let cat of config.categories){
            categories.push(new Category(cat));
        }

    }
}