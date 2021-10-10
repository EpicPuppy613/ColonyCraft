#Import Game instance
from init import G, C
from random import randint

G.initialize_mod(__name__)
G.storage_efficiency = 0.9

#Stats Init
stats = G.Empty()
stats.level = 1
stats.xp = 0
stats.skillpts = 0
stats.talentpts = 0
stats.lvlup = 100
G.stats = stats

#Colony Init
colony = G.Empty()
colony.young = 0
colony.adult = 0
colony.elder = 0
colony.morale = 0
colony.health = 0
colony.modifier_work = 0
colony.modifier_health = 0
colony.hapcolor = C.custom[0]
colony.heacolor = C.custom[0]
colony.ovecolor = C.custom[0]
colony.threshhold = [-1751, -1251, -501, 0, 500, 1250, 1750, 2000]
colony.color = [88, 160, 202, 220, 190, 154, 119, 123]
G.colony = colony


#Tick Commands
def population_update():
    randdeath = randint(15, 25) / 100
    randage = randint(4, 15) / 100
    randgrow = randint(25, 40) / 100
    randborn = randint(20, 40) / 100
    print("{C.custom[166]}{} Elders have passed away.".format(round(G.colony.elder * randdeath),C=C))
    G.colony.elder -= round(G.colony.elder * randdeath)
    print("{C.custom[190]}{} Adults have aged.".format(round(G.colony.adult * randage),C=C))
    G.colony.elder += round(G.colony.adult * randage)
    G.colony.adult -= round(G.colony.adult * randage)
    print("{C.custom[82]}{} Children have grown up.".format(round(G.colony.young * randgrow),C=C))
    G.colony.adult += round(G.colony.young * randgrow)
    G.colony.young -= round(G.colony.young * randgrow)
    print("{C.custom[85]}{} Babies have been born.".format(round(G.colony.adult * randborn * G.colony.modifier_health),C=C))
    G.colony.young += round(G.colony.adult * randborn * G.colony.modifier_health)


#Define all commands
def get_stats():
    print(
        "{C.custom[80]}-[LEGACY STATS]-{C.n}\nLegacy Level: {}\nLegacy XP: {}/{} {}\nSkill Points: {}\nTalent Points: {}"
        .format(G.stats.level,
                G.stats.xp,
                G.stats.lvlup,
                G.gen_bar(G.stats.xp, G.stats.lvlup, 20),
                G.stats.skillpts,
                G.stats.talentpts,
                C=C))


def check_colony():
    print(
        "{C.b}-[COLONY INFO]-\n{C.c}-POPULATION: {}-{C.custom[85]}\nChildren: {}\n{C.custom[82]}Adults: {}\n{C.custom[190]}Elderly: {}\n{C.m}-OVERALL CONDITIONS: {G.colony.ovecolor}{}%{C.n}{C.m}-{C.n}\nMorale: {G.colony.hapcolor}{}%{C.n}\nHealth: {G.colony.heacolor}{}%{C.n}"
        .format(G.colony.elder + G.colony.adult + G.colony.young,
                G.colony.young,
                G.colony.adult,
                G.colony.elder,
                round((G.colony.health + G.colony.morale) / 20),
                round(G.colony.morale / 10),
                round(G.colony.health / 10),
                C=C,
                G=G))


def save():
    pass


def give_all_resources():
    if G.enter_dev_pass():
        pass
    else:
        return False
    try:
        print("AMOUNT TO GIVE:\n>", end="")
        resource_count = int(input())
        for category in G.inventory:
            for resource in G.inventory[category].items:
                resource.count += resource_count
        print(C.g + "RESOURCES ADDED" + C.n)
        return True
    except:
        print(C.r + "NOT A NUMBER" + C.n)
        return False


def match(keys, vals, value):
    for i in range(len(keys)):
        if value <= keys[i]:
            return vals[i]
        else:
            continue
    return False


def recalculate_wellness():
    if G.colony.morale > 2000:
        G.colony.morale = 2000
    if G.colony.morale < -2000:
        G.colony.morale = -2000
    if G.colony.health > 2000:
        G.colony.health = 2000
    if G.colony.health < -2000:
        G.colony.health = -2000
    hapcalc = G.colony.morale / 1000
    heacalc = G.colony.morale / 1000
    G.colony.modifier_work = 2**hapcalc
    G.colony.modifier_health = 2**heacalc
    hapval = match(G.colony.threshhold, G.colony.color, G.colony.morale)
    heaval = match(G.colony.threshhold, G.colony.color, G.colony.health)
    overall = round((G.colony.morale + G.colony.health) / 2)
    oveval = match(G.colony.threshhold, G.colony.color, overall)
    G.colony.hapcolor = C.custom[hapval]
    G.colony.heacolor = C.custom[heaval]
    G.colony.ovecolor = C.custom[oveval]


def rsm__tick():
    for category in G.inventory:
        for resource in G.inventory[category].items:
            resource.count = round(resource.count * G.storage_efficiency)
    print(C.custom[9] + str(round((1 - G.storage_efficiency) * 100, 1)) +
          "% of all your resources have decayed." + C.n)
    recalculate_wellness()
    population_update()
    G.eotw -= 1
    if G.eotw <= 1:
        print("{C.custom[196]}THE END OF THE WORLD IS HERE{C.n}".format(C=C))
        G.stats.xp += G.colony.elder + G.colony.young + G.colony.adult
    elif G.eotw <= 5:
        print("{C.custom[203]}Your shamans are saying that the end of the world is coming.{C.n}".format(C=C))


def dev_change_health():
    if G.enter_dev_pass():
        pass
    else:
        return False
    print("ENTER POINTS TO CHANGE HEALTH BY (10pts = 1%)")
    while True:
        try:
            change = int(input(">"))
            break
        except:
            print(C.r+"NOT A VALID NUMBER"+C.n)
            continue
    G.colony.health += change
    recalculate_wellness()
    print(C.g+"HEALTH VALUE SUCESSFULLY CHANGED"+C.n)
    return True
    

def dev_change_morale():
    if G.enter_dev_pass():
        pass
    else:
        return False
    print("ENTER POINTS TO CHANGE MORALE BY (10pts = 1%)")
    while True:
        try:
            change = int(input(">"))
            break
        except:
            print(C.r+"NOT A VALID NUMBER"+C.n)
            continue
    G.colony.morale += change
    recalculate_wellness()
    print(C.g+"MORALE VALUE SUCESSFULLY CHANGED"+C.n)
    return True

#Initialize all commands
G.register_command("stats", __name__, "get_stats", True)
G.register_command("colony", __name__, "check_colony")
G.register_command("dev-give-all", __name__, "give_all_resources")
G.register_command("dev-change-health", __name__ ,"dev_change_health")
G.register_command("dev-change-morale", __name__, "dev_change_morale")

#Create Resource CateGories
G.inventory["food"] = G.Category("Food", [], "food")
G.inventory["liquid"] = G.Category("Liquids", [], "liquid")
G.inventory["resource"] = G.Category("Resources", [], "resource")

#Define Food
G.inventory["food"].items.append(G.Food("Fruit", 0, "food", "fruit", 2, 1, 3))
G.inventory["food"].items.append(
    G.Food("Raw Meat", 0, "food", "raw-meat", 2, -2, 2))
G.inventory["food"].items.append(
    G.Food("Cooked Meat", 0, "food", "cooked-meat", 4, 3, 4))
G.inventory["food"].items.append(
    G.Food("Raw Seafood", 0, "food", "raw-fish", 2, -2, 2))
G.inventory["food"].items.append(
    G.Food("Cooked Seafood", 0, "food", "cooked-fish", 3, 3, 4))
G.inventory["food"].items.append(G.Food("Sushi", 0, "food", "sushi", 3, 2, 4))

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
def rsm__start():
    G.unlocked.append("colony")
    G.hidden.append("dev-give-all")
    G.hidden.append("dev-change-health")
    G.hidden.append("dev-change-morale")
    G.colony.young = 4
    G.colony.adult = 10
    G.colony.elder = 2
    G.colony.morale = 0
    G.colony.health = 0
    G.eotw = 20
    recalculate_wellness()


#Game End Function
def rsm__end():
    G.unlocked.remove("colony")
    G.hidden.remove("dev-give-all")
    G.hidden.remove("dev-change-health")
    G.hidden.remove("dev-change-morale")
    G.colony.young = 0
    G.colony.adult = 0
    G.colony.elder = 0
    G.colony.morale = 0
    G.colony.health = 0
    G.colony.modifier_work = 0
    G.colony.modifier_health = 0
    G.eotw = 0


def rsm__version():
    release = "{C.custom[10]}basemod {C.custom[202]}ALPHA{C.n} ".format(C=C)
    version = "0.3.0"
    print(release + version)
