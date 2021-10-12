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
colony.workers = [0,0]
colony.hapcolor = C.custom[0]
colony.heacolor = C.custom[0]
colony.ovecolor = C.custom[0]
colony.rations = [1,1]
colony.threshhold = [-1751, -1251, -501, 0, 500, 1250, 1750, 2000]
colony.color = [88, 160, 202, 220, 190, 154, 119, 123]
G.colony = colony


#Jobs Init
jobs = G.Empty()
jobs.all = {}
jobs.unlocked = []
G.jobs = jobs


#Tick Commands
def population_update():
    heacalc = G.colony.health / 1000
    randdeath = (randint(10, 20) / 100) * 2**(-heacalc)
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
    G.colony.workers[1] = G.colony.adult


def manual_ascend():
    print(C.m+"ARE YOU REALLY SURE YOU WANT TO ASCEND? (Y/N)"+C.c)
    confirmation = input(">")
    if confirmation.lower() == "y":
        force_ascend()
    else:
        print(C.custom[154] + "Returning to your colony..." + C.c)


def force_ascend():
    if G.colony.elder + G.colony.adult + G.colony.young < 100:
        print(C.r+"Your colony didn't get big enough in order for you to be more experienced."+C.n)
        G.rsm__("end")
        return False
    xp_gain = 0
    xp_gain += G.colony.elder + G.colony.adult + G.colony.young
    xp_gain += len(G.researched) * 10
    xp_gain += len(G.evolved) * 10
    print(C.custom[39] + "You gained {} xp points because of this colony.".format(xp_gain)+C.c)
    G.stats.xp += xp_gain
    levels = 0
    skillgain = 0
    talentgain = 0
    while G.stats.xp > G.stats.lvlup:
        levels += 1
        G.stats.level += 1
        G.stats.xp -= G.stats.lvlup
        G.stats.lvlup = round(G.stats.lvlup*1.5)
        G.stats.skillpts += 1
        skillgain += 1
        G.stats.talentpts += 1
        talentgain += 1
        if G.stats.level % 2 == 0:
            G.stats.skillpts += 1
            skillgain += 1
    if levels > 0:
        print(C.custom[51] + "You leveled up {} times! You gain {} skill points and {} talent points".format(levels,skillgain,talentgain) + C.n)
    G.rsm__("end")


def colony_consume():
    food_saturation = ((G.colony.young*0.5)+G.colony.adult+G.colony.elder)*colony.rations[0]
    water_saturation = ((G.colony.young*0.5)+G.colony.adult+G.colony.elder)*colony.rations[0]
    food_total = food_saturation
    water_total = water_saturation
    water_available = []
    food_available = []
    water_options = [[],[],[],[],[],[],[],[]]
    food_options = [[],[],[],[],[],[],[],[]]
    options_key = [8,7,6,5,4,3,2,1]
    for category in G.inventory:
        for item in G.inventory[category].items:
            if isinstance(item, G.Liquid):
                water_available.append(item)
            if isinstance(item, G.Food):
                food_available.append(item)
    for food in food_available:
        food_options[options_key.index(food.priority)].append(food)
    for water in water_available:
        water_options[options_key.index(water.priority)].append(water)
    morale_change = 0
    while food_saturation > 0:
        for priority in food_options:
            priority_count = 0
            for item in priority:
                priority_count+= item.count
            if priority_count == 0:
                continue
            food_choice = randint(0,len(priority)-1)
            if priority[food_choice].count == 0:
                break
            priority[food_choice].count -= 1
            food_saturation -= priority[food_choice].saturation
            morale_change += (priority[food_choice].saturation*priority[food_choice].enjoyment)/(food_total/10)
            break
        total_count = 0
        for priority in food_options:
            for item in priority:
                total_count += item.count
        if total_count == 0:
            G.colony.health -= food_saturation
            morale_change -= round(food_saturation)
            print(C.r+"Your people are starving. Colony health decreased by {}%".format(round(food_saturation/10))+C.n)
            break
    while water_saturation > 0:
        for priority in water_options:
            priority_count = 0
            for item in priority:
                priority_count+= item.count
            if priority_count == 0:
                continue
            water_choice = randint(0,len(priority)-1)
            if priority[water_choice].count == 0:
                break
            priority[water_choice].count -= 1
            water_saturation -= priority[water_choice].saturation
            morale_change += (priority[water_choice].saturation*priority[water_choice].enjoyment)/(water_total/10)
            break
        total_count = 0
        for priority in water_options:
            for item in priority:
                total_count += item.count
        if total_count == 0:
            G.colony.health -= 2 * water_saturation
            morale_change -= round(water_saturation)
            print(C.r+"Your people are thirsty. Colony health decreased by {}%".format(round(2*water_saturation/10))+C.n)
            break
    G.colony.morale += morale_change
    print(C.c+"After food and liquids were consumed, {}% morale has been changed".format(round(morale_change/10))+C.n)
    



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


def job_management():
    print("What job do you want to manage?\n{C.r}[0] Cancel{C.n}".format(C=C))
    for job in G.jobs.unlocked:
        print("[{}] {} - {} Current Workers".format(G.jobs.unlocked.index(job)+1,job.name,job.count))
    while True:
        try:
            choice = int(input(">"))
            if choice != 0:
                selection = G.jobs.unlocked[choice-1]
            break
        except:
            print(C.r+"Invalid Selection"+C.n)
            continue
    if choice == 0:
        print(C.r+"Canceled"+C.n)
        return False
    while True:
        print("Do you want to assign(a) or unassign(u) workers?")
        action = input(">").lower()
        if action != "a" and action != "u":
            print(C.r+"Thats not a valid selection"+C.n)
            continue
        break
    if action == "a":
        print(C.c+"You have {}/{} workers currently assigned.\nHow many do you want to assign (0 = cancel)?".format(G.colony.workers[0],G.colony.workers[1])+C.n)
        while True:
            try:
                amount = int(input(">"))
            except:
                print(C.r+"Invalid number"+C.n)
                continue
            if amount == 0:
                print(C.r+"Canceled"+C.n)
                return False
            elif amount > G.colony.workers[1]-G.colony.workers[0]:
                print(C.r+"You don't have enough workers"+C.n)
                continue
            else:
                break
        selection.count += amount
        G.colony.workers[0] += amount
        print(C.g + "Assigned Workers" + C.n)
        return True
    elif action == "u":
        print(C.m+"You have {} workers currently assigned to that job.\nHow many do you want to unassign (0 = cancel)?".format(selection.count)+C.n)
        while True:
            try:
                amount = int(input(">"))
            except:
                print(C.r+"Invalid Number"+C.n)
                continue
            if amount == 0:
                print(C.r+"Canceled"+C.n)
                return False
            elif amount > selection.count:
                print(C.r+"You don't have that many workers assigned to that job"+C.n)
                continue
            else:
                break
        selection.count -= amount
        G.colony.workers[0] -= amount
        print(C.g + "Unassigned Workers" + C.n)
        return True
    

def rsm__tick():
    colony_consume()
    for category in G.inventory:
        for resource in G.inventory[category].items:
            resource.count = round(resource.count * G.storage_efficiency)
    print(C.custom[9] + str(round((1 - G.storage_efficiency) * 100, 1)) +
          "% of all your resources have decayed." + C.n)
    recalculate_wellness()
    population_update()
    G.eotw -= 1
    if G.eotw <= 1:
        print("{C.custom[196]}THE END OF THE WORLD HAS COME{C.n}".format(C=C))
        print(C.r + "You are forced to ascend to avoid the terrors of the end." + C.n)
        force_ascend()
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
G.register_command("jobs", __name__, "job_management")
G.register_command("colony", __name__, "check_colony")
G.register_command("dev-give-all", __name__, "give_all_resources")
G.register_command("dev-change-health", __name__ ,"dev_change_health")
G.register_command("dev-change-morale", __name__, "dev_change_morale")
G.register_command("ascend", __name__, "manual_ascend")

#Initialize jobs
G.jobs.all["gatherer"] = G.Job(C.custom[46]+"Gatherer"+C.n,"gatherer",0)
G.jobs.all["woodcutter"] = G.Job(C.custom[46]+"Woodcutter"+C.n,"woodcutter",0)
G.jobs.all["digger"] = G.Job(C.custom[46]+"Digger"+C.n,"digger",0)
G.jobs.all["thinker"] = G.Job(C.custom[87]+"Thinker"+C.n,"thinker",0)
G.jobs.all["inventor"] = G.Job(C.custom[87]+"Inventor"+C.n,"inventor",0)
G.jobs.all["scientist"] = G.Job(C.custom[87]+"Scientist"+C.n,"scientist",0)
G.jobs.all["crafter"] = G.Job(C.custom[226]+"Crafter"+C.n,"crafter",0)
G.jobs.all["toolmaker"] = G.Job(C.custom[226]+"Toolmaker"+C.n,"toolmaker",0)
G.jobs.all["carpenter"] = G.Job(C.custom[226]+"Carpenter"+C.n,"carpenter",0)
G.jobs.all["blacksmith"] = G.Job(C.custom[226]+"Blacksmith"+C.n,"blacksmith",0)

#Create Resource CateGories
G.inventory["food"] = G.Category("Food", [], "food")
G.inventory["liquid"] = G.Category("Liquids", [], "liquid")
G.inventory["primitive"] = G.Category("Primitive Resources", [], "primitive")
G.inventory["equipment"] = G.Category("Equipment", [], "equipment")

#Define Food
G.inventory["food"].items.append(G.Food("Wild Vegetation", 0, "food", "wild-greens", 1, 0, 2))
G.inventory["food"].items.append(G.Food("Grown Vegetation", 0, "food", "grown-greens", 2,1, 3))
G.inventory["food"].items.append(G.Food("Fruit", 0, "food", "fruit", 2, 1, 3))
G.inventory["food"].items.append(G.Food("Raw Meat", 0, "food", "raw-meat", 2, -2, 1))
G.inventory["food"].items.append(G.Food("Cooked Meat", 0, "food", "cooked-meat", 4, 3, 4))
G.inventory["food"].items.append(G.Food("Raw Seafood", 0, "food", "raw-fish", 2, -2, 1))
G.inventory["food"].items.append(G.Food("Cooked Seafood", 0, "food", "cooked-fish", 3, 3, 4))
G.inventory["food"].items.append(G.Food("Sushi", 0, "food", "sushi", 3, 2, 4))

#Define Liquids
G.inventory["liquid"].items.append(G.Liquid("Fresh Water", 0, "liquid", "water", 2, 0, 3))
G.inventory["liquid"].items.append(G.Resource("Salt Water", 0, "liquid", "sea-water"))
G.inventory["liquid"].items.append(G.Liquid("Dirty Water", 0, "liquid", "mud-water", 1, -1, 2))
G.inventory["liquid"].items.append(G.Liquid("Disgusting Water", 0, "liquid", "bad-water", 1, -3, 1))
G.inventory["liquid"].items.append(G.Liquid("Fruit Juice", 0, "liquid", "juice", 3, 2, 4))

#Define Primitive Resources
G.inventory["primitive"].items.append(G.Resource("Sticks", 0, "primitive", "sticks"))
G.inventory["primitive"].items.append(G.Resource("Rocks", 0, "primitive", "rocks"))
G.inventory["primitive"].items.append(G.Resource("Leaves", 0, "primitive", "leaves"))
G.inventory["primitive"].items.append(G.Resource("Logs", 0, "primitive", "logs"))
G.inventory["primitive"].items.append(G.Resource("Clay", 0, "primitive", "clay"))
G.inventory["primitive"].items.append(G.Resource("Mud", 0, "primitive", "mud"))

#Define Equipment
G.inventory["equipment"].items.append(G.Tool("Sharp Rocks", 0, 0, "equipment", "sharp-rocks"))
G.inventory["equipment"].items.append(G.Tool("Primitive Tools", 0, 0, "equipment", "primitive-tools"))

#Game Start Function
def rsm__start():
    G.unlocked.append("jobs")
    G.unlocked.append("colony")
    G.unlocked.append("ascend")
    G.hidden.append("dev-give-all")
    G.hidden.append("dev-change-health")
    G.hidden.append("dev-change-morale")
    G.colony.young = 4
    G.colony.adult = 10
    G.colony.elder = 2
    G.colony.morale = 0
    G.colony.health = 0
    G.colony.workers[1] = G.colony.adult
    G.jobs.unlocked.append(G.jobs.all["gatherer"])
    G.jobs.unlocked.append(G.jobs.all["thinker"])
    G.eotw = 200
    recalculate_wellness()


def rsm__init():
    pass


#Game End Function
def rsm__end():
    G.unlocked.remove("jobs")
    G.unlocked.remove("colony")
    G.unlocked.remove("ascend")
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
    G.jobs.unlocked = []
    for category in G.inventory:
        for resource in G.inventory[category].items:
            resource.count = 0
    for job in G.jobs.all:
        job.count = 0
    G.colony.workers[0] = 0


def rsm__version():
    release = "{C.custom[10]}basemod {C.custom[202]}ALPHA{C.n} ".format(C=C)
    version = "0.4.0"
    print(release + version)
