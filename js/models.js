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
        let r = Math.random() > .5 ? 0 : 1;
        this.teamA = teams[r];
        this.teamB = teams[1-r];
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
        let matchs = [m1,m2,m3];
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
        console.log(matchs[2].toString()); // t3-t1 (-12)
        let chosen = matchs.shift();
        return chosen === m3;
    }

    toString(){
        return this.teamA + " - " + this.teamB + " (" + this.priority + ")";
    }
}

class Group{
    constructor(teams, rounds, name){
        this.teams = teams;
        console.log("New Group", name, teams);

        let matchs = this.makeMatchList(teams);
        this.firstRound = this.makeFirstRound(matchs);
        console.log("firstRound", this.firstRound);

        // let firstRound = new Round(teams);
    }

    wait(){
        this.teams.forEach(team => team.waiting++);
    }

    makeMatchList(teams) {
        let matchs = [];
        for (let i = 0; i < teams.length; i++) {
            for (let j = i + 1; j < teams.length; j++) {
                matchs.push(new Match([teams[i], teams[j]], this));
            }
        }
        return shuffle(matchs);
    }

    makeFirstRound(matchs) {
        let schedule = [];
        // empty the match list by popping the most important
        while(matchs.length){
            matchs.sort(Match.compare);
            let chosenMatch = matchs.shift();
            chosenMatch.playVirtually();
            schedule.push(chosenMatch);
        }
        return schedule;
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