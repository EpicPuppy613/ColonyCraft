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
G.highestPriority = {};
G.listeningTo = "";
G.listeningDropdown = "";
G.dataToSave = ["commands","inventory"];
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

//Initialize Logger
G.logger = {};
G.logger.time = function () {
    const time = new Date();
    var elapsed = [time.getHours(), time.getMinutes(), time.getSeconds(), time.getMilliseconds()];
    if (elapsed[1] < 10) {
        elapsed[1] = "0" + elapsed[1];
    }
    if (elapsed[2] < 10) {
        elapsed[2] = "0" + elapsed[2];
    }
    if (elapsed[3] < 10) {
        elapsed[3] = "00" + elapsed[3];
    } else if (elapsed[3] < 100) {
        elapsed[3] = "0" + elapsed[3];
    }
    return `${elapsed[0]}:${elapsed[1]}:${elapsed[2]}.${elapsed[3]}`;
}
/**
 * Log info to the console
 */
G.logger.info = function (info, mod=null) {
    if (mod != null) {
        console.log("[" + G.logger.time() + "][INFO][" + mod + "] " + info);
    } else {
        console.log("[" + G.logger.time() + "][INFO] " + info);
    }
}
/**
 * Log an error to the console
 * @param {boolean} crash - Throw an error
 */
G.logger.error = function (error, mod=null, crash=false) {
    if (mod != null) {
        console.log("\u001b[31m[" + G.logger.time() + "][ERR][" + mod + "]" + error + "\u001b[0m");
    } else {
        console.log("\u001b[31m[" + G.logger.time() + "][ERR] " + error + "\u001b[0m");
    }
    if (crash) {
        throw error;
    }
}
/**
 * Log a warn to the console
 */
G.logger.warn = function (warn, mod=null) {
    if (mod != null) {
        console.log("\u001b[33m[" + G.logger.time() + "][WARN][" + mod + "] " + warn + "\u001b[0m");
    } else {
        console.log("\u001b[33m[" + G.logger.time() + "][WARN] " + warn + "\u001b[0m")
    }
}
console.log("//LOGGER INITIALIZED: " + G.logger.time() + "//");

//Initialize Color Engine
G.c = { 
    n: "</span>", 
    c: function (color) { return '<span style="color: ' + color + ';">'; } ,
    r: function (color) { return '</span><span style="color: ' + color + ';">'; } ,
    bc: function (color) { return '<span style="background-color: ' + color + ';">'; } ,
    br: function (color) { return '</span><span style="background-color: ' + color + ';">'; }
}

//Initialize Constructors
/**
 * A Category that represents a group of items in the inventory
 * @param {string} name - The display name of the category, colors supported
 * @param {string} catid - The id to assign to the category
 * @constructor
 */
G.InventoryCategory = function (name, catid) {
    this.name = name;
    this.catid = catid;
    this.items = [];
    /**
     * Adds an item to the list of items
     * 
     * Returns itself so chaining possible
     * @param {object} item - The item to add
     * @method
     * @returns {this}
     */
    this.AddItem = function (item) {
        this.items.push(item);
        return this;
    }
};

/**
 * A Item in the inventory, goes in the items attribute of an inventory category
 * @param {string} name - The display name of the item, colors supported
 * @param {string} catid - The id of the category the item belongs to
 * @param {string} itemid - The id of the item, no other items can have the same id 
 * @class
 */
G.InventoryItem = function (name, catid, itemid) {
    this.name = name;
    this.catid = catid;
    this.itemid = itemid;
    this.count = 0;
    this.itemtype = "i";
};

/**
 * A Consumable item in the inventory, goes in the items attribute of an inventory category
 * @param {string} name - The display name of the item, colors supported
 * @param {string} catid - The id of the category the item belongs to
 * @param {string} itemid - The id of the item, no other items can have the same id
 * @param {number} saturation - The number of saturation points the item gives
 * @param {number} enjoyment - A value used for calculating the amount of morale changed by consuming this item
 * @param {number} health - A value used for calculating the amount of health changed by consuming this item
 * @param {int} priority - The priority of which to consume this item, a lower number means a higher priority (minimum 0)
 * @param {string} type - The type of consumable the item is, should be the same as when the function is run to consume the item
 */
G.FoodItem = function (name, catid, itemid, saturation, enjoyment, health, priority, type) {
    this.name = name;
    this.catid = catid;
    this.itemid = itemid;
    this.saturation = parseInt(saturation);
    this.itemtype = "f";
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
    if (G.highestPriority[type] === undefined) {
        G.highestPriority[type] = 0;
    };
    if (G.highestPriority[type] < this.priority) {
        G.highestPriority[type] = this.priority;
    };
};

//Initialize Inventory Functions
/**
 * Returns a item from the inventory in all categories
 * @param {string} itemid - The id of the item to get
 * @returns {object}
 */
G.GetItemById = function (itemid) {
    for (category of Object.keys(G.inventory)) {
        for (item of G.inventory[category].items) {
            if (item.itemid == itemid) {
                return item;
            }
        }
    }
    return;
};

/**
 * Changes the amount of an item in the inventory
 * @param {string} itemid - The id of the item to get from any category
 * @param {int} count - The number of items to change by, can be negative
 */
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

/**
 * Returns if the selected inventory category has no items
 * @param {string} category - The id of the category to check
 */
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

/**
 * Give an amount of ALL items in the inventory
 * 
 * Should only be used for debug purposes
 * @param {int} amount - The amount of all items to give
 */
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

/**
 * Clears ALL item from the inventory
 * 
 * Be extremely careful when using this function because it will clear ALL items
 */
G.ClearAllItems = function () {
    for (category of Object.keys(G.inventory)) {
        for (item of G.inventory[category].items) {
            item.count = 0;
        }
    }
};

//Initialize General Functions
G.RandBetween = function (min, max) {
    if (min > max) {
        throw "ValueError: minimum value cannot be over maximum value";
    }
    var range = max - min + 1;
    var num = Math.floor(Math.random() * range);
    return num + min;
};

/**
 * Similar to the builtin in operator except that it checks values of arrays instead of keys
 * 
 * Alternative to array.indexOf(value) != -1
 * @param {array} array - The array to search in
 * @param {any} match - The thing too match to
 */
G.MatchArray = function (array, match) {
    if (array.indexOf(match) == -1) {
        return false
    } else {
        return true
    };
};

/**
 * Updates the console screen that's displayed
 * 
 * Should not be used as it already is called every time a command is run
 */
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

/**
 * Initializes a new panel
 * @param {string} panelName - The html id of the panel to initialize
 */
G.InitializePanel = function (panelName) {
    var newPanelContent = "";
    newPanelContent = G.gamePanels.innerHTML;
    newPanelContent = newPanelContent + '<panel class="panel" id="' + panelName + '"></panel>';
    G.gamePanels.innerHTML = newPanelContent;
    return document.getElementById(panelName);
};

/**
 * Update the height settings
 * 
 * Should not be used under any circumstances
 */
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

/**
 * Load the next mod in the modlist
 * 
 * You MUST call this as the very last line of your mod
 */
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

/**
 * Registers a new command that can be run
 * @param {string} name - The name of the command
 * @param {string} desc - The description of the command
 * @param {string} id - The id of the command, should follow standard camelCase
 * @param {string} ref - How the command will be referenced, this is what is used to run the command in-game, use hyphens(-) for whitespace
 * @param {function} commandFunction - The function to execute when the command is run
 * @param {boolean} unlocked - [optional] If the command should start off unlocked
 * @param {boolean} hidden - [optional] If the command should start off hidden, hidden commands can be executed but do not show up in the help menu
 */
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

/**
 * Broadcasts are events where multiple functions can be run
 * @param {string} broadcast - The broadcast to execute the function for
 * @param {function} broadcastFunction - The function to execute when the broadcast is run
 */
G.RegisterBroadcast = function (broadcast, broadcastFunction) {
    if (G.broadcastDirectory[broadcast] == undefined) {
        G.broadcastDirectory[broadcast] = [];
    };
    G.broadcastDirectory[broadcast].push(broadcastFunction);
};

/**
 * Runs a command
 * 
 * Shound never be used under any circumstances
 */
G.RunCommand = function (command) {
    var success = false;
    if (G.MatchArray(G.commands.unlocked, command) || G.MatchArray(G.commands.hidden, command)) {
        success = true;
        G.logger.info(command, "RUNCOMMAND");
        try {
            G.commandDirectory[command]();
        } catch (err) {
            G.logger.error(err.stack);
        };
    };
    if (!success) {
        G.consoleOutput.push(G.c.c("#dddd00") + "Unreconized command. Use 'help' for help." + G.c.n);
    };
    G.UpdateConsole();
};

/**
 * Broadcasts a event and executes all functions with that event
 */
G.Broadcast = function (broadcast, args) {
    toBroadcast = G.broadcastDirectory[broadcast]; //Returns array of functions to run
    G.logger.info(broadcast, "BROADCAST");
    for (x = 0; x < toBroadcast.length; x++) {
        toBroadcast[x](args);
    }
};

/**
 * Removes a value from an array
 * @param {array} arrayRemove - The array to remove from
 * @param {any} value - The value to remove
 */
G.RemoveEntry = function (arrayRemove, value) {
    const arrayIndex = arrayRemove.indexOf(value);
    if (arrayIndex > -1) {
        arrayRemove.splice(arrayIndex, 1);
    };
    return arrayRemove
};

/**
 * Registers a mod in the game
 * @param {object} modInfo - The info to register the mod under
 * modInfo should be a object
 * modid should be a unique id for the mod
 * 
 * parents should be a list of modids that also need to be present
 */
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
    G.logger.info("REGISTERED MOD: " + modInfo.modid);
    G.initializedMods.push(modInfo.modid);
};

/**
 * Returns a visual bar
 * @param {number} value - The value of the filled portion of the bar
 * @param {number} max - The maximum value for the bar to have
 * @param {int} length - The character length of the bar
 * @param {string} left - [optional] The left border of the bar
 * @param {string} segment - [optional] A filled segment of the bar
 * @param {string} empty - [optional] A unfilled segment of the bar
 * @param {string} right - [optional] The right border of the bar
 */
G.GenBar = function (value, max, length, left = "", segment = "▰", empty = "▱", right = "") {
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
        G.inputBox.type = "text";
        if (G.listeningDropdown == "") {
            G.consoleOutput.push("> " + commandRun);
        }
        G.inputBox.value = "";
        if (!prevListening) {
            G.RunCommand(commandRun);
        } else {
            G.Broadcast(G.listeningTo, commandRun);
        }
        G.UpdateConsole();
    };
});

G.consoleOutput.push("LOADING MODS...");
G.UpdateConsole();
G.logger.info("--LOADING MODS--");
G.LoadMods();
//Debugging tool
/*
} catch (err) {
    console.log(err.stack);
};
*/