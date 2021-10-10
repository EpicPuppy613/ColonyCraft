from init import G, C
import pickle

#Register mod in game
G.initialize_mod(__name__)


def autosave():
    save_file = open("saves/autosave.ccsave","wb")
    name_file = open("saves/autoname.name","w")
    pickle.dump(G, save_file)
    name_file.write(G.colony_name)
    save_file.close
    name_file.close

def save_game():
    slot_a = open("saves/savea.name","r")
    slot_b = open("saves/saveb.name","r")
    slot_c = open("saves/savec.name","r")
    name_a = slot_a.readline()
    name_b = slot_b.readline()
    name_c = slot_c.readline()
    slot_a.close()
    slot_b.close()
    slot_c.close()
    print(
        "What save slot do you want to save in?\n{C.r}[0] Cancel\n{C.g}[1] Slot A - {}\n{C.y}[2] Slot B - {}\n{C.b}[3] Slot C - {}\n{C.n}"
        .format(name_a,name_b,name_c,C=C),
        end="")
    while True:
        try:
            save_slot = int(input(">"))
            if save_slot < 0 or save_slot > 3:
                print(C.r + "That's not a valid option." + C.n)
                continue
            break
        except:
            print(C.r + "That's not a valid number." + C.n)
            continue
    if save_slot == 0:
        print(C.y+"CANCELING"+C.n)
        return False
    if save_slot == 1:
        save_file = open("saves/save-a.ccsave","wb")
        name_file = open("saves/savea.name","w")
    elif save_slot == 2:
        save_file = open("saves/save-b.ccsave","wb")
        name_file = open("saves/saveb.name","w")
    elif save_slot == 3:
        save_file = open("saves/save-c.ccsave","wb")
        name_file = open("saves/savec.name","w")
    pickle.dump(G,save_file)
    name_file.write(G.colony_name)
    name_file.close()
    save_file.close()
    print(C.g+"Sucessfully Saved!"+C.n)



def load_game():
    autoslot = open("saves/autoname.name","r")
    slot_a = open("saves/savea.name","r")
    slot_b = open("saves/saveb.name","r")
    slot_c = open("saves/savec.name","r")
    autoname = autoslot.readline()
    name_a = slot_a.readline()
    name_b = slot_b.readline()
    name_c = slot_c.readline()
    autoslot.close()
    slot_a.close()
    slot_b.close()
    slot_c.close()
    print("What slot do you want to load from?\n{C.r}[0] Cancel\n{C.g}[1] Slot A - {}\n{C.y}[2] Slot B - {}\n{C.b}[3] Slot C - {}\n{C.m}[4] Autosave - {}\n{C.n}".format(name_a,name_b,name_c,autoname,C=C),end="")
    while True:
        try:
            load_slot = int(input(">"))
            if load_slot < 0 or load_slot > 4:
                print(C.r + "That's not a valid option." + C.n)
                continue
            break
        except:
            print(C.r + "That's not a valid number." + C.n)
            continue
    if load_slot == 0:
        print(C.y+"CANCELING"+C.n)
        return False
    try:
        if load_slot == 1:
            load_file = open("saves/save-a.ccsave","rb")
        elif load_slot == 2:
            load_file = open("saves/save-b.ccsave","rb")
        elif load_slot == 3:
            load_file = open("saves/save-c.ccsave","rb")
        elif load_slot == 4:
            load_file = open("saves/autosave.ccsave","rb")
    except:
        print(C.r + "That save file either doesn't exist or is corrupted." + C.n)
        return False
    g = pickle.load(load_file)
    if g.version < G.version:
        print("{C.r}ERROR! You are attempting to load this save from a older version than the current core. To recover your save without corrupting it, wait before loading your save until a safer way is implemented{C.n}".format(C=C))
        return False
    else:
        G.__dict__.update(g.__dict__)
        print("{C.g}Sucessfully Loaded Save!{C.n}".format(C=C))
        

#Register Commands
G.register_command("save", __name__, "save_game", True)
G.register_command("load", __name__, "load_game", True)


def rsm__autosave():
    autosave()
    print(C.g + "The game has been saved." + C.n)