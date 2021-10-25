//Initialize Game
G = {}

//Initialize Element Variables
G.gameConsole = document.getElementById("console");
G.gamePanels = document.getElementById("panels");
G.inputBox = document.getElementById("commandInput");
G.consoleHeight = document.getElementById("consoleHeight");
G.panelHeight = document.getElementById("panelHeight");
G.modLoader = document.getElementById("modLoading");
G.modList = ["basemod.js"];
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
G.c = { "n": "</span>", "c": function (color) { return '<span style="color: #' + color + ';">'; } }

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
        panels[i].style.maxHeight = (newPanelHeight - 1) + "rem";
    }
};
G.LoadMods = function () {
    for (mod of G.modList) {
        import(mod)
    }
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
            console.log("RUNCOMMAND: "+command)
            try {
                G.commandDirectory[command]();
            } catch (err) {
                console.log(err.stack);
            };
        };
    };
    if (!success) {
        G.consoleOutput.push(G.c.c("dddd00")+"Unreconized command. Use 'help' for help."+G.c.n)
    }
};
G.Broadcast = function (broadcast, args) {
    toBroadcast = G.broadcastDirectory[broadcast]; //Returns array of functions to run
    for (x = 0; x < toBroadcast.length; x++) {
        console.log("BROADCAST: "+broadcast)
        toBroadcast[x](args);
    }
};

document.addEventListener('keydown', function (event) {
    if (event.keyCode == 13) {
        var commandRun = G.inputBox.value;
        G.consoleOutput.push("> " + commandRun);
        G.inputBox.value = "";
        if (!G.listening) {
            G.RunCommand(commandRun);
        } else {
            G.Broadcast(listeningTo, commandRun);
        };
        G.UpdateConsole();
    };
});

G.consoleOutput.push("LOADING MODS...")
G.UpdateConsole()
console.log("--LOADING MODS--")
G.LoadMods();
G.consoleOutput.push(G.c.c("00dd00") + "INITIALIZED<br>" + G.c.n + "----------<br>" + G.c.c("0099bf") + "ColonyCraft Closed WEB TEST 1.1.0" + G.c.n)
G.UpdateConsole()