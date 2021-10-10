from init import G, C
import pickle

#Register mod in game
G.initialize_mod(__name__)


def save_game():
    print(
        "What save slot do you want to save in?\n{C.r}[0] Cancel\n{C.g}[1] Slot A\n{C.y}[2] Slot B\n{C.b}[3] Slot C\n{C.n}>"
        .format(C=C),
        end="")
    while True:
        try:
            save_slot = int(input())
            if save_slot < 0 or save_slot > 3:
                print(C.r + "That's not a valid option." + C.n)
                continue
            break
        except:
            print(C.r + "That's not a valid number." + C.n)
            continue
    
    if save_slot == 1:
        save_file = open("saves/save-a.ccsave","wb")
    elif save_slot == 2:
        save_file = open("saves/save-b.ccsave","wb")
    elif save_slot == 3:
        save_file = open("saves/save-c.ccsave","wb")
    pickle.dump(G,save_file)
    save_file.close()
    print(C.g+"Sucessfully Saved!"+C.n)



def load_game():
    print("What slot do you want to load from?\n{C.r}[0] Cancel\n{C.g}[1] Slot A\n{C.y}[2] Slot B\n{C.b}[3] Slot C\n{C.n}>".format(C=C))
    while True:
        try:
            load_slot = int(input())
            if load_slot < 0 or load_slot > 3:
                print(C.r + "That's not a valid option." + C.n)
                continue
            break
        except:
            print(C.r + "That's not a valid number." + C.n)
            continue
    try:
        if load_slot == 1:
            load_file = open("saves/save-a.ccsave","rb")
        elif load_slot == 2:
            load_file = open("saves/save-b.ccsave","rb")
        elif load_slot == 3:
            load_file = open("saves/save-c.ccsave","rb")
    except:
        print("That save file either doesn't exist or is corrupted.")
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