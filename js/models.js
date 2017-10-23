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
    constructor(teamA, teamB){
        this.teamA = teamA;
        this.teamB = teamB;
    }

    get priority(){
        return this.teamA.priority + this.teamB.priority;
    }
}

class Group{
    constructor(teams){
        this.teams = teams;
        this.matchs = [];
    }
}

class Category{
    constructor(config){
        this.config = config;
    }
}

class Schedule{
    constructor(){
        this.yolo = 12;
    }
}