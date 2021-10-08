from init import G, C
import sys

G.initialize_mod(__name__)


#Define Functions
def command_help(g):
    print("{C.b}Available Commands{C.n}".format(C=C))
    for command in g.unlocked:
        print("- " + command)


def get_version(g):
    print(g.name + "\n" + g.release + " " + g.version)


def exit(g):
    sys.exit()


def show_inventory(g):
    for category in g.inventory:
        category = g.inventory[category]
        print("-[" + category.name + "]-")
        if len(category.items) == 0:
            continue
        for resource in category.items:
            if resource.count == 0:
                continue
            print("(" + str(resource.count) + ") - " + resource.name)


def give_resource(g):
    if not g.enter_dev_pass():
        return False
    print("RESOURCE ID TO GIVE:\n>", end="")
    item_entry = input()
    for category in g.inventory:
        category = g.inventory[category]
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


def start_colony(g):
    print(
        "{C.m}A new colony is born. From a group of 2 people, you managed to raise your colony up to a point where you have 10 adults, 4 children, and 2 elders. You must manage your colony's happiness and health in order to be sucessful."
        .format(C=C))
    print(
        "Out of the mess, a colony name comes up.(You can change this later){C.n}\n>"
        .format(C=C),
        end="")
    colony_name = input()
    print(
        "{C.g}The colony of ".format(C=C) + colony_name +
        " is finally under your lead. Create a great nation out of it. The end of the world is coming, so you must hurry!{C.n}"
        .format(C=C))
    g.gamestate = 1
    g.rsm__("start")


def force_end(g):
    print("GAME HAS BEEN FORCEFULLY ENDED")
    g.rsm__("end")


def tick_game(g):
    print("Another year has passed...")
    g.rsm__("tick")


#Game Start Function
def rsm__start(g):
    G.unlocked.remove("begin")
    G.unlocked.append("inv")
    G.unlocked.append("inventory")
    G.unlocked.append("tick")
    G.hidden.append("dev-give")
    G.hidden.append("force-end")


#Game End Function
def rsm__end(g):
    G.unlocked.append("begin")
    G.unlocked.remove("inv")
    G.unlocked.remove("inventory")
    G.unlocked.remove("tick")
    G.hidden.remove("dev-give")
    G.hidden.remove("force-end")


#Initialize Function in Game

G.register_command("help", __name__, "command_help", True)
G.register_command("version", __name__, "get_version", True)
G.register_command("quit", __name__, "exit", True)
G.register_command("begin", __name__, "start_colony", True)
G.register_command("inv", __name__, "show_inventory")
G.register_command("inventory", __name__, "show_inventory")
G.register_command("dev-give", __name__, "give_resource")
G.register_command("force-end", __name__, "force_end")
G.register_command("tick", __name__, "tick_game")
