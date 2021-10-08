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
colony.hapiness = 0
colony.health = 0
G.colony = colony


#Define all commands
def get_stats(g):
    print("-[LEGACY STATS]-\nLevel: " + str(stats.level) + "\nXP: " +
          str(stats.xp) + "/" + str(stats.lvlup) + " " +
          g.gen_bar(stats.xp, stats.lvlup, 20) + "\nSkill Points: " +
          str(stats.skillpts) + "\nTalent Points: " + str(stats.talentpts))


def check_colony(g):
  pass


def save(g):
    pass


def rsm__tick(g):
    for category in g.inventory:
        for resource in g.inventory[category].items:
            resource.count = round(resource.count * g.storage_efficiency)
    print(
        str(round((1 - g.storage_efficiency) * 100, 1)) +
        "% of all your resources have decayed.")


#Initialize all commands
G.register_command("stats", __name__, "get_stats", True)

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
    G.colony.young = 4
    G.colony.adult = 10
    G.colony.elder = 2


#Game End Function
def rsm__end(g):
    pass
