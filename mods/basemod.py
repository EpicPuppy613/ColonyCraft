#Import game instance
from init import G

G.initialize_mod(__name__)
G.storage_efficiency = 0.9

#Stats Init
stats = type('', (), {})()
stats.level = 1
stats.xp = 0
stats.skillpts = 0
stats.talentpts = 0
stats.lvlup = 100
G.stats = stats

#Colony Init
colony = type('', (), {})()
colony.young = 0
colony.adult = 0
colony.elder = 0
colony.happiness = 0
colony.health = 0
colony.modifier_work = 0
colony.modifier_health = 0
G.colony = colony


#Tick Commands
def population_update(g):
    g.colony.elder -= round(g.colony.elder * 0.1)
    g.colony.elder += round(g.colony.adult * 0.075)
    g.colony.adult -= round(g.colony.adult * 0.075)
    g.colony.adult += round(g.colony.young * 0.15)
    g.colony.young -= round(g.colony.young * 0.15)
    g.colony.young += round(g.colony.adult * 0.5 * g.colony.modifier_health)


#Define all commands
def get_stats(g):
    print("-[LEGACY STATS]-\nLegacy Level: {}\nLegacy XP: {}/{} {}\nSkill Points: {}\nTalent Points: {}".format(g.stats.level,g.stats.xp,g.stats.lvlup,g.gen_bar(g.stats.xp,g.stats.lvlup,20),g.stats.skillpts,g.stats.talentpts))


def check_colony(g):
    print("-[COLONY INFO]-\n-POPULATION: {}-\nChildren: {}\nAdults: {}\nElderly: {}\n-OVERALL CONDITIONS: {}%-\nHappiness: {}%\nHealth: {}%".format(g.colony.elder+g.colony.adult+g.colony.young,g.colony.young,g.colony.adult,g.colony.elder,round((g.colony.health+g.colony.happiness)/20),round(g.colony.happiness/10),round(g.colony.health/10)))


def save(g):
    pass


def give_all_resources(g):
    pass


def rsm__tick(g):
    for category in g.inventory:
        for resource in g.inventory[category].items:
            resource.count = round(resource.count * g.storage_efficiency)
    print(
        str(round((1 - g.storage_efficiency) * 100, 1)) +
        "% of all your resources have decayed.")
    if g.colony.happiness > 2000:
        g.colony.happiness = 2000
    if g.colony.happiness < -2000:
        g.colony.happiness = -2000
    hapcalc = g.colony.happiness / 1000
    helcalc = g.colony.happiness / 1000
    g.colony.modifier_work = 2**hapcalc
    g.colony.modifier_health = 2**helcalc



#Initialize all commands
G.register_command("stats", __name__, "get_stats", True)
G.register_command("colony", __name__, "check_colony")

#Create Resource Categories
G.inventory["food"] = G.Category("Food", [], "food")
G.inventory["liquid"] = G.Category("Liquids", [], "liquid")
G.inventory["resource"] = G.Category("Resources", [], "resource")

#Define Food
G.inventory["food"].items.append(G.Resource("Fruit", 0, "food", "fruit"))
G.inventory["food"].items.append(G.Resource("Raw Meat", 0, "food", "raw-meat"))
G.inventory["food"].items.append(
    G.Resource("Cooked Meat", 0, "food", "cooked-meat"))

#Define Liquids
G.inventory["liquid"].items.append(
    G.Resource("Fresh Water", 0, "liquid", "water"))
G.inventory["liquid"].items.append(
    G.Resource("Salt Water", 0, "liquid", "sea-water"))
G.inventory["liquid"].items.append(
    G.Resource("Dirty Water", 0, "liquid", "mud-water"))

#Define Resource
G.inventory["resource"].items.append(
    G.Resource("Sticks", 0, "resource", "stick"))
G.inventory["resource"].items.append(G.Resource("Rocks", 0, "resource",
                                                "rock"))


#Game Start Function
def rsm__start(g):
    g.unlocked.append("colony")
    g.colony.young = 4
    g.colony.adult = 10
    g.colony.elder = 2


#Game End Function
def rsm__end(g):
    G.unlocked.remove("colony")
