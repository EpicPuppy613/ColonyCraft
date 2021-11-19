G.logger.info("REGISTERING MOD", "bm");
G.RegisterMod({
    name: "Basemod",
    version: "1.1.0",
    api: 1.0,
    release: "alpha",
    modid: "bm",
    parents: ["saving"]
});

G.logger.info("Initializing Objects", "bm");

const firstTime = window.localStorage.getItem("firstTime");
if (firstTime === null) {
    G.consoleOutput.push(G.c.c("#00ff00") +
        "Welcome to ColonyCraft! " +
        "As this is your first time playing, you can run the command 'tutorial' for a basic tutorial or use the command 'help' to list all available commands. " +
        "The Github wiki page also has some useful information. Good Luck!"
        + G.c.n);
};
//window.localStorage.setItem("firstTime",false);

//Initialize Storage Objects
G.dataToSave.push("colony");
G.dataToSave.push("jobs");
G.dataToSave.push("stats");
G.dataToSave.push("evolution");
G.storageEfficiency = 0.9;
G.eotw = 0;

G.colony = {};
G.colony.adult = 0;
G.colony.assigned = 0;
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
G.tables = {};
G.jobs.template = function (name, id, color) {
    this.name = name;
    this.id = id;
    this.count = 0;
    this.color = color;
    this.loot = {};
    this.loot.table = null;
    this.loot.rolls = null;
    /**
     * Adds a loot table to a job
     * @param {string} tableid - Id of loot table to assign
     * @param {int} rolls - Times to roll the table PER worker assigned
     */
    this.AddLoot = function (tableid, rolls) {
        this.loot.table = tableid;
        this.loot.rolls = parseInt(rolls);
        if (isNaN(this.loot.rolls)) {
            throw "Error adding loot table to " + this.name + ". Rolls amount not a number";
        }
        if (G.tables[tableid] == undefined) {
            throw "Error adding loot table to " + this.name + ". Loot table does not exist";
        }
    }
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
        G.stats.xp -= G.stats.lvlup;
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
        G.consoleOutput.push(G.c.c("#00dddd") +
            "You leveled up " + levels + " times! You gain " + skillgain + " skill points and " + talentgain + " talent points"
            + G.c.n)
    };
    G.BMStatsPanelUpdate();
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
/**
 * Add a new skill
 * @param {object} skill - The skill object to add
 * Returns evolution object for chaining
 */
G.evolution.AddSkill = function (skill) {
    this.skills.push(skill);
    return this;
}
/**
 * A skill that can be researchable
 * @param {string} name - The display name of the skill
 * @param {string} id - The id of the skill
 * @param {array} req - An array of requirement ids, leave empty if none
 * @param {int} cost - The cost of the skill
 * @param {string} desc - The description of the skill
 * @param {string} color - [optional] The color to use for the skill
 */
G.evolution.SkillTemplate = function (name, id, req, cost, desc, color="#ffffff") {
    this.name = name;
    this.id = id;
    this.req = req;
    this.cost = cost;
    this.desc = desc;
    this.color = color;
}
/**
 * Add a new talent
 * @param {object} talent - The talent object to add
 * Returns evolution object for chaining
 */
G.evolution.AddTalent = function (talent) {
    this.talents.push(talent);
    return this;
}
/**
 * A talent that can be researchable
 * @param {string} name - The display name of the talent
 * @param {string} id - The id of the talent
 * @param {array} req - An array of requirement ids, leave empty if none
 * @param {int} cost - The cost of the talent
 * @param {string} desc - The description of the talent
 * @param {string} color - [optional] The color to use for the talent
 */
G.evolution.TalentTemplate = function (name, id, req, cost, desc, color="#ffffff") {
    this.name = name;
    this.id = id;
    this.req = req;
    this.cost = cost;
    this.desc = desc;
    this.color = color;
}
G.evolution.trait = {};
G.evolution.trait.current = null;
G.evolution.trait.progress = 0;
G.evolution.trait.needed = 0;
/**
 * Add a new trait
 * @param {object} trait - The trait object to add
 * Returns evolution object for chaining
 */
G.evolution.AddTrait = function (trait) {
    this.traits.push(trait);
    return this;
}
/**
 * A trait that can be researchable
 * @param {string} name - The display name of the trait
 * @param {string} id - The id of the trait
 * @param {array} req - An array of requirement ids, leave empty if none
 * @param {int} cost - The cost of the trait
 * @param {string} desc - The description of the trait
 * @param {string} color - [optional] The color to use for the trait
 */
G.evolution.TraitTemplate = function (name, id, req, cost, desc, color="#ffffff") {
    this.name = name;
    this.id = id;
    this.req = req;
    this.cost = cost;
    this.desc = desc;
    this.color = color;
}
G.evolution.research = {};
G.evolution.research.current = null;
G.evolution.research.progress = [0, 0, 0, 0];
G.evolution.research.needed = [0, 0, 0, 0];
/**
 * Add a new research
 * @param {object} research - The research object to add
 * Returns evolution object for chaining
 */
G.evolution.AddResearch = function (research) {
    this.researches.push(research);
    return this;
}
/**
 * A technology that can be researchable
 * @param {string} name - The display name of the research
 * @param {string} id - The id of the research
 * @param {array} requirements - An array of requirement ids, leave empty if none
 * @param {array} cost - The cost of the research [invention, math, science, aerospace]
 * @param {string} desc - The description of the research
 * @param {string} color - [optional] The color to use for the research
 */
G.evolution.ResearchTemplate = function (name, id, requirements, cost, desc, color="#ffffff") {
    this.name = name;
    this.id = id;
    this.req = requirements;
    this.cost = cost;
    this.desc = desc;
    this.color = color;
}

//Initialize Jobs
G.jobs.unlocked.push("gatherer");
G.jobs.unlocked.push("thinker");
G.jobs.all.gatherer = new G.jobs.template("Gatherer", "gatherer", "#66ff66");
G.jobs.all.hunter = new G.jobs.template("Hunter", "hunter", "#33ff33");
G.jobs.all.woodcutter = new G.jobs.template("Woodcutter", "woodcutter", "#33ff33");
G.jobs.all.fisher = new G.jobs.template("Fisher", "fisher", "#33ff33");
G.jobs.all.digger = new G.jobs.template("Digger", "digger", "#33ff33");
G.jobs.all.miner = new G.jobs.template("Miner", "miner", "#33ff33");
G.jobs.all.waterman = new G.jobs.template("Water Collector", "waterman", "#3333ff");
G.jobs.all.filterer = new G.jobs.template("Water Filterer", "filterer", "#3333ff");
G.jobs.all.thinker = new G.jobs.template("Thinker", "thinker", "#66ffff");
G.jobs.all.inventor = new G.jobs.template("Inventor", "inventor", "#33ffff");
G.jobs.all.mathematician = new G.jobs.template("Mathematician", "mathematician", "#33ffff");
G.jobs.all.scientist = new G.jobs.template("Scientist", "scientist", "#33ffff");
G.jobs.all.aviator = new G.jobs.template("Aviation Engineer", "aviator", "#33ffff");
G.jobs.all.crafter = new G.jobs.template("Crafter", "crafter", "#ffff33");
G.jobs.all.toolmaker = new G.jobs.template("Toolmaker", "toolmaker", "#ffff33");
G.jobs.all.carver = new G.jobs.template("Carver", "carver", "#ffff33");
G.jobs.all.smelter = new G.jobs.template("Smelter", "smelter", "#ffff33");
G.jobs.all.blacksmith = new G.jobs.template("Blacksmith", "blacksmith", "#ffff33");
G.jobs.all.carpenter = new G.jobs.template("Carpenter", "carpenter", "#ffff33");
G.jobs.all.firemaker = new G.jobs.template("Firemaker", "firemaker", "#ffaa33");
G.jobs.all.smoker = new G.jobs.template("Smoker", "smoker", "#ffaa33");
G.jobs.all.builder = new G.jobs.template("Builder", "builder", "#ff33ff");
G.jobs.all.architect = new G.jobs.template("Architect", "architect", "#ff33ff");

//Initialize Inventory
G.logger.info("Initializing Inventory", "bm");

//Initialize Food
G.inventory.food = new G.InventoryCategory(G.c.c("#00ef00") + "Food" + G.c.n, "food")
    .AddItem(new G.FoodItem("Fruit", "food", "fruit", 2, 1, 0, 3, "f"))
    .AddItem(new G.FoodItem("Cooked Meat", "food", "cooked-meat", 3, 2, 4, 5, "f"))
    .AddItem(new G.FoodItem("Raw Meat", "food", "raw-meat", 2, -2, -2, 1, "f"))
    .AddItem(new G.FoodItem("Cooked Fish", "food", "cooked-fish", 2, 2, 4, 5, "f"))
    .AddItem(new G.FoodItem("Raw Fish", "food", "raw-fish", 2, -2, -2, 1, "f"))
    .AddItem(new G.FoodItem("Wild Herbs", "food", "wild-herbs", 1, 0, 3, 3, "f"));

//Initialize Liquids
G.inventory.liquids = new G.InventoryCategory(G.c.c("#4444ff") + "Liquids" + G.c.n, "liquids")
    .AddItem(new G.FoodItem(G.c.c("#ccddff") + "Fresh Water" + G.c.n, "liquids", "water", 2, 1, 1, 3, "l"))
    .AddItem(new G.FoodItem("Dirty Water", "liquids", "mud-water", 1, -1, -1, 2, "l"))
    .AddItem(new G.FoodItem("Poisonious Water", "liquids", "poison-water", 1, -5, -5, 1, "l"))
    .AddItem(new G.FoodItem("Salt Water", "liquids", "salt-water", 1, -10, -10, 0, "l"));

//Initialize Primitive Materials
G.inventory.primitive = new G.InventoryCategory(G.c.c("#964b00") + "Primitive Materials" + G.c.n, "primitive")
    .AddItem(new G.InventoryItem("Sticks", "primitive", "sticks"))
    .AddItem(new G.InventoryItem("Rocks", "primitive", "rocks"))
    .AddItem(new G.InventoryItem("Leaves", "primitive", "leaves"))
    .AddItem(new G.InventoryItem("Metal Ore", "primitive", "ore"))
    .AddItem(new G.InventoryItem("Mud", "primitive", "mud"))
    .AddItem(new G.InventoryItem("Clay", "primitive", "clay"));

//Initialize Basic Materials
G.inventory.basic = new G.InventoryCategory(G.c.c("#888888") + "Basic Materials" + G.c.n, "basic")
    .AddItem(new G.InventoryItem("Logs", "basic", "logs"))
    .AddItem(new G.InventoryItem("Cut Stone", "basic", "cut-stone"))
    .AddItem(new G.InventoryItem("Mud Bricks", "basic", "mud-bricks"))
    .AddItem(new G.InventoryItem("Metal Bar", "basic", "metal-bar"));

//Initialize Advanced Materials
G.inventory.advanced = new G.InventoryCategory(G.c.c("#bb00bb") + "Advanced Materials" + G.c.n, "advanced")
    .AddItem(new G.InventoryItem("Planks", "advanced", "planks"))
    .AddItem(new G.InventoryItem("Marble", "advanced", "marble"))
    .AddItem(new G.InventoryItem("Granite", "advanced", "granite"))
    .AddItem(new G.InventoryItem("Metal Beam", "advanced", "metal-beam"))
    .AddItem(new G.InventoryItem(G.c.c("#ffeebb") + "Gold Ore" + G.c.n, "advanced", "gold-ore"))
    .AddItem(new G.InventoryItem(G.c.c("#bbeeff") + "Rough Diamond" + G.c.n, "advanced", "rough-diamond"));

//Initialize Precious Materials
G.inventory.precious = new G.InventoryCategory(G.c.c("#ffd700") + "Precious Materials" + G.c.n, "precious")
    .AddItem(new G.InventoryItem("Marble Block", "precious", "marble-block"))
    .AddItem(new G.InventoryItem("Granite Block", "precious", "granite-block"))
    .AddItem(new G.InventoryItem("Quartz Block", "precious", "quartz-block"))
    .AddItem(new G.InventoryItem(G.c.c("#ffdd66") + "Gold Bar" + G.c.n, "precious", "gold-bar"))
    .AddItem(new G.InventoryItem(G.c.c("#66ddff") + "Fine Diamond" + G.c.n, "precious", "fine-diamond"));

//Initialize Electrical Components
G.inventory.electric = new G.InventoryCategory(G.c.c("#ff9333") + "Electronic Components" + G.c.n, "electric")
    .AddItem(new G.InventoryItem(G.c.c("#ffccaa") + "Copper Ore" + G.c.n, "electric", "copper-ore"))
    .AddItem(new G.InventoryItem(G.c.c("#ffbb77") + "Copper Bar" + G.c.n, "electric", "copper-bar"))
    .AddItem(new G.InventoryItem(G.c.c("#ffaa55") + "Copper Wire" + G.c.n, "electric", "copper-wire"))
    .AddItem(new G.InventoryItem(G.c.c("#55ee55") + "Circuit Board" + G.c.n, "electric", "circuit-board"));

//Initialize Equipment
G.inventory.equipment = new G.InventoryCategory("Equipment", "equipmet");

//Initialize Other
G.inventory.other = new G.InventoryCategory("Other", "other");

//Initialize Technologies
G.evolution
    .AddResearch(new G.evolution.ResearchTemplate("Intuition", "intuition", [], [25, 0, 0, 0],
        "Bright minds leads to more advanced research", "#33ffff"))
    .AddResearch(new G.evolution.ResearchTemplate("Survivability", "survival", [], [25, 0, 0, 0],
        "Make sure that your colony doesn't die", "#33ff33"))
    .AddResearch(new G.evolution.ResearchTemplate("Production", "production", [], [30, 0, 0, 0],
        "Production of more complex materials", "#ffff33"))
    .AddResearch(new G.evolution.ResearchTemplate("Advanced Invention", "adv-inv", ["intuition"], [50, 0, 0, 0],
        "Dedicated inventors to invent more things", '#33ffff'))
    .AddResearch(new G.evolution.ResearchTemplate("Theory of Mathematics", "ToMath", ["intuition"], [40, 0, 0, 0],
        "The concept of taking two numbers and changing them", "#33ffff"))
    .AddResearch(new G.evolution.ResearchTemplate("Advanced Mathematics", "adv-math", ["ToMath", "crafting", "electronics"], [100, 50, 0, 0],
        "Making computers do the math for us is a lot easier", "#33ffff"))
    .AddResearch(new G.evolution.ResearchTemplate("Theory of Science", "ToSci", ["ToM"], [75, 35, 0, 0],
        "Knowledge of the world around us", "#33ffff"))
    .AddResearch(new G.evolution.ResearchTemplate("Advanced Science", "adv-sci", ["ToSci", "building", "optics"], [200, 125, 75, 0],
        "Dedicated science labs to do science stuff", "#33ffff"))
    .AddResearch(new G.evolution.ResearchTemplate("Theory of Aviation", "ToAvi", ["ToSci"], [150, 100, 75, 0],
        "People should not be able to fly... but now we can", "#33ffff"))
    .AddResearch(new G.evolution.ResearchTemplate("Theory of Outer Space", "ToOS", ["ToAvi", "optics"], [400, 300, 200, 200],
        "The thought of the being more out there than we think", "darkblue"))
    .AddResearch(new G.evolution.ResearchTemplate("Theory of Rocketry", "ToRoc", ["ToOS", "adv-sci", "adv-math", "adv-inv"], [750, 650, 500, 500],
        "Making the device to get people beyond the world we know", "darkblue"))
    .AddResearch(new G.evolution.ResearchTemplate("Fishing", "fishing", ["survival"], [40, 0, 0, 0],
        "Catching fish from the water all around us", "#33ff33"))
    .AddResearch(new G.evolution.ResearchTemplate("Hunting", "hunting", ["fishing"], [75, 0, 0, 0],
        "Killing animals found all around us for the purpose of food", "#33ff33"))
    .AddResearch(new G.evolution.ResearchTemplate("Woodcutting", "woodcutting", ["surival"], [40, 0, 0, 0],
        "Using the trees to gain more and better resources", "#33ff33"))
    .AddResearch(new G.evolution.ResearchTemplate("Digging", "digging", ["production"], [40, 0, 0, 0],
        "Getting resources from the ground beneath us", "#ffff33"))
    .AddResearch(new G.evolution.ResearchTemplate("Mining", "mining", ["production", "crafting"], [75, 0, 0, 0],
        "Mining the ground for better and stronger materials", "#ffff33"))
    .AddResearch(new G.evolution.ResearchTemplate("Firemaking", "firemaking", ["survival"], [50, 0, 0, 0],
        "Makes fires to keep the colony warm", "#33ff33"))
    .AddResearch(new G.evolution.ResearchTemplate("Filtering", "filtering", ["firemaking"], [75, 0, 0, 0],
        "Boiling and using mesh filters to make water clean", "#33ff33"))
    .AddResearch(new G.evolution.ResearchTemplate("Water Collector", "water-collector", ["survival"], [40, 0, 0, 0],
        "Dedicated people to collect water for the colony", "#33ff33"))
    .AddResearch(new G.evolution.ResearchTemplate("Smoking", "smoking", ["firemaking"], [75, 0, 0, 0],
        "Smoking food to make it taste better", "#33ff33"))
    .AddResearch(new G.evolution.ResearchTemplate("Crafting", "crafting", ["production"], [50, 0, 0, 0],
        "Using raw items to make processed ones", "#ffff33"))
    .AddResearch(new G.evolution.ResearchTemplate("Toolmaking", "toolmaking", ["crafting"], [75, 0, 0, 0],
        "Making tools to assist in more advanced jobs", "#ffff33"))
    .AddResearch(new G.evolution.ResearchTemplate("Carving", "carving", ["toolmaking"], [100, 0, 0, 0],
        "Scraping out parts of an object to make another object", "#ffff33"))
    .AddResearch(new G.evolution.ResearchTemplate("Smelting", "smelting", ["crafting", "firemaking"], [100, 0, 0, 0],
        "Refining raw ores into processed metals", "#ffff33"))
    .AddResearch(new G.evolution.ResearchTemplate("Multicrafting", "multicrafting", ["crafting"], [100, 0, 0, 0],
        "Making multiple different crafting jobs at once", "#ffff33"))
    .AddResearch(new G.evolution.ResearchTemplate("Building", "building", ["toolmaking"], [125, 50, 0, 0],
        "Building more permanent structures to assist the colony", "#ffff33"))
    .AddResearch(new G.evolution.ResearchTemplate("Architecture", "architecture", ["building"], [250, 150, 0, 0],
        "The concept of making more advanced structures", "#ffff33"));

//Initialize Loot Tables
G.LootTable = function (name, id) {
    this.name = name;
    this.id = id;
    this.content = [];
    this.AddLoot = function (loot) {
        this.content.push(loot);
        return this;
    }
    this.Roll = function (times) {
        var totalWeight = 0;
        var weightDict = [];
        var itemDict = [];
        for (const item of this.content) {
            totalWeight += item.weight;
            weightDict.push(totalWeight);
            itemDict.push(item);
        }
        //console.log("[INFO][LOOT] DEBUG: Item list length: " + itemDict.length);
        for (i = 0; i < times; i++) {
            const randWeight = G.RandBetween(0, totalWeight - 1);
            for (const weight of weightDict) {
                if (randWeight < weight) {
                    var itemPos = weightDict.indexOf(weight);
                    if (itemDict[itemPos].item == null) {
                        break;
                    }
                    G.GetItemById(itemDict[itemPos].item).count += itemDict[itemPos].count;
                    break;
                }
            }
        }
    }
}

G.LootEntry = function (itemId, weight, count) {
    if (itemId != null) {
        this.item = itemId;
        if (G.GetItemById(itemId) == null) {
            throw "Error defining LootEntry: item " + itemId + " doesn't exist";
        }
    } else {
        this.item = null;
    }
    this.weight = weight;
    this.count = count;
}

G.tables.gatherer = new G.LootTable("Gatherer Job", "gatherer")
    .AddLoot(new G.LootEntry("fruit", 8, 1))
    .AddLoot(new G.LootEntry("wild-herbs", 6, 1))
    .AddLoot(new G.LootEntry("water", 3, 1))
    .AddLoot(new G.LootEntry("mud-water", 5, 1))
    .AddLoot(new G.LootEntry("poison-water", 3, 1))
    .AddLoot(new G.LootEntry("salt-water", 2, 3))
    .AddLoot(new G.LootEntry("sticks", 5, 1))
    .AddLoot(new G.LootEntry("rocks", 4, 1))
    .AddLoot(new G.LootEntry("leaves", 3, 2))
    .AddLoot(new G.LootEntry(null, 10, 1));
G.jobs.all.gatherer.AddLoot("gatherer", 6);

G.tables.woodcutter = new G.LootTable("Woodcutter Job", "woodcutter")
    .AddLoot(new G.LootEntry("logs", 6, 1))
    .AddLoot(new G.LootEntry("sticks", 2, 1))
    .AddLoot(new G.LootEntry("leaves", 1, 1))
    .AddLoot(new G.LootEntry(null, 2, 1));
G.jobs.all.woodcutter.AddLoot("woodcutter", 5);

G.tables.hunter = new G.LootTable("Hunter Job", "hunter")
    .AddLoot(new G.LootEntry("raw-meat", 1, 5))
    .AddLoot(new G.LootEntry(null, 5, 1));
G.jobs.all.hunter.AddLoot("hunter", 5);

G.tables.fisher = new G.LootTable("Fisher Job", "fisher")
    .AddLoot(new G.LootEntry("raw-fish", 1, 1))
    .AddLoot(new G.LootEntry(null, 2, 1));
G.jobs.all.fisher.AddLoot("fisher", 4);

G.tables.digger = new G.LootTable("Digger Job", "digger")
    .AddLoot(new G.LootEntry("rocks", 2, 1))
    .AddLoot(new G.LootEntry("mud", 2, 1))
    .AddLoot(new G.LootEntry("clay", 1, 1))
    .AddLoot(new G.LootEntry(null, 2, 1));
G.jobs.all.digger.AddLoot("digger", 5);

G.tables.miner = new G.LootTable("Miner Job", "miner")
    .AddLoot(new G.LootEntry("rocks", 300, 2))
    .AddLoot(new G.LootEntry("mud", 100, 1))
    .AddLoot(new G.LootEntry("clay", 80, 1))
    .AddLoot(new G.LootEntry("ore", 300, 1))
    .AddLoot(new G.LootEntry("cut-stone", 50, 1))
    .AddLoot(new G.LootEntry("gold-ore", 3, 1))
    .AddLoot(new G.LootEntry("rough-diamond", 1, 1))
    .AddLoot(new G.LootEntry(null, 300, 1));
G.jobs.all.miner.AddLoot("miner", 5);

G.tables.waterman = new G.LootTable("Water Collector Job", "waterman")
    .AddLoot(new G.LootEntry("water", 4, 1))
    .AddLoot(new G.LootEntry("mud-water", 5, 1))
    .AddLoot(new G.LootEntry("poison-water", 3, 1))
    .AddLoot(new G.LootEntry("salt-water", 1, 3))
    .AddLoot(new G.LootEntry(null, 3, 1));
G.jobs.all.waterman.AddLoot("waterman", 4);

G.logger.info("Initializing Functions", "bm");

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
        "After months of searching, a suitable settlement spot has been found. " +
        "Out of the survivors, you have 2 elderly, 10 adults, and 4 children citizens. " +
        "You have to raise this colony by hand to get it to a thriving state." +
        G.c.r("#cc8800") + "<br>Out of the chatoic mess, a colony name comes out. (Enter this now, you can change it later)" + G.c.n);
    G.listening = true;
    G.listeningTo = "bmSettlementName";
}, true);
G.RegisterCommand("Ascend", "ascend and abandon your colony", "ascend", "ascend", function () {
    G.consoleOutput.push(G.c.c("#dd00dd") + "DO YOU REALLY WANT TO ASCEND? (y/n)" + G.c.n);
    G.listening = true;
    G.listeningTo = "bmConfirmAscend";
});
G.RegisterCommand("Force End", "force end the game", "forceEnd", "force-end", function () {
    G.consoleOutput.push("GAME ENDED");
    G.Broadcast("ccEnd");
});
G.RegisterCommand("Dev Add Colonists", "cheat in some extra colonists", "devAddColony", "dev-add-colony", function () {
    G.consoleOutput.push("How many colonists to cheat in?");
    G.listening = true;
    G.listeningTo = "bmCheatColonists";
    G.inputBox.type = "number";
});
G.RegisterCommand("Dev Set Morale", "cheat by setting the morale value", "devSetMorale", "dev-set-morale", function () {
    G.consoleOutput.push("What value to set morale to? (Previously " + G.colony.morale + ")");
    G.listening = true;
    G.listeningTo = "bmCheatMorale";
    G.inputBox.type = "number";
});
G.RegisterCommand("Dev Set Health", "chest by settings the health value", "devSetHealth", "dev-set-health", function () {
    G.consoleOutput.push("What value to set health to? (Previously " + G.colony.health + ")");
    G.listening = true;
    G.listeningTo = "bmCheatHealth";
    G.inputBox.type = "number";
});
G.RegisterCommand("Tick Game", "progress the game time by 1 year", "tick", "tick", function () {
    G.consoleOutput.push("1 Year has gone by...");
    G.eotw--;
    G.Broadcast("ccTick");
});
G.RegisterCommand("Tutorial", "shows a quick tutorial of the game", "tutorial", "tutorial", function () {
    G.consoleOutput.push("Tutorial not implemented yet. oof");
}, true);

G.RegisterCommand("Jobs", "manage worker job assignment", "jobs", "jobs", function () {
    var dropdownData = '<select id="dropdown"><option style="color:red" value="-1">Cancel</option>'
    G.availableJobs = [];
    for (job of Object.keys(G.jobs.all)) {
        if (G.MatchArray(G.jobs.unlocked, G.jobs.all[job].id)) {
            G.availableJobs.push(G.jobs.all[job]);
        }
    }
    for (job of G.availableJobs) {
        dropdownData += '<option style="color:' + job.color + '" value="' + G.availableJobs.indexOf(job) + '">' +
            job.count + " - " + job.name + "</option>";
    }
    dropdownData += "</select>";
    G.listeningDropdown = G.consoleOutput.push("Select a job to manage: " + dropdownData);
    G.listening = true;
    G.listeningTo = "bmChooseJob";
});

G.RegisterCommand("Research", "select or view current colony research", "research", "research", function () {
    var dropdown = 'What would you like to do? <select id="dropdown">' +
        '<option style="color:red" value="0">Cancel</option>' +
        '<option style="color:darkred" value="1">Stop Current Research</option>' +
        '<option style="color:dodgerblue" value="2">Pick New Research</otpion>' +
        '<option style="color:darkturquoise" value="3">Check Researched Technologies</option></select>';
    G.listeningDropdown = G.consoleOutput.push(dropdown);
    G.listening = true;
    G.listeningTo = "bmResearchOption";
});

G.RegisterCommand("Dev Jobs", "manage ALL worker job assignment", "devJobs", "dev-jobs", function () {
    var dropdownData = '<select id="dropdown"><option style="color:red" value="-1">Cancel</option>'
    G.availableJobs = [];
    for (job of Object.keys(G.jobs.all)) {
        //if (G.MatchArray(G.jobs.unlocked, G.jobs.all[job].id)) {
        G.availableJobs.push(G.jobs.all[job]);
        //}
    }
    for (job of G.availableJobs) {
        dropdownData += '<option style="color:' + job.color + '" value="' + G.availableJobs.indexOf(job) + '">' +
            job.count + " - " + job.name + "</option>";
    }
    dropdownData += "</select>";
    G.listeningDropdown = G.consoleOutput.push("Select a job to manage: " + dropdownData);
    G.listening = true;
    G.listeningTo = "bmChooseJob";
});

G.RegisterCommand("Dev List Inventory", "list all item names and ids", "devListInv", "dev-list-inv", function () {
    var invOut = G.c.c("#00cfcf") + "- [INVENTORY] -" + G.c.n;
    for (const category of Object.keys(G.inventory)) {
        invOut += "<br>[" + G.inventory[category].name.toUpperCase() + "]"
        for (const item of G.inventory[category].items) {
            invOut += "<br>" + item.name + " - " + item.itemid;
        }
    }
    G.consoleOutput.push(invOut);
}, false, true);

//Initialize Events
G.RegisterBroadcast("bmResearchOption", function () {
    const value = document.getElementById("dropdown").value;
    const replacements = ["Cancel", "Stop Current Research", "Pick New Research", "Check Researched Technologies"];
    G.consoleOutput[G.listeningDropdown - 1] = 'What would you like to do? <select disabled="true"><option>' + replacements[value] + '</option></select>';
    G.listeningDropdown = "";
    if (value == 0) {
        G.consoleOutput.push(G.c.c("#ffaa88") + "Cancelled" + G.c.n);
        return;
    } else if (value == 3) {
        if (G.evolution.researchesResearched.length == 0) {
            G.consoleOutput.push(G.c.c("dodgerblue") + "You have no researched technologies." + G.c.n);
            return;
        };
        G.consoleOutput.push(G.c.c("dodgerblue") + "- [Researched Technologies] -" + G.c.n);
        for (const technology of G.evolution.researches) {
            if (G.MatchArray(G.evolution.researchesResearched, technology.id)) {
                G.consoleOutput.push("- " + technology.name + " - " + technology.desc);
            }
        }
    } else if (value == 1) {
        if (G.evolution.research.current == null) {
            G.consoleOutput.push(G.c.c("#ff6644") + "You do not have an active research." + G.c.n);
            return;
        }
        G.listeningDropdown = G.consoleOutput.push(G.c.c("cadetblue") + 
            "Are you sure you want to cancel the current research? All current research progress will be lost. " + 
            '<select id="dropdown"><option value="-1" style="color: orange">No</option><option value="0" style="color: red">Yes</option></select>');
        G.listening = true;
        G.listeningTo = "bmResearchCancel";
    } else if (value == 2) {
        if (G.evolution.research.current != null) {
            G.consoleOutput.push(G.c.c("#ff6644") + "You already have an active research." + G.c.n);
            return;
        }
        G.listeningDropdown = G.consoleOutput.push()
        var options = [];
        for (const research of G.evolution.researches) {
            if (G.MatchArray(G.evolution.researchesResearched, research.id)) {
                continue;
            }
            var researchable = true;
            for (const requirement of research.req) {
                if (!(G.MatchArray(G.evolution.researchesResearched, requirement))) {
                    researchable = false;
                }
            }
            if (!researchable) {
                continue;
            }
            options.push(research);
        }
        if (options.length == 0) {
            G.consoleOutput.push(G.c.c("#ff6644") + "There is nothing to research." + G.c.n);
        }
        var researchDropdown = 'What do you want to research? <select id="dropdown"><option value="-1" style="color:red">Cancel</option>';
        for (i = 0; i < options.length; i++) {
            researchDropdown += '<option value="' + i + '" style="color:' + options[i].color + '">' + options[i].name + "</option>";
        }
        researchDropdown += '</select>';
        G.listeningDropdown = G.consoleOutput.push(researchDropdown);
        G.listening = true;
        G.listeningTo = "bmSelectResearch";
    }
});

G.RegisterBroadcast("bmSelectResearch", function () {
    
});

G.RegisterBroadcast("bmResearchCancel", function () {

});

G.RegisterBroadcast("bmChooseJob", function () {
    G.chosenJob = document.getElementById("dropdown").value;
    if (parseInt(G.chosenJob) == -1) {
        G.consoleOutput[G.listeningDropdown - 1] = 'Select a job to manage: <select disabled="true"><option>Cancel</option></select>';
        G.consoleOutput.push(G.c.c("#ffaa88") + "Cancelled" + G.c.n);
        G.listeningDropdown = "";
        return;
    }
    G.consoleOutput[G.listeningDropdown - 1] = 'Select a job to manage: <select disabled="true"><option>' + G.availableJobs[G.chosenJob].name + '</option></select>';
    G.consoleOutput.push(G.c.c("#ff99ff") + "You have " + G.availableJobs[G.chosenJob].count + " workers currently assigned to this job." + G.c.n);
    G.listeningDropdown = G.consoleOutput.push(G.c.c("#ff55ff") +
        'Would you like to <select id="dropdown">' +
        '<option value="Cancel" style="color:red">Cancel</option>' +
        '<option value="Assign" style="color:lime">Assign</option>' +
        '<option value="Unassign" style="color:orange">Unassign</orange></select>' + G.c.n);
    G.listening = true;
    G.listeningTo = "bmTypeJob";
});

G.RegisterBroadcast("bmTypeJob", function () {
    const assignChoice = document.getElementById("dropdown").value;
    G.consoleOutput[G.listeningDropdown - 1] = G.c.c("#ff77ff") + 'Would you like to <select disabled="true"><option>' + assignChoice + '</option></select>' + G.c.n;
    G.listeningDropdown = "";
    if (assignChoice == "Cancel") {
        G.consoleOutput.push(G.c.c("#ff5555") + "Cancelled" + G.c.n);
        return;
    } else if (assignChoice == "Assign") {
        if (G.colony.adult <= G.colony.assigned) {
            G.consoleOutput.push(G.c.c("#ffff55") + "All of your colony's workers are already assigned." + G.c.n);
            return;
        }
        G.consoleOutput.push(G.c.c("#22aaff") +
            "You have " + (G.colony.adult - G.colony.assigned) + " workers currently available in your colony." +
            "<br>How many would you like to assign? (0 = Cancel)" + G.c.n);
        G.listening = true;
        G.listeningTo = "bmAssignJob";
        G.inputBox.type = "number";
    } else if (assignChoice == "Unassign") {
        if (G.availableJobs[G.chosenJob].count == 0) {
            G.consoleOutput.push(G.c.c("#ffff55") + "You don't have any workers assigned to that job." + G.c.n);
            return;
        }
        G.consoleOutput.push(G.c.c("#ffaa22") +
            "You have " + (G.availableJobs[G.chosenJob].count) + " workers currently assigned to that job.<br>How many would you like to unassign? (0 = Cancel)" + G.c.n);
        G.listening = true;
        G.listeningTo = "bmUnassignJob";
    }
});

G.RegisterBroadcast("bmAssignJob", function (args) {
    const amtToAssign = parseInt(args);
    if (isNaN(amtToAssign)) {
        G.consoleOutput.push(G.c.c("#ffaa33") + "That's not a valid number. How many do you want to assign?" + G.c.n);
        G.listening = true;
        G.listeningTo = "bmAssignJob";
        G.inputBox.type = "number";
        return;
    }
    if (amtToAssign == 0) {
        G.consoleOutput.push(G.c.c("#ff5555") + "Cancelled" + G.c.n);
        return;
    }
    if (amtToAssign < 0) {
        G.consoleOutput.push(G.c.c("#ffaa33") + "You can't assign negative workers, try unassigning instead. How many do you want to assign?" + G.c.n);
        G.listening = true;
        G.listeningTo = "bmAssignJob";
        G.inputBox.type = "number";
        return;
    }
    if (amtToAssign > (G.colony.adult - G.colony.assigned)) {
        G.consoleOutput.push(G.c.c("#ffaa33") + "You don't have that many workers.<br>" +
            "You have " + (G.colony.adult - G.colony.assigned) + " workers currently available in your colony.<br>How many would you like to assign? (0 = Cancel)" + G.c.n);
        G.listening = true;
        G.listeningTo = "bmAssignJob";
        G.inputBox.type = "number";
        return
    }
    const manageJob = G.availableJobs[G.chosenJob];
    manageJob.count += amtToAssign;
    G.colony.assigned += amtToAssign;
    G.consoleOutput.push(G.c.c("#55ff55") + "Workers Assigned" + G.c.n);
});
G.RegisterBroadcast("bmUnassignJob", function (args) {
    const amtToAssign = parseInt(args);
    if (isNaN(amtToAssign)) {
        G.consoleOutput.push(G.c.c("#ffaa33") + "That's not a valid number. How many do you want to unassign?" + G.c.n);
        G.listening = true;
        G.listeningTo = "bmUnassignJob";
        G.inputBox.type = "number";
        return;
    }
    if (amtToAssign == 0) {
        G.consoleOutput.push(G.c.c("#ff5555") + "Cancelled" + G.c.n);
        return;
    }
    if (amtToAssign < 0) {
        G.consoleOutput.push(G.c.c("#ffaa33") + "You can't unassign negative workers, try assigning instead. How many do you want to unassign?" + G.c.n);
        G.listening = true;
        G.listeningTo = "bmUnassignJob";
        G.inputBox.type = "number";
        return;
    }
    if (amtToAssign > (G.availableJobs[G.chosenJob].count)) {
        G.consoleOutput.push(G.c.c("#ffaa33") + "You don't have that many workers assined to that job.<br>" +
            "You have " + (G.availableJobs[G.chosenJob].count) + " workers currently assigned to that job.<br>How many would you like to unassign? (0 = Cancel)" + G.c.n);
        G.listening = true;
        G.listeningTo = "bmUnassignJob";
        G.inputBox.type = "number";
        return;
    }
    const manageJob = G.availableJobs[G.chosenJob];
    manageJob.count -= amtToAssign;
    G.colony.assigned -= amtToAssign;
    G.consoleOutput.push(G.c.c("#55ff55") + "Workers Unassigned" + G.c.n);
});

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
    G.commands.hidden.push("dev-jobs");
    G.commands.unlocked.push("jobs");
    G.commands.unlocked.push("research");
    G.commands.unlocked.push("ascend");
    G.commands.unlocked.push("tick");
    G.BMColonyPanelUpdate();
    G.BMInvPanelUpdate();
    G.Save();
});
G.RegisterBroadcast("ccEnd", function () {
    G.colony.elder = 0;
    G.colony.adult = 0;
    G.colony.young = 0;
    G.eotw = -1;
    G.colony.name = "NO COLONY";
    G.commands.unlocked.push("settle");
    G.RemoveEntry(G.commands.hidden, "force-end");
    G.RemoveEntry(G.commands.hidden, "dev-add-colony");
    G.RemoveEntry(G.commands.hidden, "dev-set-morale");
    G.RemoveEntry(G.commands.hidden, "dev-set-health");
    G.RemoveEntry(G.commands.hidden, "dev-jobs");
    G.RemoveEntry(G.commands.unlocked, "jobs");
    G.RemoveEntry(G.commands.unlocked, "research");
    G.RemoveEntry(G.commands.unlocked, "ascend");
    G.RemoveEntry(G.commands.unlocked, "tick");
    document.getElementById("colony").innerHTML = "-[COLONY INFO]-<br>NO ACTIVE COLONY";
    G.ClearAllItems();
    G.BMInvPanelUpdate();
    G.Save();
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
            return;
        };
        var xpgain = G.colony.adult + G.colony.elder + G.colony.young;
        xpgain += G.evolution.researchesResearched.length * 25 + G.evolution.traitsEvolved.length * 25;
        G.stats.xp += xpgain;
        G.consoleOutput.push(G.c.c("#0077dd") + "You gained " + xpgain + " xp points!" + G.c.n)
        G.stats.LevelUp();
        G.Broadcast("ccEnd");
        return;
    };
    G.consoleOutput.push(G.c.c("#00afaf") + "Returning to your colony..." + G.c.n);
    return
});

G.RegisterBroadcast("bmCheatColonists", function (args) {
    const cheatAmount = parseInt(args);
    if (isNaN(cheatAmount)) {
        G.consoleOutput.push(G.c.c("#ee0000") + "Colonist amount not a number" + G.c.n);
        return
    };
    G.colony.adult += cheatAmount;
    G.consoleOutput.push(G.c.c("#00ee00") + "Successfully cheated colonists" + G.c.n);
    G.BMColonyPanelUpdate();
    return
});
G.RegisterBroadcast("bmCheatMorale", function (args) {
    const cheatAmount = parseInt(args);
    if (isNaN(cheatAmount)) {
        G.consoleOutput.push(G.c.c("#ee0000") + "Morale amount not a number" + G.c.n);
        return
    };
    G.logger.info("SETTING MORALE AMOUNT", "bm");
    G.colony.morale = cheatAmount;
    G.BMConditionUpdate();
    G.BMColonyPanelUpdate();
    G.consoleOutput.push(G.c.c("#00ee00") + "Successfully cheated morale value" + G.c.n);
    return
});
G.RegisterBroadcast("bmCheatHealth", function (args) {
    const cheatAmount = parseInt(args);
    if (isNaN(cheatAmount)) {
        G.consoleOutput.push(G.c.c("#ee0000") + "Helath amount not a number" + G.c.n);
        return
    };
    G.logger.info("SETTING HEALTH AMOUNT", "bm");
    G.colony.health = cheatAmount;
    G.BMConditionUpdate();
    G.BMColonyPanelUpdate();
    G.consoleOutput.push(G.c.c("#00ee00") + "Successfully cheated health value" + G.c.n);
    return
});
G.RegisterBroadcast("ccTick", function () {
    for (const job of Object.keys(G.jobs.all)) {
        var rollJob = G.jobs.all[job];
        if (rollJob.loot.table == null) {
            continue;
        }
        G.tables[rollJob.loot.table].Roll(Math.round(rollJob.count * rollJob.loot.rolls * G.colony.modifierWork));
    }
    G.BMColonyConsume("f", "food");
    G.BMColonyConsume("l", "water");
    G.BMConditionUpdate();
    G.BMPopulationUpdate();
    G.BMInventoryDecay();
    G.BMColonyPanelUpdate();
    G.BMInvPanelUpdate();
    if ((G.colony.adult + G.colony.elder + G.colony.young) <= 8) {
        G.consoleOutput.push(G.c.c("#ff0000") + "Your colony is dying, there is no hope left, you abandon your colony to try again." + G.c.n);
        G.Broadcast("ccEnd");
        return;
    }
    if (G.eotw == 5) {
        G.consoleOutput.push(G.c.c("#ee4444") + "The ground rumbles... The end of the world is near..." + G.c.n);
    } else if (G.eotw == 0) {
        G.consoleOutput.push(G.c.c("#ff0000") + "THE END OF THE WORLD IS HERE<br>" + G.c.r("#ee4444") + "You are forced to ascend to avoid the terrors of the end." + G.c.n);
        G.Broadcast("bmConfirmAscend", "y");
        return;
    };
    G.Save();
});
G.RegisterBroadcast("saveLoaded", function () {
    if (G.colony.name != "NO COLONY") {
        G.BMColonyPanelUpdate();
    } else {
        document.getElementById("colony").innerHTML = "-[COLONY INFO]-<br>NO ACTIVE COLONY";
    };
    G.BMInvPanelUpdate();
    G.BMStatsPanelUpdate();
});

//Initialize Functions
G.BMColonyPanelUpdate = function () {
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
};

G.BMStatsPanelUpdate = function () {
    const statsPanel = document.getElementById("stats");
    const writePanel =
        G.c.c("#0088ff") + "- [LEGACY STATS] -<br>" + G.c.n +
        G.c.c("#00aaff") + "LEGACY LEVEL: " + G.stats.level + "<br>" + G.c.n +
        G.c.c("#00ccee") + "Skill Points: " + G.stats.skillpts + "<br>" + G.c.n +
        G.c.c("#00dddd") + "Talent Points: " + G.stats.talentpts + "<br>" + G.c.n +
        G.c.c("#00eecc") + "XP: " + G.stats.xp + "/" + G.stats.lvlup + "<br>" + G.c.n +
        G.c.c("#00ffaa") + G.GenBar(G.stats.xp, G.stats.lvlup, 10) + G.c.n;
    statsPanel.innerHTML = writePanel;
};

G.BMInvPanelUpdate = function () {
    const invPanel = document.getElementById("inv");
    var writePanel = G.c.c("#00cfcf") + "- [INVENTORY] -" + G.c.n;
    var items = false;
    for (const category of Object.keys(G.inventory)) {
        if (G.CategoryIsEmpty(G.inventory[category])) {
            continue;
        }
        items = true;
        writePanel += "<br>[" + G.inventory[category].name.toUpperCase() + "]"
        for (const item of G.inventory[category].items) {
            if (item.count == 0) {
                continue;
            }
            writePanel += "<br>" + item.count + " - " + item.name;
        }
    }
    if (items) {
        invPanel.innerHTML = writePanel;
    } else {
        invPanel.innerHTML = G.c.c("#00efef") + "- [INVENTORY] -" + G.c.n + "<br>EMPTY";
    }
};

G.BMConditionUpdate = function () {
    G.colony.morale = Math.max(Math.min(G.colony.morale, 2000), -2000)
    G.colony.health = Math.max(Math.min(G.colony.health, 2000), -2000)
    G.colony.overall = Math.round((G.colony.morale + G.colony.health) / 2)
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
};

G.BMPopulationUpdate = function () {
    const deathAmt = Math.round(((G.RandBetween(10, 20) / 100) * (2 ** (-G.colony.health / 1000))) * G.colony.elder);
    const ageAmt = Math.round((G.RandBetween(4, 15) / 100) * G.colony.adult);
    const growAmt = Math.round((G.RandBetween(25, 50) / 100) * G.colony.young);
    const bornAmt = Math.round(((G.RandBetween(15, 30) / 100) * G.colony.modifierHealth) * (G.colony.adult / 2));
    G.colony.elder += ageAmt - deathAmt;
    G.colony.adult += growAmt - ageAmt;
    G.colony.young += bornAmt - growAmt;
    G.consoleOutput.push(G.c.c("#00aaff") + "- [POPULATION UPDATE] -<br>" + G.c.r("#cccc00") +
        "Population Change: " + (bornAmt - deathAmt) + G.c.r("#dd3300") +
        "<br>" + deathAmt + " elderly have died.<br>" + G.c.r("#33dd00") +
        bornAmt + " children have been born.<br>" + G.c.r("#dd33dd") +
        "Your new worker count is " + G.colony.adult + G.c.n);
};

G.BMColonyConsume = function (type, name, adultmodifier = 1, eldermodifier = 1, youngmodifier = 0.5, moralemodifier = 15, healthmodifier = 15) {
    const consumeAmount = Math.round(G.colony.adult * adultmodifier) + Math.round(G.colony.elder * eldermodifier) + Math.round(G.colony.young * youngmodifier);
    var currentConsume = 0;
    var moraleChange = 0;
    var healthChange = 0;
    for (var currentPriority = G.highestPriority[type]; currentPriority >= 0; currentPriority--) {
        var priorityList = [];
        for (category of Object.keys(G.inventory)) {
            for (item of G.inventory[category].items) {
                if (item.itemtype == "f") {
                    if (item.type == type && item.priority == currentPriority) {
                        priorityList.push(item);
                    }
                }
            }
        }
        while (!(G.CategoryIsEmpty({ items: priorityList }))) {
            var randomIndex = Math.floor(Math.random() * priorityList.length);
            var chosenItem = priorityList[randomIndex];
            if (chosenItem.count <= 0) {
                continue;
            }
            currentConsume += chosenItem.saturation;
            chosenItem.count--;
            moraleChange += ((chosenItem.enjoyment * moralemodifier) / consumeAmount);
            healthChange += ((chosenItem.health * healthmodifier) / consumeAmount);
            if (currentConsume >= consumeAmount) {
                break;
            }
        }
        if (currentConsume >= consumeAmount) {
            break;
        }
    }
    if (currentConsume < consumeAmount) {
        moraleChange -= (consumeAmount - currentConsume);
        healthChange -= (consumeAmount - currentConsume);
        G.consoleOutput.push(G.c.c("#ff7777") + "Your colony is not getting enough " + name + G.c.n);
    }
    G.consoleOutput.push(G.c.c("#ff77ff") + "After consuming " + name +
        ", colony morale has been changed by " + Math.round(moraleChange / 10) + "% and colony health has been changed by " +
        Math.round(healthChange / 10) + "%." + G.c.n);
    G.colony.morale += moraleChange;
    G.colony.health += healthChange;
};

G.BMInventoryDecay = function () {
    for (category of Object.keys(G.inventory)) {
        for (item of G.inventory[category].items) {
            item.count = Math.round(item.count * G.storageEfficiency);
        }
    }
    G.consoleOutput.push(G.c.c("#ffcc77") + Math.round((1 - G.storageEfficiency) * 100) + "% of all items in your inventory have decayed." + G.c.n);
};

G.BMEvoPanelUpdate = function () {
    var newPanel = G.c.c("lawngreen") + "- [RESEARCH] -<br>";
    if (G.evolution.research.current == null) {
        newPanel += G.c.r("darkorange") + "NO ACTIVE RESEARCH<br>";
    } else {
        newPanel += G.c.n + G.evolution.research.current.name;
        const types = ["Invention", "Math", "Science", "Aerospace"];
        const colors = ["paleturquoise", "palegoldenrod", "palegreen", "palevioletred"];
        for (i = 0; i < 4; i++) {
            if (G.evolution.research.needed[i] == 0) {
                continue;
            }
            newPanel += G.c.c(colors[i]) + types[i] + " " +
                G.evolution.research.progress[i] + "/" + G.evolution.research.needed[i] +
                "<br>" + G.GenBar(G.evolution.research.progress[i], G.evolution.research.needed[i], 10) + G.c.n;
        }
    }
    newPanel += G.c.r("mediumspringgreen") + "<br>- [TRAITS] -<br>";
    if (G.evolution.trait.current == null) {
        newPanel += G.c.r("darkorange") + "NO ACTIVE TRAIT<br>";
    }
    document.getElementById("evo").innerHTML = newPanel;
};

//Initialize Panels
G.InitializePanel("colony");
document.getElementById("colony").innerHTML = "-[COLONY INFO]-<br>NO ACTIVE COLONY";
document.getElementById("colony").style.textAlign = "center";

G.InitializePanel("stats");
document.getElementById("stats").style.textAlign = "center";
G.BMStatsPanelUpdate();

G.InitializePanel("inv");
document.getElementById("inv").style.textAlign = "center";
G.BMInvPanelUpdate();

G.InitializePanel("evo");
document.getElementById("evo").style.textAlign = "center";
G.BMEvoPanelUpdate();

G.logger.info("LOAD: BASEMOD ALPHA v1.1.0", "bm");
G.LoadMods();