G.RegisterMod({
    name: "Basemod",
    version: "1.1.0",
    api: 1.0,
    release: "alpha",
    modid: "bm",
    parents: []
});

//Initialize Storage Objects
console.log("[INFO][bm] Loading colony object")
G.colony = {};
G.colony.adult = 0;
G.colony.elder = 0;
G.colony.young = 0;
G.colony.morale = 0;
G.colony.health = 0;
G.colony.name = "";
G.colony.modifierWork = 1;
G.colony.modifierHealth = 1;

console.log("[INFO][bm] Loading jobs object")
G.jobs = {};
G.jobs.all = {};
G.jobs.unlocked = [];
G.jobs.template = function (name, id, count) {
    this.name = name
    this.id = id
    this.count = count
};

//Initialize Commands
console.log("[INFO][bm] Initializing commands")
G.RegisterCommand("Help", "shows information about different commands", "help", "help", function () {
    G.consoleOutput.push(G.c.c("1155dd") + "Available Commands:" + G.c.n);
    for (const getCommandHelp of G.commands.unlocked) {
        G.consoleOutput.push("- " + getCommandHelp.ref + " - " + getCommandHelp.desc);
    };
}, true);
G.RegisterCommand("Version", "shows the version of modules that support it", "version", "version", function () {
    G.Broadcast("ccVersion");
}, true);
G.RegisterCommand("Testcommand", "this is a test command", "test", "test", function () {
    G.consoleOutput.push("This is a test command");
}, true);
G.RegisterCommand("Settle", "create a new settlement", "settle", "settle", function () {
    G.consoleOutput.push(G.c.c("cc0088") + "After months of searching, a suitable settlement spot has been found. Out of the survivors, you have 2 elderly, 10 adults, and 4 children citizens. You have to raise this colony by hand to get it to a thriving state." + G.c.r("cc8800") + "<br>Out of the chatoic mess, a colony name comes out. (Enter this now, you can change it later)" + G.c.n);
    G.listening = true;
    G.listeningTo = "bmSettlementName";
    console.log("[INFO][bm] BEGIN listening")
}, true);

//Initialize Events
console.log("[INFO][bm] Initializing events")
G.RegisterBroadcast("ccBegin", function () {
    G.colony.elder = 2;
    G.colony.adult = 10;
    G.colony.young = 4;
});
G.RegisterBroadcast("ccEnd", function () {
    G.colony.elder = 0;
    G.colony.adult = 0;
    G.colony.young = 0;
});

G.RegisterBroadcast("ccVersion", function () {
    G.consoleOutput.push(G.c.c("dd33dd") + "BASEMOD alpha 1.1.0" + G.c.n);
});

G.RegisterBroadcast("bmSettlementName", function (args) {
    G.consoleOutput.push(G.c.c("dddd33") + "After much discussion, the colony name of " + args + " has been chosen." + G.c.n);
    G.colony.name = args;
    G.Broadcast("ccBegin");
    G.modFunctions["bmColonyPanelUpdate"]();
});

//Initialize Panels
G.InitializePanel("colony");
document.getElementById("colony").innerHTML = "-[COLONY INFO]-<br>NO ACTIVE COLONY";
document.getElementById("colony").style.textAlign = "center";

//Initialize Functions
console.log("[INFO][bm] Initializing functions")

G.RegisterFunction("bmColonyPanelUpdate", function () {
    const colonyPanel = document.getElementById("colony");
    const colonyPopulation = G.colony.young + G.colony.adult + G.colony.elder;
    var writePanel = 
    G.c.c("0011ee") + "- [COLONY INFO] -<br>" + G.c.n + 
    G.c.c("0044bb") + "- The Colony of " + G.colony.name + " -<br>" + G.c.n +
    G.c.c("00afaf") + "POPULATION: " + colonyPopulation + "<br>" + G.c.n + 
    G.c.c("00dd77") + "Children: " + G.colony.young + "<br>" + G.c.n +
    G.c.c("77ee00") + "Adults: " + G.colony.adult + "<br>" + G.c.n +
    G.c.c("aabb00") + "Elderly: " + G.colony.elder + G.c.n +
    G.c.c("00");
    colonyPanel.innerHTML = writePanel;
});

G.RegisterFunction("bmPopulationUpdate", function () {

});
G.RegisterFunction("bmRecalculateCondition", function () {

});

console.log("[INFO][bm] LOAD: BASEMOD ALPHA v1.1.0");