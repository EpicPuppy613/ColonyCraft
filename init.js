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
document.getElementById("game").style.display = "none";
G.listening = false;
G.listeningTo = "";
G.commandDirectory = {};
G.inventory = {};
G.commands = {};
G.commands.unlocked = [];
G.commands.all = {};
G.commands.hidden = [];
G.broadcastDirectory = {};
G.consoleOutput = [];
G.savePackage = ["commands","stats"];

//Initialize Modlists
G.initializedMods = [];
G.modList = ["basemod.js"];
G.modList.unshift("saving.js");

//Initialize Color Engine
G.c = { 
    n: "</span>", 
    c: function (color) { return '<span style="color: ' + color + ';">'; } ,
    r: function (color) { return '</span><span style="color: ' + color + ';">'; }
}

//Initialize Constructors
G.InventoryCategory = function (name, catid) {
    this.name = name;
    this.catid = catid;
    this.items = [];
};
G.InventoryItem = function (name, catid, itemid) {
    this.name = name;
    this.catid = catid;
    this.itemid = itemid;
    this.count = 0;
};
G.FoodItem = function (name, catid, itemid, saturation, enjoyment, health, priority, type) {
    this.name = name;
    this.catid = catid;
    this.itemid = itemid;
    this.saturation = parseInt(saturation);
    if (isNaN(this.saturation)) {
        throw "LoadError: Invalid saturation value for " + itemid;
    }
    this.enjoyment = parseInt(enjoyment);
    if (isNaN(this.enjoyment)) {
        throw "LoadError: Invalid enjoyment value for " + itemid;
    }
    this.health = parseInt(health);
    if (isNaN(this.enjoyment)) {
        throw "LoadError: Invalid enjoyment value for " + itemid;
    }
    this.priority = parseInt(priority)
    if (this.priority < 0 || this.priority > 5 || isNaN(this.priority)) {
        throw "LoadError: Invalid priority value for " + itemid;
    }
    this.count = 0;
    this.type = type;
};

//Initialize Inventory Functions
G.GetItemById = function (itemid) {
    for (category of Object.keys(G.inventory)) {
        for (item of G.inventory[category].items) {
            if (item.itemid == itemid) {
                return item;
            }
        }
    }
    return false;
};
G.ChangeItemById = function (itemid, count) {
    if (isNaN(parseInt(count))) {
        return false;
    }
    for (category of Object.keys(G.inventory)) {
        for (item of G.inventory[category].items) {
            if (item.itemid == itemid) {
                item.count = item.count + count
                return item;
            }
        }
    }
    return false;
};
G.CategoryIsEmpty = function (category) {
    if (category === undefined) {
        return false;
    }
    for (item of category.items) {
        if (item.count > 0) {
            return false;
        }
    }
    return true;
};
G.GiveAllItems = function (amount) {
    if (isNaN(parseInt(amount))) {
        return false;
    }
    for (category of Object.keys(G.inventory)) {
        for (item of G.inventory[category].items) {
            item.count = item.count + amount;
        }
    }
};

//Initialize General Functions
G.MatchArray = function (array, match) {
    if (array.indexOf(match) == -1) {
        return false
    } else {
        return true
    };
};
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
    G.gamePanels.style.minHeight = (newPanelHeight - 0.8) + "rem";
    G.gamePanels.style.maxHeight = (newPanelHeight - 0.8) + "rem";
    for (var i = 0; i < panels.length; i++) {
        panels[i].style.maxHeight = newPanelHeight + "rem";
    }
};
G.currentModIndex = 0;
G.LoadMods = function () {
    if (G.currentModIndex < G.modList.length) {
        var script = document.createElement('script');
        script.setAttribute('src',G.modList[G.currentModIndex]+'?r='+Math.random());//we add a random bit to the URL to prevent caching
        document.head.appendChild(script);
    } else {
        document.getElementById("game").style.display = "block";
        document.getElementById("loading").style.display = "none";
        G.consoleOutput.push("----------<br>" + G.c.c("#00bfbf") + "ColonyCraft WEB ALPHA v1.1.0" + G.c.n);
        G.UpdateConsole();
    };
    G.currentModIndex++
};
G.RegisterCommand = function (name, desc, id, ref, commandFunction, unlocked = false, hidden = false) {
    newCommand = {}
    newCommand.name = name
    newCommand.id = id
    newCommand.ref = ref
    newCommand.desc = desc
    G.commands.all[ref] = newCommand
    if (unlocked) {
        G.commands.unlocked.push(newCommand.ref)
    }
    if (hidden) {
        G.commands.hidden.push(newCommand.ref)
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
    if (G.MatchArray(G.commands.unlocked, command) || G.MatchArray(G.commands.hidden, command)) {
        success = true;
        console.log("[INFO] RUNCOMMAND: " + command)
        try {
            G.commandDirectory[command]();
        } catch (err) {
            console.log(err.stack);
        };
    };
    if (!success) {
        G.consoleOutput.push(G.c.c("#dddd00") + "Unreconized command. Use 'help' for help." + G.c.n)
    };
    G.UpdateConsole();
};
G.Broadcast = function (broadcast, args) {
    toBroadcast = G.broadcastDirectory[broadcast]; //Returns array of functions to run
    for (x = 0; x < toBroadcast.length; x++) {
        console.log("[INFO] BROADCAST: " + broadcast)
        toBroadcast[x](args);
    }
};
G.RemoveEntry = function (arrayRemove, value) {
    const arrayIndex = arrayRemove.indexOf(value);
    if (arrayIndex > -1) {
        arrayRemove.splice(arrayIndex, 1);
    };
    return arrayRemove
};
G.RegisterMod = function (modInfo) {
    const loadError = document.getElementById("loadErrors");
    if (modInfo.modid == undefined) {
        loadError.innerHTML = "ERROR: a modid is undefined";
        throw "LoadError: modid is undefined";
    };
    if (modInfo.parents == undefined) {
        loadError.innerHTML = "ERROR: the parents of mod " + modInfo.modid + " is undefined";
        throw "LoadError: parents of mod " + modInfo.modid + " is undefined";
    };
    if (G.MatchArray(G.initializedMods,modInfo.modid)) {
        loadError.innerHTML = "ERROR: there is a duplicate mod id of " + modid;
        throw "LoadError: duplicate mod id " + modid;
    };
    for (modRequirement of modInfo.parents) {
        if (!G.MatchArray(G.initializedMods,modRequirement)) {
            loadError.innerHTML = "ERROR LOADING MOD: " + modInfo.modid + " requres mod " + modRequirement + " to function properly.";
            throw "LoadError: parent '" + modRequirement + "' does not exist for mod '" + modInfo.modid + "'";
        };
    };
    console.log("[INFO] REGISTERED MOD: " + modInfo.modid);
    G.initializedMods.push(modInfo.modid);
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
            console.log("[INFO] INPUT RECIEVED, Broadcasting: " + G.listeningTo);
            G.Broadcast(G.listeningTo, commandRun);
        }
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