console.log("[INFO][bm] REGISTERING MOD")
G.RegisterMod({
    name: "Basemod",
    version: "1.1.0",
    api: 1.0,
    release: "alpha",
    modid: "bm",
    parents: ["saving"]
});

console.log("[INFO][bm] Initializing Objects")

//Initialize Storage Objects
G.eotw = 0;

G.colony = {};
G.colony.adult = 0;
G.colony.elder = 0;
G.colony.young = 0;
G.colony.morale = 0;
G.colony.health = 0;
G.colony.overall = 0;
G.colony.name = "NO COLONY";
G.colony.modifierWork = 1;
G.colony.modifierHealth = 1;
G.colony.colorMorale = "rgb(255,255,0)";
G.colony.colorHealth = "rgb(255,255,0)";
G.colony.colorOverall = "rgb(255,255,0)";

G.jobs = {};
G.jobs.all = {};
G.jobs.unlocked = [];
G.jobs.template = function (name, id, count) {
    this.name = name
    this.id = id
    this.count = count
};

G.stats = {};
G.stats.xp = 0;
G.stats.level = 0;
G.stats.lvlup = 100;
G.stats.skillpts = 0;
G.stats.talentpts = 0;
G.stats.LevelUp = function () {
    var levels = 0;
    var skillgain = 0;
    var talentgain = 0;
    while (G.stats.xp > G.stats.lvlup) {
        levels++;
        G.stats.level++;
        G.stats.xp = G.stats.xp - G.stats.lvlup;
        G.stats.lvlup = Math.round(G.stats.lvlup * 1.5);
        G.stats.skillpts++;
        skillgain++;
        G.stats.talentpts++;
        talentgain++;
        if (G.stats.level % 2 == 0) {
            G.stats.skillpts++;
            skillgain++;
        };
    };
    if (levels > 0) {
        G.consoleOutput.push(G.c.c("#00dddd") + "You leveled up " + levels + " times! You gain " + skillgain + " skill points and " + talentgain + " talent points" + G.c.n)
    };
    G.modFunctions["bmStatsPanelUpdate"]();
};

G.evolution = {};
G.evolution.researches = [];
G.evolution.researchesResearched = [];
G.evolution.traits = [];
G.evolution.traitsEvolved = [];
G.evolution.skills = [];
G.evolution.skillsLearned = [];
G.evolution.talents = [];
G.evolution.talentsLearned = [];
G.evolution.research = {};
G.evolution.current = null;
G.evolution.research.progress = [0,0,0,0];
G.evolution.research.needed = [0,0,0,0];

console.log("[INFO][bm] Initializing Functions")

//Initialize Commands
G.RegisterCommand("Help", "shows information about different commands", "help", "help", function () {
    G.consoleOutput.push(G.c.c("#1155dd") + "Available Commands:" + G.c.n);
    for (const getCommandHelp of G.commands.unlocked) {
        G.consoleOutput.push("- " + G.commands.all[getCommandHelp].ref + " - " + G.commands.all[getCommandHelp].desc);
    };
}, true);
G.RegisterCommand("Version", "shows the version of modules that support it", "version", "version", function () {
    G.Broadcast("ccVersion");
}, true);
G.RegisterCommand("Testcommand", "this is a test command", "test", "test", function () {
    G.consoleOutput.push("This is a test command");
}, true);
G.RegisterCommand("Settle", "create a new settlement", "settle", "settle", function () {
    G.consoleOutput.push(G.c.c("#cc0088") + 
    "After months of searching, a suitable settlement spot has been found. Out of the survivors, you have 2 elderly, 10 adults, and 4 children citizens. You have to raise this colony by hand to get it to a thriving state." + 
    G.c.r("#cc8800") + "<br>Out of the chatoic mess, a colony name comes out. (Enter this now, you can change it later)" + G.c.n);
    G.listening = true;
    G.listeningTo = "bmSettlementName";
}, true);
G.RegisterCommand("Ascend", "ascend and abandon your colony", "ascend", "ascend", function () {
    G.consoleOutput.push(G.c.c("#dd00dd") + "DO YOU REALLY WANT TO ASCEND? (y/n)" + G.c.n);
    G.listening = true;
    G.listeningTo = "bmConfirmAscend";
});
G.RegisterCommand("Force End", "force end the game", "force_end", "force-end", function () {
    G.consoleOutput.push("GAME ENDED");
    G.Broadcast("ccEnd");
});
G.RegisterCommand("Dev Add Colonists", "cheat in some extra colonists", "dev_add_colony", "dev-add-colony", function () {
    G.consoleOutput.push("How many colonists to cheat in?");
    G.listening = true;
    G.listeningTo = "bmCheatColonists";
});
G.RegisterCommand("Dev Set Morale", "cheat by setting the morale value", "dev_set_morale", "dev-set-morale", function () {
    G.consoleOutput.push("What value to set morale to? (Previously " + G.colony.morale + ")");
    G.listening = true;
    G.listeningTo = "bmCheatMorale";
});
G.RegisterCommand("Dev Set Health", "chest by settings the health value", "dev_set_health", "dev-set-health", function () {
    G.consoleOutput.push("What value to set health to? (Previously " + G.colony.health + ")");
    G.listening = true;
    G.listeningTo = "bmCheatHealth";
});
G.RegisterCommand("Tick Game", "progress the game time by 1 year", "tick", "tick", function () {
    G.consoleOutput.push("1 Year has gone by...");
    G.eotw--;
    G.Broadcast("ccTick");
});

//Initialize Events
G.RegisterBroadcast("ccBegin", function () {
    G.colony.elder = 2;
    G.colony.adult = 10;
    G.colony.young = 4;
    G.eotw = 200;
    G.RemoveEntry(G.commands.unlocked, "settle");
    G.commands.hidden.push("force-end");
    G.commands.hidden.push("dev-add-colony");
    G.commands.hidden.push("dev-set-morale");
    G.commands.hidden.push("dev-set-health");
    G.commands.unlocked.push("ascend");
    G.commands.unlocked.push("tick");
    G.modFunctions["bmColonyPanelUpdate"]();
});
G.RegisterBroadcast("ccEnd", function () {
    G.colony.elder = 0;
    G.colony.adult = 0;
    G.colony.young = 0;
    G.eotw = 0;
    G.colony.name = "NO COLONY";
    G.commands.unlocked.push("settle");
    G.RemoveEntry(G.commands.hidden, "force-end");
    G.RemoveEntry(G.commands.hidden, "dev-add-colony");
    G.RemoveEntry(G.commands.hidden, "dev-set-morale");
    G.RemoveEntry(G.commands.hidden, "dev-set-health");
    G.RemoveEntry(G.commands.unlocked, "ascend");
    G.RemoveEntry(G.commands.unlocked, "tick");
    document.getElementById("colony").innerHTML = "-[COLONY INFO]-<br>NO ACTIVE COLONY";
});

G.RegisterBroadcast("ccVersion", function () {
    G.consoleOutput.push(G.c.c("#dd33dd") + "BASEMOD alpha 1.1.0" + G.c.n);
});

G.RegisterBroadcast("bmSettlementName", function (args) {
    G.consoleOutput.push(G.c.c("#dddd33") + "After much discussion, the colony name of " + args + " has been chosen." + G.c.n);
    G.colony.name = args;
    G.Broadcast("ccBegin");
});

G.RegisterBroadcast("bmConfirmAscend", function (args) {
    if (args == "y") {
        if (G.colony.adult + G.colony.elder + G.colony.young < 100) {
            G.consoleOutput.push(G.c.c("#ff4400") + "You did not grow your colony enough to gain experience." + G.c.n);
            G.Broadcast("ccEnd");
            return false
        };
        var xpgain = G.colony.adult + G.colony.elder + G.colony.young;
        xpgain = xpgain + G.evolution.researchesResearched.length * 25 + G.evolution.traitsEvolved.length * 25;
        G.stats.xp = G.stats.xp + xpgain;
        G.consoleOutput.push(G.c.c("#0077dd") + "You gained " + xpgain + " xp points!" + G.c.n)
        G.stats.LevelUp();
        return false
    };
    G.consoleOutput.push(G.c.c("#00afaf") + "Returning to your colony..." + G.c.n);
    return false
});

G.RegisterBroadcast("bmCheatColonists", function (args) {
    const cheatAmount = parseInt(args);
    if (isNaN(cheatAmount)) {
        G.consoleOutput.push(G.c.c("#ee0000") + "Colonist amount not a number" + G.c.n);
        return false
    };
    G.colony.adult = G.colony.adult + cheatAmount;
    G.consoleOutput.push(G.c.c("#00ee00") + "Successfully cheated colonists" + G.c.n);
    G.modFunctions["bmColonyPanelUpdate"]();
    return true
});
G.RegisterBroadcast("bmCheatMorale", function (args) {
    const cheatAmount = parseInt(args);
    if (isNaN(cheatAmount)) {
        G.consoleOutput.push(G.c.c("#ee0000") + "Morale amount not a number" + G.c.n);
        return false
    };
    console.log("[INFO][bm] SETTING MORALE AMOUNT");
    G.colony.morale = cheatAmount;
    G.modFunctions["bmConditionUpdate"]();
    G.modFunctions["bmColonyPanelUpdate"]();
    G.consoleOutput.push(G.c.c("#00ee00") + "Successfully cheated morale value" + G.c.n);
    return true
});
G.RegisterBroadcast("bmCheatHealth", function (args) {
    const cheatAmount = parseInt(args);
    if (isNaN(cheatAmount)) {
        G.consoleOutput.push(G.c.c("#ee0000") + "Helath amount not a number" + G.c.n);
        return false
    };
    console.log("[INFO][bm] SETTING HEALTH AMOUNT");
    G.colony.health = cheatAmount;
    G.modFunctions["bmConditionUpdate"]();
    G.modFunctions["bmColonyPanelUpdate"]();
    G.consoleOutput.push(G.c.c("#00ee00") + "Successfully cheated health value" + G.c.n);
    return true
});

//Initialize Functions
G.RegisterFunction("bmColonyPanelUpdate", function () {
    const colonyPanel = document.getElementById("colony");
    const colonyPopulation = G.colony.young + G.colony.adult + G.colony.elder;
    const writePanel =
        G.c.c("#0011ee") + "- [COLONY INFO] -<br>" + G.c.n +
        G.c.c("#0044bb") + "- The Colony of " + G.colony.name + " -<br>" + G.c.n +
        G.c.c("#00afaf") + "POPULATION: " + colonyPopulation + "<br>" + G.c.n +
        G.c.c("#00dd77") + "Children: " + G.colony.young + "<br>" + G.c.n +
        G.c.c("#77ee00") + "Adults: " + G.colony.adult + "<br>" + G.c.n +
        G.c.c("#aabb00") + "Elderly: " + G.colony.elder + "<br>" + G.c.n + 
        G.c.c("#bb00bb") + "OVERALL CONDITIONS: " + G.c.r(G.colony.colorOverall) + Math.round(G.colony.overall / 10) + "%<br>" + G.c.n + 
        G.c.c("#bb0000") + "Colony Health: " + G.c.r(G.colony.colorHealth) + Math.round(G.colony.health / 10) + "%<br>" + G.c.n + 
        G.c.c("#00bb00") + "Colony Morale: " + G.c.r(G.colony.colorMorale) + Math.round(G.colony.morale / 10) + "%" + G.c.n;
    colonyPanel.innerHTML = writePanel;
});

G.RegisterFunction("bmStatsPanelUpdate", function () {
    const statsPanel = document.getElementById("stats");
    const writePanel = 
        G.c.c("#0088ff") + "- [LEGACY STATS] -<br>" + G.c.n + 
        G.c.c("#00aaff") + "LEGACY LEVEL: " + G.stats.level + "<br>" + G.c.n + 
        G.c.c("#00ccee") + "Skill Points: " + G.stats.skillpts + "<br>" + G.c.n + 
        G.c.c("#00dddd") + "Talent Points: " + G.stats.talentpts + "<br>" + G.c.n + 
        G.c.c("#00eecc") + "XP: " + G.stats.xp + "/" + G.stats.lvlup + "<br>" + G.c.n + 
        G.c.c("#00ffaa") + G.GenBar(G.stats.xp, G.stats.lvlup, 25) + G.c.n;
    statsPanel.innerHTML = writePanel;
});

G.RegisterFunction("bmConditionUpdate", function () {
    G.colony.morale = Math.max(Math.min(G.colony.morale,2000),-2000)
    G.colony.health = Math.max(Math.min(G.colony.health,2000),-2000)
    G.colony.overall = Math.round((G.colony.morale + G.colony.health)/2)
    G.colony.modifierWork = 2 ** (G.colony.morale / 1000)
    G.colony.modifierHealth = 2 ** (G.colony.health / 1000)
    var subRMorale = 0
    var subGMorale = 0
    var subRHealth = 0
    var subGHealth = 0
    var subROverall = 0
    var subGOverall = 0
    if (G.colony.morale >= 0) {
        subRMorale = Math.round(255 * (G.colony.morale / 2000));
    } else {
        subGMorale = Math.round(255 * ((-G.colony.morale) / 2000));   
    };
    if (G.colony.health >= 0) {
        subRHealth = Math.round(255 * (G.colony.health / 2000));
    } else {
        subGHealth = Math.round(255 * ((-G.colony.health) / 2000))
    };
    if (G.colony.overall >= 0) {
        subROverall = Math.round(255 * (G.colony.overall / 2000));
    } else {
        subGOverall = Math.round(255 * ((-G.colony.overall) / 2000));
    };
    G.colony.colorMorale = "rgb(" + (255 - subRMorale) + "," + (255 - subGMorale) + ",0)";
    G.colony.colorHealth = "rgb(" + (255 - subRHealth) + "," + (255 - subGHealth) + ",0)";
    G.colony.colorOverall = "rgb(" + (255 - subROverall) + "," + (255 - subGOverall) + ",0)"; 
});

//Initialize Panels
G.InitializePanel("colony");
document.getElementById("colony").innerHTML = "-[COLONY INFO]-<br>NO ACTIVE COLONY";
document.getElementById("colony").style.textAlign = "center";

G.InitializePanel("stats");
document.getElementById("stats").style.textAlign = "center";
G.modFunctions["bmStatsPanelUpdate"]();

console.log("[INFO][bm] LOAD: BASEMOD ALPHA v1.1.0");
G.LoadMods();