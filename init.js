//Debugging tool
//try {
//Initialize Game
G = {}

//Initialize Element Variables
G.gameConsole = document.getElementById("console");
G.gamePanels = document.getElementById("panels");
G.inputBox = document.getElementById("commandInput");
G.consoleHeight = document.getElementById("consoleHeight");
G.panelHeight = document.getElementById("panelHeight");
G.modLoader = document.getElementById("modLoading");
G.listening = false;
G.listeningTo = "";
G.modFunctions = {};
G.commandDirectory = {};
G.commands = {};
G.commands.unlocked = [];
G.commands.all = {};
G.broadcastDirectory = {};
G.consoleOutput = [];

//Initialize Modlists
G.initializedMods = [];
G.modList = ["/basemod.js"];

//Initialize Color Engine
G.c = { 
    n: "</span>", 
    c: function (color) { return '<span style="color: #' + color + ';">'; } ,
    r: function (color) { return '</span><span style="color: #' + color + ';">'; }
}

//Initialize General Functions
G.UpdateConsole = function () {
    var currentConsole = "";
    var firstLine = true;
    for (line of G.consoleOutput) {
        if (!firstLine) {
            currentConsole = currentConsole + "<br>"
        }
        currentConsole = currentConsole + line
        firstLine = false;
    };
    G.gameConsole.innerHTML = currentConsole;
    G.gameConsole.scrollTop = G.gameConsole.scrollHeight;
};
G.InitializePanel = function (panelName) {
    var newPanelContent = "";
    newPanelContent = G.gamePanels.innerHTML;
    newPanelContent = newPanelContent + '<panel class="panel" id="' + panelName + '"></panel>';
    G.gamePanels.innerHTML = newPanelContent;
};
G.UpdateSettings = function () {
    const panels = document.getElementsByClassName("panel");
    const newConsoleHeight = consoleHeight.value;
    const newPanelHeight = panelHeight.value;
    G.gameConsole.style.minHeight = newConsoleHeight + "rem";
    G.gameConsole.style.maxHeight = newConsoleHeight + "rem";
    G.gamePanels.style.minHeight = newPanelHeight + "rem";
    G.gamePanels.style.maxHeight = newPanelHeight + "rem";
    for (var i = 0; i < panels.length; i++) {
        panels[i].style.maxHeight = newPanelHeight + "rem";
    }
};
G.LoadMods = function () {
    for (mod of G.modList) {
        try {
            console.log("[INFO] LOADING MOD: " + mod)
            import(mod);
        } catch (err) {
            console.log(err.stack);
        };
    };
    G.consoleOutput.push("----------<br>" + G.c.c("0099bf") + "ColonyCraft Closed WEB TEST 1.1.0" + G.c.n)
    G.UpdateConsole()
};
G.RegisterCommand = function (name, desc, id, ref, commandFunction, unlocked = false) {
    newCommand = {}
    newCommand.name = name
    newCommand.id = id
    newCommand.ref = ref
    newCommand.desc = desc
    G.commands.all[ref] = newCommand
    if (unlocked) {
        G.commands.unlocked.push(newCommand)
    }
    G.commandDirectory[newCommand.ref] = commandFunction
};
G.RegisterBroadcast = function (broadcast, broadcastFunction) {
    if (G.broadcastDirectory[broadcast] == undefined) {
        G.broadcastDirectory[broadcast] = [];
    };
    G.broadcastDirectory[broadcast].push(broadcastFunction);
};
G.RunCommand = function (command) {
    var success = false;
    for (i = 0; i < G.commands.unlocked.length; i++) {
        if (command == G.commands.unlocked[i].id) {
            success = true;
            console.log("[INFO] RUNCOMMAND: " + command)
            try {
                G.commandDirectory[command]();
            } catch (err) {
                console.log(err.stack);
            };
        };
    };
    if (!success) {
        G.consoleOutput.push(G.c.c("dddd00") + "Unreconized command. Use 'help' for help." + G.c.n)
    }
};
G.Broadcast = function (broadcast, args) {
    toBroadcast = G.broadcastDirectory[broadcast]; //Returns array of functions to run
    for (x = 0; x < toBroadcast.length; x++) {
        console.log("[INFO] BROADCAST: " + broadcast)
        toBroadcast[x](args);
    }
};
G.RegisterFunction = function (id, definition) {
    if (id in G.modFunctions) {
        console.log("[ERR] function " + id + " already exists");
    } else {
        G.modFunctions[id] = definition;
    };
};
G.RegisterMod = function (modInfo) {
    if (modInfo.modid == undefined) {
        throw "ERR: modid is undefined";
    };
    if (modInfo.parents == undefined) {
        throw "ERR: parents of mod " + modInfo.modid + " is undefined";
    };
    if (modInfo.modid in G.initializedMods) {
        throw "ERR: duplicate mod id " + modid;
    };
    for (modRequirement of modInfo.parents) {
        if (!modRequirement in G.initializedMods) {
            G.consoleOutput.push(C.c.c("ff1111") + "ERROR LOADING MOD: " + modInfo.modid + " requres mod " + modRequirement + " to function properly." + G.c.n);
            throw "ERR: parent does not exist";
        };
    };
    G.initializedMods.push(modInfo.modid)
};
G.GenBar = function (value, max, length, left = "", segment = "█", empty = "░", right = "") {
    var progress = value / max
    var barAmount = Math.round(progress * length)
    var output = left
    for (f = 0; f < barAmount; f++) {
        output = output + segment;
    };
    for (e = 0; e < length - barAmount; e++) {
        output = output + empty;
    };
    output = output + right;
    return output;
};

document.addEventListener('keydown', function (event) {
    if (event.keyCode == 13) {
        if (G.listening) {
            console.log("[INFO] ACTIVE INPUT")
            prevListening = true
        } else {
            prevListening = false
        };
        G.listening = false;
        var commandRun = G.inputBox.value;
        G.consoleOutput.push("> " + commandRun);
        G.inputBox.value = "";
        if (!prevListening) {
            G.RunCommand(commandRun);
        } else {
            console.log("[INFO] INPUT RECIEVED: " + commandRun + " broadcasting: " + G.listeningTo);
            G.Broadcast(G.listeningTo, commandRun);
        };
        G.UpdateConsole();
    };
});

G.consoleOutput.push("LOADING MODS...");
G.UpdateConsole();
console.log("[INFO] --LOADING MODS--");
G.LoadMods();
//Debugging tool
/*
} catch (err) {
    console.log(err.stack);
};
*/