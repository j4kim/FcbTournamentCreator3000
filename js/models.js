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

class Round{

}

class Group{
    constructor(teams, name){
        console.log("new group", name, teams);
    }
}

class Category{
    constructor(obj){
        this.name = obj.name;
        // group formation
        let teams = shuffle(obj.teams, { 'copy': true });
        let slices = new Array(obj.qualif.groups);
        let i = 0;
        while(teams.length){
            if(!Array.isArray(slices[i]))
                slices[i] = [];
            slices[i].push(teams.pop());
            i++;
            i %= obj.qualif.groups;
        }
        this.groups = [];
        slices.forEach(function(slice, index){
            this.groups.push(new Group(slice, this.name +" "+ (index+1)));
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