G.logger.info("REGISTERING MOD", "saving");
G.RegisterMod({
    name: "Saving System",
    version: "1.0.0",
    api: 1.0,
    modid: "saving",
    parents: []
});

G.ReplaceNull = function (key, value) {
    if (value == null) {
        return undefined;
    };
    if (key == "modFunctions" || key == "broadcastDirectory" || key == "commandDirectory") {
        return undefined;
    };
    return value
};

const loadedSaveData = window.localStorage.getItem("saveData");
if (loadedSaveData === null) {
    G.logger.warn("NO SAVE DATA FOUND", "saving");
} else {
    G.logger.info("LOADING SAVE DATA", "saving");
    if (loadedSaveData != null) {
        G.consoleOutput.push(G.c.c("#dd00dd") + "You have a save game saved, use 'load' to load it" + G.c.n)
    };
};

G.Save = function () {
    var savePackage = {};
    for (key of Object.keys(G)) {
        if (G.MatchArray(G.dataToSave, key)) {
            savePackage[key] = G[key];
        }
    }
    window.localStorage.setItem("saveData", JSON.stringify(savePackage));
    G.consoleOutput.push(G.c.c("#33ff33") + "The game has been saved." + G.c.n);
};

G.Load = function () {
    var savePackage = JSON.parse(window.localStorage.getItem("saveData"));
    G = {
        ...G,
        ...savePackage
    }
    G.Broadcast("saveLoaded");
    G.consoleOutput.push(G.c.c("#33ff33") + "The game has been loaded." + G.c.n);
};

G.RegisterCommand("Load", "load a saved game", "load", "load", function () {
    G.Load();
}, true);

G.RegisterCommand("Save", "save the game", "save", "save", function () {
    G.Save();
}, true);

G.LoadMods();