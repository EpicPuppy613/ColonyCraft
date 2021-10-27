console.log("[INFO][saving] REGISTERING MOD")
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
if (loadedSaveData == undefined) {
    console.log("[INFO][saving] NO SAVE DATA FOUND");
    var newSaveData = {};
    newSaveData.slotA = "EMPTY";
    newSaveData.slotB = "EMPTY";
    newSaveData.slotC = "EMPTY";
    newSaveData.slotAuto = "EMPTY";
    window.localStorage.setItem("saveData",JSON.stringify(newSaveData));
    console.log("[INFO][saving] CREATING NEW SAVE DATA")
    G.loadedSaveData = G.newSaveData;
} else {
    console.log("[INFO][saving] LOADING SAVE DATA")
    G.loadedSaveData = JSON.parse(loadedSaveData);
    console.log(newSaveData);
    if (G.loadedSaveData.slotAuto != "EMPTY") {
        G.consoleOutput.push(G.c.c("#dd00dd") + "You have a save loaded in autosave, use 'load' to load it" + G.c.n)
    };
};

G.RegisterFunction("saveAuto",function (){
    console.log("[INFO][saving] Autosaving game...");
    var toSave = JSON.stringify(G, G.ReplaceNull);
    //var toSave = JSON.stringify(G);
    console.log(toSave);
    window.localStorage.setItem("slotAuto", toSave);
    G.loadedSaveData.slotAuto = G.colony.name;
    window.localStorage.setItem("saveData", JSON.stringify(G.loadedSaveData));
    G.consoleOutput.push(G.c.c("#00dd00") + "The game has been saved." + G.c.n);
});

/*G.RegisterCommand("Load","load a saved game from a save slot","load","load",function () {
    if (G.loadedSaveData.slotA == "EMPTY" && G.loadedSaveData.slotB == "EMPTY" && G.loadedSaveData.slotC == "EMPTY" && G.loadedSaveData.slotAuto == "EMPTY") {
        G.consoleOutput.push(G.c.c("#dddd00") + "You don't have any games saved!" + G.c.n);
        return false
    } else {
        G.consoleOutput.push("What slot do you want to load from?" + G.c.c("#aa2222") + 
        "<br>[0] Cancel" + G.c.r("#00aa00") + 
        "<br>[1] Slot A - " + G.loadedSaveData.slotA + G.c.r("#aaaa22") + 
        "<br>[2] Slot B - " + G.loadedSaveData.slotB + G.c.r("#2222aa") + 
        "<br>[3] Slot C - " + G.loadedSaveData.slotC + G.c.r("#aa22aa") + 
        "<br>[4] Autosave - " + G.loadedSaveData.slotAuto + G.c.n);   
    };
    var loadData = JSON.parse(window.localStorage.getItem("slotAuto"));
    G = {
        ...G,
        ...loadData
    };
},true);

G.RegisterBroadcast("ccBegin", function () {
    G.modFunctions["saveAuto"]();
});

G.RegisterBroadcast("ccEnd", function () {
    G.modFunctions["saveAuto"]();
});*/

G.RegisterBroadcast("ccTick", function () {
    console.log("A")
});

/*
SAVE SYSTEM OVERVIEW
5 local storage files:
- saveData - contains information about currently stored files
- slotA - contains actual save data for slot A
- slotB - contains actual save data for slot B
- slotC - contains actual save data for slot C
- slotAuto - contains save data for the autosave slot
*/

G.LoadMods();