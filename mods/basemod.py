#Import Game instance
from init import G, C

G.initialize_mod(__name__)
G.storaGe_efficiency = 0.9

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
def population_update():
    G.colony.elder -= round(G.colony.elder * 0.1)
    G.colony.elder += round(G.colony.adult * 0.075)
    G.colony.adult -= round(G.colony.adult * 0.075)
    G.colony.adult += round(G.colony.young * 0.15)
    G.colony.younG -= round(G.colony.young * 0.15)
    G.colony.younG += round(G.colony.adult * 0.5 * G.colony.modifier_health)


#Define all commands
def get_stats():
    print("-[LEGACY STATS]-\nLegacy Level: {}\nLegacy XP: {}/{} {}\nSkill Points: {}\nTalent Points: {}".format(G.stats.level,G.stats.xp,G.stats.lvlup,G.gen_bar(G.stats.xp,G.stats.lvlup,20),G.stats.skillpts,G.stats.talentpts))


def check_colony():
    print("{C.b}-[COLONY INFO]-\n{C.c}-POPULATION: {}-{C.n}\nChildren: {}\nAdults: {}\nElderly: {}\n{C.m}-OVERALL CONDITIONS: {}%-{C.n}\nHappiness: {}%\nHealth: {}%".format(G.colony.elder+G.colony.adult+G.colony.young,G.colony.young,G.colony.adult,G.colony.elder,round((G.colony.health+G.colony.happiness)/20),round(G.colony.happiness/10),round(G.colony.health/10),C=C))


def save():
    pass


def give_all_resources():
    G.enter_dev_pass()
    try:
        print("AMOUNT TO GIVE:\n>",end="")
        resource_count = int(input())
        for category in G.inventory:
            for resource in G.inventory[category].items:
                resource.count += resource_count
        print(C.G+"RESOURCES ADDED"+C.n)
    except:
        print(C.r+"NOT A NUMBER"+C.n)
        return False


def rsm__tick():
    for category in G.inventory:
        for resource in G.inventory[category].items:
            resource.count = round(resource.count * G.storage_efficiency)
    print(
        str(round((1 - G.storage_efficiency) * 100, 1)) +
        "% of all your resources have decayed.")
    if G.colony.happiness > 2000:
        G.colony.happiness = 2000
    if G.colony.happiness < -2000:
        G.colony.happiness = -2000
    hapcalc = G.colony.happiness / 1000
    helcalc = G.colony.happiness / 1000
    G.colony.modifier_work = 2**hapcalc
    G.colony.modifier_health = 2**helcalc



#Initialize all commands
G.register_command("stats", __name__, "get_stats", True)
G.register_command("colony", __name__, "check_colony")
G.register_command("dev-give-all", __name__, "give_all_resources")

#Create Resource CateGories
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
G.inventory["resource"].items.append(G.Resource("Rocks", 0, "resource", "rock"))


#Game Start Function
def rsm__start():
    G.unlocked.append("colony")
    G.hidden.append("dev-give-all")
    G.colony.young = 4
    G.colony.adult = 10
    G.colony.elder = 2


#Game End Function
def rsm__end():
    G.unlocked.remove("colony")
    G.hidden.remove("dev-give-all")
    G.colony.young = 0
    G.colony.adult = 0
    G.colony.elder = 0
    G.colony.happiness = 0
    G.colony.health = 0
    G.colony.modifier_work = 0
    G.colony.modifier_health = 0
