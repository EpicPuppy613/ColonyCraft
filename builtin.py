from init import G, C
import sys

G.initialize_mod(__name__)
G.colony_name = "NO COLONY"

#Define Functions
def command_help():
    print("{C.b}Available Commands{C.n}".format(C=C))
    for command in G.unlocked:
        print("- " + command)


def get_version():
    print(G.name + "\n" + G.release + " " + G.version)
    G.rsm__("version")


def exit():
    sys.exit()


def show_inventory():
    for category in G.inventory:
        category = G.inventory[category]
        print("-[" + category.name + "]-")
        if len(category.items) == 0:
            continue
        for resource in category.items:
            if resource.count == 0:
                continue
            print("(" + str(resource.count) + ") - " + resource.name)


def give_resource():
    if not G.enter_dev_pass():
        return False
    print("RESOURCE ID TO GIVE:\n>", end="")
    item_entry = input()
    for category in G.inventory:
        category = G.inventory[category]
        for item in range(len(category.items)):
            if category.items[item].resid == item_entry:
                print("AMOUNT TO GIVE:\n>", end="")
                try:
                    item_count = int(input())
                except:
                    print("{C.r}NOT A NUMBER{C.n}".format(C=C))
                    return False
                category.items[item].count += item_count
                print("{C.g}RESOURCES RECIEVED{C.n}".format(C=C))
                return True
    print("{C.r}INVALID RESOURCE ID{C.n}".format(C=C))
    return False


def start_colony():
    print(
        "{C.custom[200]}A new colony is born. From a group of 2 people, you managed to raise your colony up to a point where you have 10 adults, 4 children, and 2 elders. You must manage your colony's morale and health in order to be sucessful."
        .format(C=C))
    print(
        "Out of the mess, a colony name comes up.(You can change this later){C.n}\n>"
        .format(C=C),
        end="")
    colony_name = input()
    print(
        "{C.custom[154]}The colony of ".format(C=C) + colony_name +
        " is finally under your lead. Create a great nation out of it. The end of the world is coming, so you must hurry!{C.n}"
        .format(C=C))
    G.colony_name = colony_name
    G.Gamestate = 1
    G.rsm__("start")


def force_end():
    print("GAME HAS BEEN FORCEFULLY ENDED")
    G.rsm__("end")


def tick_game():
    print("Another year has passed...")
    G.rsm__("tick")


#Game Start Function
def rsm__start():
    G.unlocked.remove("begin")
    G.unlocked.append("inv")
    G.unlocked.append("inventory")
    G.unlocked.append("tick")
    G.hidden.append("dev-give")
    G.hidden.append("force-end")


#Game End Function
def rsm__end():
    G.unlocked.append("begin")
    G.unlocked.remove("inv")
    G.unlocked.remove("inventory")
    G.unlocked.remove("tick")
    G.hidden.remove("dev-give")
    G.hidden.remove("force-end")
    G.colony_name = "NO COLONY"


def rsm__version():
    print("{C.b}builtin {C.custom[99]}v0.3.1{C.n}".format(C=C))

#Initialize Function in Game

G.register_command("help", __name__, "command_help", True)
G.register_command("version", __name__, "get_version", True)
G.register_command("quit", __name__, "exit", True)
G.register_command("begin", __name__, "start_colony", True)
G.register_command("inv", __name__, "show_inventory")
G.register_command("inventory", __name__, "show_inventory")
G.register_command("dev-Give", __name__, "give_resource")
G.register_command("force-end", __name__, "force_end")
G.register_command("tick", __name__, "tick_game")
