#Import Game instance
from init import G, C
from random import randint

G.initialize_mod(__name__)

#Tick Commands
def gatherer_update():
    for category in G.inventory:
        for entry in G.inventory[category].items:
            if isinstance(entry,G.Tool):
                entry.used = 0
    G.inventory_lookup("fire").used += G.jobs.all["firemaker"].count
    gatherer_output = G.loot_tables["gatherer"].roll(round(G.jobs.all["gatherer"].count*4*G.colony.modifier_work))
    for thing in gatherer_output:
        G.inventory_lookup(thing).count += gatherer_output[thing]
    gatherer_output = G.loot_tables["woodcutter"].roll(round(G.jobs.all["woodcutter"].count*6*G.colony.modifier_work))
    for thing in gatherer_output:
        G.inventory_lookup(thing).count += gatherer_output[thing]
    gatherer_output = G.loot_tables["digger"].roll(round(G.jobs.all["digger"].count*5*G.colony.modifier_work))
    for thing in gatherer_output:
        G.inventory_lookup(thing).count += gatherer_output[thing]
    gatherer_output = G.loot_tables["fisher"].roll(round(G.jobs.all["fisher"].count*3*G.colony.modifier_work))
    for thing in gatherer_output:
        G.inventory_lookup(thing).count += gatherer_output[thing]
    firemaker_output = round(G.jobs.all["firemaker"].count*2*G.colony.modifier_work)
    for fire in range(firemaker_output):
        if G.inventory_lookup("sticks").count >= 10:
            G.inventory_lookup("sticks").count -= 10
            G.inventory_lookup("fire").count += 1
        else:
            break
    smoker_output = round(G.jobs.all["smoker"].count*10*G.colony.modifier_work)
    if G.inventory_lookup("fire").used > G.inventory_lookup("fire").count:
        smoker_output -= 10 * (G.inventory_lookup("fire").used - G.inventory_lookup("fire").count)
    if smoker_output > 0:
        seafood_cooked = smoker_output
        if seafood_cooked > G.inventory_lookup("raw-fish").count:
            seafood_cooked = G.inventory_lookup("raw-fish").count
        G.inventory_lookup("raw-fish").count -= seafood_cooked
        G.inventory_lookup("cooked-fish").count += seafood_cooked
    

def show_research():
    print(C.custom[45]+G.research.current.name+" Research Progress:")
    if G.research.needed.invention > 0:
        print(C.custom[27]+"Invention: {}/{} {}".format(G.research.progress.invention,G.research.needed.invention,G.gen_bar(G.research.progress.invention,G.research.needed.invention,20))+C.n)
    if G.research.needed.science > 0:
        print(C.custom[83]+"Science: {}/{} {}".format(G.research.progress.science,G.research.needed.science,G.gen_bar(G.research.progress.science,G.research.needed.science,20))+C.n)
    if G.research.needed.math > 0:
        print(C.custom[208]+"Math: {}/{} {}".format(G.research.progress.math,G.research.needed.math,G.gen_bar(G.research.progress.math,G.research.needed.math,20))+C.n)
    if G.research.needed.aerospace > 0:
        print(C.custom[159]+"Aerospace: {}/{} {}".format(G.research.progress.aerospace,G.research.needed.aerospace,G.gen_bar(G.research.progress.aerospace,G.research.needed.aerospace,20))+C.n)


def research_update():
    research_invention = round(((G.jobs.all["thinker"].count*5)+(G.jobs.all["inventor"].count*15))*G.colony.modifier_work)
    research_math = round(((G.jobs.all["mathematician"].count*10))*G.colony.modifier_work)
    research_science = round(((G.jobs.all["scientist"].count*10))*G.colony.modifier_work)
    research_air = round(((G.jobs.all["aviator"].count*10))*G.colony.modifier_work)
    G.research.progress.invention += research_invention
    G.research.progress.science += research_science
    G.research.progress.math += research_math
    G.research.progress.aerospace += research_air
    if G.research.progress.invention > G.research.needed.invention:
        G.research.progress.invention = G.research.needed.invention
    if G.research.progress.math > G.research.needed.math:
        G.research.progress.math = G.research.needed.math
    if G.research.progress.science > G.research.needed.science:
        G.research.progress.science = G.research.needed.science
    if G.research.progress.aerospace > G.research.needed.aerospace:
        G.research.progress.aerospace = G.research.needed.aerospace
    if G.research.current == None:
        return False
    if G.research.progress.invention >= G.research.needed.invention and \
       G.research.progress.science >= G.research.needed.science and \
       G.research.progress.math >= G.research.needed.math and \
       G.research.progress.aerospace >= G.research.needed.aerospace:
        G.research.needed.invention = 0
        G.research.needed.science = 0
        G.research.needed.math = 0
        G.research.needed.aerospace = 0
        G.researched.append(G.research.current)
        print(C.custom[46]+G.research.current.name+" has finished researching!")
        G.rsm__("res__"+G.research.current.eventname)
        G.research.current = None
        return True
    show_research()


def population_update():
    heacalc = G.colony.health / 1000
    randdeath = (randint(10, 20) / 100) * 2**(-heacalc)
    randage = randint(4, 15) / 100
    randgrow = randint(25, 40) / 100
    randborn = randint(15, 30) / 100
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


def research_management():
    print(C.custom[118]+"What do you want to do?\n{C.r}[0] Cancel\n{C.custom[196]}[1] Stop Research\n{C.custom[80]}[2] Pick New Research\n{C.custom[86]}[3] Review Research Progress\n{C.custom[123]}[4] Review Researched Technologies".format(C=C)+C.n)
    while True:
        try:
            choice = int(input(">"))
            if choice < 0 or choice > 4:
                print(C.r+"That's not a valid choice."+C.n)
                continue
            break
        except:
            print(C.r+"That's not a valid number."+C.n)
            continue
    if choice == 3:
        if G.research.current == None:
            print(C.r+"You don't have an active research"+C.n)
            return False
        else:
            show_research()
            return True
    elif choice == 4:
        print(C.c+"Researched Technologies:"+C.n)
        for technology in G.researched:
            print(technology.name + " - '" + technology.desc + "'")
        return True
    elif choice == 0:
        print(C.r+"Cancelled"+C.c)
        return False
    elif choice == 1:
        print(C.m+"Are you sure you want to cancel your research? (You will lose all research progress) [Y/N]"+C.n)
        confirmation = input(">")
        if confirmation.lower() == "y":
            G.research.needed.invention = 0
            G.research.needed.math = 0
            G.research.needed.science = 0
            G.research.needed.aerospace = 0
            G.research.progress.invention = 0
            G.research.progress.math = 0
            G.research.progress.science = 0
            G.research.progress.aerospace = 0
            G.research.current = None
            print(C.r+"The current research has been cleared."+C.c)
            return False
        else:
            print(C.custom[154] + "Returning to your colony..." + C.n)
            return False
    if G.research.current != None:
        print(C.c+"You already have an active research. Make sure to cancel it first."+C.n)
        return False
    position = 0
    options = []
    for technology in G.researches:
        if technology in G.researched:
            continue
        if technology.researchable():
            print("[{}] {} - {} Invention, {} Math, {} Science, {} Aerospace".format(position,technology.name,technology.invention,technology.math,technology.science,technology.aerospace))
            options.append(technology)
            position += 1
    if len(options) == 0:
        print(C.r+"There are no currently available researches."+C.n)
        return False
    while True:
        try:
            choice = int(input(">"))
            if choice < 0 or choice >= len(options):
                print(C.r+"That's not a valid choice."+C.n)
                continue
            break
        except:
            print(C.r+"That's not a valid number."+C.n)
            continue
    new_research = options[choice]
    G.research.current = new_research
    G.research.needed.invention = new_research.invention
    G.research.needed.math = new_research.math
    G.research.needed.science = new_research.science
    G.research.needed.aerospace = new_research.aerospace
    G.research.progress.invention = 0
    G.research.progress.math = 0
    G.research.progress.science = 0
    G.research.progress.aerospace = 0
    print(C.g+"Set new research."+C.n)
    return True


def manual_ascend():
    print(C.m+"ARE YOU REALLY SURE YOU WANT TO ASCEND? (Y/N)"+C.c)
    confirmation = input(">")
    if confirmation.lower() == "y":
        force_ascend()
    else:
        print(C.custom[154] + "Returning to your colony..." + C.n)


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
    food_saturation = ((G.colony.young*0.5)+G.colony.adult+G.colony.elder)*G.colony.rations[0]
    water_saturation = ((G.colony.young*0.5)+G.colony.adult+G.colony.elder)*G.colony.rations[0]
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
    position = 0
    options = []
    for job in G.jobs.all:
        if G.jobs.all[job] in G.jobs.unlocked:
            print("[{}] {} - {} Current Workers".format(position+1,G.jobs.all[job].name,G.jobs.all[job].count))
            position += 1
            options.append(G.jobs.all[job])
    while True:
        try:
            choice = int(input(">"))
            if choice != 0:
                selection = options[choice-1]
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
    gatherer_update()
    colony_consume()
    for category in G.inventory:
        for resource in G.inventory[category].items:
            resource.count = round(resource.count * G.storage_efficiency)
    print(C.custom[9] + str(round((1 - G.storage_efficiency) * 100)) +
          "% of all your resources have decayed." + C.n)
    recalculate_wellness()
    population_update()
    research_update()
    G.eotw -= 1
    if G.eotw <= 1:
        print("{C.custom[196]}THE END OF THE WORLD HAS COME{C.n}".format(C=C))
        print(C.r + "You are forced to ascend to avoid the terrors of the end." + C.n)
        force_ascend()
    elif G.eotw <= 5:
        print("{C.custom[203]}The earth rumbles... The end of the world is coming...{C.n}".format(C=C))


#Define research events
def rsm__res__math():
    print(C.b+"Unlocked the Mathematician!"+C.n)
    G.jobs.unlocked.append(G.jobs.all["mathematician"])

def rsm__res__adv_invention():
    print(C.b+"Unlocked the Inventor!"+C.n)
    G.jobs.unlocked.append(G.jobs.all["inventor"])

def rsm__res__science():
    print(C.b+"Unlocked the Scientist!"+C.n)
    G.jobs.unlocked.append(G.jobs.all["scientist"])

def rsm__res__aviation():
    print(C.b+"Unlocked the Aviation Engineer!"+C.n)
    G.jobs.unlocked.append(G.jobs.all["aviator"])

def rsm__res__crafting():
    print(C.b+"Unlocked the Crafter!"+C.n)
    print(C.r+"Crafting is a WIP, scheduled release: Alpha 1.1"+C.n)
    G.jobs.unlocked.append(G.jobs.all["crafter"])

def rsm__res__storing():
    print(C.b+"Storage efficiency + 2%"+C.n)
    G.storage_efficiency += 0.02

def rsm__res__seI():
    print(C.b+"Storage efficiency + 2%"+C.n)
    G.storage_efficiency += 0.02

def rsm__res__seII():
    print(C.b+"Storage efficiency + 2%"+C.n)
    G.storage_efficiency += 0.02

def rsm__res__seIII():
    print(C.b+"Storage efficiency + 1%"+C.n)
    G.storage_efficiency += 0.01

def rsm__res__seIV():
    print(C.b+"Storage efficiency + 1%"+C.n)
    G.storage_efficiency += 0.01

def rsm__res__seV():
    print(C.b+"Storage efficiency + 1%"+C.n)
    G.storage_efficiency += 0.01

def rsm__res__duplicate():
    print(C.b+"Storage duplication + 2%"+C.n)
    G.storage_efficiency = 1.02

def rsm__res__deI():
    print(C.b+"Storage duplication + 3%"+C.n)
    G.storage_efficiency += 0.03

def rsm__res__fishing():
    print(C.b+"Unlocked the Fisher!"+C.n)
    G.jobs.unlocked.append(G.jobs.all["fisher"])

def rsm__res__woodcutter():
    print(C.b+"Unlocked the Woodcutter!"+C.n)
    G.jobs.unlocked.append(G.jobs.all["wodcutter"])

def rsm__res__digger():
    print(C.b+"Unlocked the Digger!"+C.n)
    G.jobs.unlocked.append(G.jobs.all["digger"])

def rsm__res__firemaking():
    print(C.b+"Unlocked the Firemaker!"+C.n)
    G.jobs.unlocked.append(G.jobs.all["firemaker"])

def rsm__res__cooking():
    print(C.b+"Unlocked the Smoker!"+C.n)
    G.jobs.unlocked.append(G.jobs.all["smoker"])


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
    

def change_colony_name():
    print(C.m+"After much discussion, you decide to change your colony name to "+C.n)
    name = input(">")
    G.colony_name = name


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

#Game Init
def rsm__init():
    G.storage_efficiency = 0.9
    G.loot_tables = {}
    G.event_blacklist.append("res")

    #Stats Init
    stats = G.Empty()
    stats.level = 1
    stats.xp = 0
    stats.skillpts = 0
    stats.talentpts = 0
    stats.lvlup = 100
    G.stats = stats

    #Research Init
    research = G.Empty()
    research.current = None
    research.needed = G.Empty()
    research.needed.invention = 0
    research.needed.science = 0
    research.needed.math = 0
    research.needed.aerospace = 0
    research.progress = G.Empty()
    research.progress.invention = 0
    research.progress.science = 0
    research.progress.math = 0
    research.progress.aerospace = 0
    G.research = research

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

    #Initialize all commands
    G.register_command("stats", __name__, "get_stats", True)
    G.register_command("rename", __name__, "change_colony_name")
    G.register_command("research", __name__, "research_management")
    G.register_command("jobs", __name__, "job_management")
    G.register_command("colony", __name__, "check_colony")
    G.register_command("dev-give-all", __name__, "give_all_resources")
    G.register_command("dev-change-health", __name__ ,"dev_change_health")
    G.register_command("dev-change-morale", __name__, "dev_change_morale")
    G.register_command("ascend", __name__, "manual_ascend")

    #Create Loot Tables
    G.loot_tables["gatherer"] = G.LootTable("gatherer",[])
    G.loot_tables["woodcutter"] = G.LootTable("woodcutter",[])
    G.loot_tables["digger"] = G.LootTable("digger",[])
    G.loot_tables["fisher"] = G.LootTable("fisher",[])

    #Gatherer Loot Table
    G.loot_tables["gatherer"].content.append(G.LootEntry("fruit",4,2))
    G.loot_tables["gatherer"].content.append(G.LootEntry("wild-greens",3,1))
    G.loot_tables["gatherer"].content.append(G.LootEntry("water",3,2))
    G.loot_tables["gatherer"].content.append(G.LootEntry("mud-water",5,1))
    G.loot_tables["gatherer"].content.append(G.LootEntry("bad-water",2,1))
    G.loot_tables["gatherer"].content.append(G.LootEntry("sticks",3,1))
    G.loot_tables["gatherer"].content.append(G.LootEntry("rocks",3,1))
    G.loot_tables["gatherer"].content.append(G.LootEntry("leaves",3,1))

    #Woodcutter Loot Table
    G.loot_tables["woodcutter"].content.append(G.LootEntry("logs",5,1))
    G.loot_tables["woodcutter"].content.append(G.LootEntry("sticks",1,1))
    G.loot_tables["woodcutter"].content.append(G.LootEntry("leaves",1,1))

    #Digger Loot Table
    G.loot_tables["digger"].content.append(G.LootEntry("clay",3,1))
    G.loot_tables["digger"].content.append(G.LootEntry("mud",3,1))
    G.loot_tables["digger"].content.append(G.LootEntry("rocks",2,1))

    #Fisher Loot Tables
    G.loot_tables["fisher"].content.append(G.LootEntry("raw-fish",10,1))
    G.loot_tables["fisher"].content.append(G.LootEntry("wild-greens",1,1))
    G.loot_tables["fisher"].content.append(G.LootEntry("junk",1,1))

    #Initialize jobs
    G.jobs.all["gatherer"] = G.Job(C.custom[46]+"Gatherer"+C.n,"gatherer",0)
    G.jobs.all["woodcutter"] = G.Job(C.custom[46]+"Woodcutter"+C.n,"woodcutter",0)
    G.jobs.all["digger"] = G.Job(C.custom[46]+"Digger"+C.n,"digger",0)
    G.jobs.all["fisher"] = G.Job(C.custom[46]+"Fisher"+C.n,"fisher",0)
    G.jobs.all["thinker"] = G.Job(C.custom[87]+"Thinker"+C.n,"thinker",0)
    G.jobs.all["inventor"] = G.Job(C.custom[87]+"Inventor"+C.n,"inventor",0)
    G.jobs.all["scientist"] = G.Job(C.custom[87]+"Scientist"+C.n,"scientist",0)
    G.jobs.all["mathematician"] = G.Job(C.custom[87]+"Mathematician"+C.n,"mathematician",0)
    G.jobs.all["aviator"] = G.Job(C.custom[87]+"Aviation Engineer"+C.n,"aviator",0)
    G.jobs.all["crafter"] = G.Job(C.custom[226]+"Crafter"+C.n,"crafter",0)
    G.jobs.all["toolmaker"] = G.Job(C.custom[226]+"Toolmaker"+C.n,"toolmaker",0)
    G.jobs.all["carpenter"] = G.Job(C.custom[226]+"Carpenter"+C.n,"carpenter",0)
    G.jobs.all["blacksmith"] = G.Job(C.custom[226]+"Blacksmith"+C.n,"blacksmith",0)
    G.jobs.all["firemaker"] = G.Job(C.custom[196]+"Firemaker"+C.n,"firemaker",0)
    G.jobs.all["smoker"] = G.Job(C.custom[196]+"Smoker"+C.n,"smoker",0)

    #Create Resource CateGories
    G.inventory["food"] = G.Category(C.custom[40]+"Food"+C.n, [], "food")
    G.inventory["liquid"] = G.Category(C.custom[49]+"Liquids"+C.n, [], "liquid")
    G.inventory["primitive"] = G.Category(C.custom[130]+"Primitive Resources"+C.n, [], "primitive")
    G.inventory["equipment"] = G.Category(C.custom[249]+"Equipment"+C.n, [], "equipment")
    G.inventory["other"] = G.Category("Other", [], "other")

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
    G.inventory["liquid"].items.append(G.Liquid("Poisonous Water", 0, "liquid", "bad-water", 1, -3, 1))
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
    G.inventory["equipment"].items.append(G.Tool(C.custom[196]+"Campfire"+C.n, 0, 0, "equipment", "fire"))

    #Define Other
    G.inventory["other"].items.append(G.Resource("Junk",0,"other","junk"))

    ##Define Researches
    #Define Research Advancement
    G.researches.append(G.Technology("Theory of Mathematics","Arithmetic and more","ToM",50,0,0,0,"math"))
    G.researches.append(G.Technology("Advanced Invention","The magic of inventors","adv-invention",150,75,0,0,"adv_invention",["ToM"]))
    G.researches.append(G.Technology("Theory of Science","Why???","ToS",350,100,0,0,"science",["adv-invention"]))
    G.researches.append(G.Technology("Theory of Aviation","CAN HUMANS FLY?!?!?","ToA",650,500,250,0,"aviation",["ToS"]))
    G.researches.append(G.Technology("Theory of Outer Space","Beyond the visible sky","ToOS",1250,1000,750,750,"outer_space",["ToA"]))

    #Processing Advancement
    G.researches.append(G.Technology("Production","Raw stuff + effort = new stuff","production",20,0,0,0,"production"))
    G.researches.append(G.Technology("Crafting","Producing stuff out of other stuff","crafting",35,0,0,0,"crafting",["production"]))
    G.researches.append(G.Technology("Rock Striking","rock + rock = sharp rock","striking",50,0,0,0,"striking",["crafting"]))
    G.researches.append(G.Technology("Tool Making","Need the right tools for the job?","tools",100,0,0,0,"tools",["striking"]))
    G.researches.append(G.Technology("Mass Crafting","Producing multiple things at once","mass-crafting",100,25,0,0,"mass_crafting",["ToM","crafting"]))

    #Survival Advancement
    G.researches.append(G.Technology("Survivalibility","Preveting your colony from going extinct","survival",25,0,0,0,"survival"))
    G.researches.append(G.Technology("Fishing","Catching fish out of the water","fishing",50,0,0,0,"fishing",["survival"]))
    G.researches.append(G.Technology("Woodcutting","TIMBER","woodcutting",50,0,0,0,"woodcutting",["survival"]))
    G.researches.append(G.Technology("Digging","Out of the ground","digging",75,0,0,0,"digging",["survival"]))
    G.researches.append(G.Technology("Firemaking","Don't burn yourself","firemaking",75,0,0,0,"firemaking",["survival"]))
    G.researches.append(G.Technology("Cooking","Don't burn the food","cooking",150,0,0,0,"cooking",["firemaking","fishing"]))

    #Colony Efficiency

    #Storage Advancement
    G.researches.append(G.Technology("Stockpiling","Putting all of your food in one central place","storing",50,0,0,0,"storing"))
    G.researches.append(G.Technology("Storage Efficiency I","Using a bit of math to store more efficiently", "seI",125,50,0,0,"seI",["ToM","storing"]))
    G.researches.append(G.Technology("Storage Efficiency II","More math = more storage", "seII", 250, 150, 0, 0, "seII", ["seI"]))
    G.researches.append(G.Technology("Storage Efficiency III","NEED MOAR STORAGE","seIII",500,300,0,0,"seIII",["seII"]))
    G.researches.append(G.Technology("Storage Efficiency IV","MOAAAAAAAAAR","seIV",1000,600,0,0,"seIV",["seIII"]))
    G.researches.append(G.Technology("Storage Efficiency V","MAXIMUM STORAGE","seV",2000,1250,0,0,"seV",["seIV"]))
    G.researches.append(G.Technology("Material Duplication","bending space and time to duplicate items in storage","duplicate",5000,2500,2500,2500,"duplicate",["seV","ToOS"]))
    G.researches.append(G.Technology("Duplication Efficiency I","improved duplication systems allows more duplication every year","deI",10000,5000,5000,5000,"deI",["duplicate"]))

    #Building Advancement

#Game Start Function
def rsm__start():
    G.unlocked.append("rename")
    G.unlocked.append("jobs")
    G.unlocked.append("colony")
    G.unlocked.append("ascend")
    G.unlocked.append("research")
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
    G.eotw = 100
    recalculate_wellness()


#Game End Function
def rsm__end():
    G.unlocked.remove("rename")
    G.unlocked.remove("jobs")
    G.unlocked.remove("colony")
    G.unlocked.remove("ascend")
    G.unlocked.remove("research")
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
    version = "1.0.0"
    print(release + version)
