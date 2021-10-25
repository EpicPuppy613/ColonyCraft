//Initialize Storage Objects
G.colony = {};
G.colony.adult = 0;
G.colony.elder = 0;
G.colony.young = 0;
G.colony.morale = 0;
G.colony.health = 0;
G.colony.modifierWork = 1;
G.colony.modifierHealth = 1;

G.jobs = {};
G.jobs.all = {};
G.jobs.unlocked = [];
G.jobs.template = function (name, id, count) {
    this.name = name
    this.id = id
    this.count = count
};

//Initialize Commands
G.RegisterCommand("Help", "shows information about different commands", "help", "help", function () {
    G.consoleOutput.push(G.c.c("1155dd") + "Available Commands:" + G.c.n);
    for (const getCommandHelp of G.commands.unlocked) {
        G.consoleOutput.push("- " + getCommandHelp.ref + " - " + getCommandHelp.desc);
    };
}, true)

//Initialize Events


console.log("LOAD: BASEMOD ALPHA v1.1.0");