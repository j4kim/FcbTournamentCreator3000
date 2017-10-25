class Team{
    constructor(name){
        this.name = name;
        this.played = this.waiting = 0;
    }

    get priority(){
        return this.waiting - this.played;
    }

    toString(){
        return this.name;
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

    static compare(m1, m2){
        return m2.priority - m1.priority;
    }

    static testComparison(){
        let t1 = new Team("t1");
        let t2 = new Team("t2");
        let t3 = new Team("t3");
        let matchs = Round.makeMatchList([t1,t2,t3]);
        t1.played = 12;
        t2.waiting = 42;
        console.log("before sort");
        console.log(matchs[0].toString());
        console.log(matchs[1].toString());
        console.log(matchs[2].toString());
        matchs.sort(Match.compare);
        console.log("after");
        console.log(matchs[0].toString()); // should be t2-t3 (42)
        console.log(matchs[1].toString()); // t2-t1 (30)
        console.log(matchs[2].toString()); // t3-t1 (-13)
    }

    toString(){
        return this.teamA + " - " + this.teamB + " (" + this.priority + ")";
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
        let categories = [];
        for(let cat of config.categories){
            categories.push(new Category(cat));
        }
    }
}