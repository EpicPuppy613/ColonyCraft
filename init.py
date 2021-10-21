import sys, getpass
from random import randint

with open("devpasscode.pass", "r", encoding="utf-8") as dev_file:
    dev_passcode = bytes.fromhex(dev_file.readline()).decode("utf-8")
dev_file.close()


def gen_bar(value,
            maximum,
            length=20,
            left="",
            segment="█",
            empty="░",
            right=""):
    progress = value / maximum
    amount = round(progress * length)
    output = left
    for _ in range(amount):
        output += segment
    for _ in range(length - amount):
        output += empty
    output += right
    return output


class Color:
    def __init__(self):
        self.d = "\u001b[30m"
        self.r = "\u001b[31m"
        self.g = "\u001b[32m"
        self.y = "\u001b[33m"
        self.b = "\u001b[34m"
        self.m = "\u001b[35m"
        self.c = "\u001b[36m"
        self.w = "\u001b[37m"
        self.n = "\u001b[0m"
        self.custom = []
        for i in range(0, 256):
            self.custom.append("\u001b[38;5;{ID}m".format(ID=i))


C = Color()


def enter_dev_pass():
    print("DEV PASSCODE REQUIRED\n>", end="")
    passcode_entry = getpass.getpass("")
    if passcode_entry == dev_passcode:
        print("{C.g}ACCESS GRANTED{C.n}".format(C=C))
        return True
    print("{C.r}INCORRECT PASSCODE{C.n}".format(C=C))
    return False


class Command:
    def __init__(self, command, mod):
        self.command = command
        self.mod = mod

    def run(self):
        getattr(sys.modules[self.mod], self.command)()


class Game:
    def __init__(self):
        self.commands = []
        self.unlocked = []
        self.hidden = []
        self.inventory = {}
        self.known = []
        self.skills = []
        self.learned = []
        self.talents = []
        self.researched = []
        self.researches = []
        self.evolved = []
        self.traits = []
        """
        Gamestates
        0: Menu
        1: During run
        """
        self.gamestate = 0

    event_blacklist = []
    consumable_types = ["food", "liquid"]
    mods = []
    definitions = {}
    version = "1.2.0"
    release = "{C.custom[204]}CORE{C.n} v".format(C=C)
    name = "{C.custom[51]}Colonycraft - CORE version 1{C.n}".format(C=C)
    short = "{C.custom[51]}CC - v1{C.n}".format(C=C)

    class Category:
        def __init__(self, name, items, catid):
            self.name = name
            self.items = items
            self.catid = catid

    class Resource:
        def __init__(self, name, count, catid, resid):
            self.name = name
            self.count = count
            self.catid = catid
            self.resid = resid

    class Tool(Resource):
        def __init__(self, name, count, used, catid, resid):
            super().__init__(name, count, catid, resid)
            self.used = used

    class Consumable(Resource):
        def __init__(self, name, count, catid, resid, saturation, enjoyment,
                     priority, itemtype):
            super().__init__(name, count, catid, resid)
            self.saturation = saturation
            self.enjoyment = enjoyment
            self.priority = priority
            self.itemtype = itemtype
            if not itemtype in G.consumable_types:
                raise Exception("Consumable type does not exist")

    class Unlockable:
        def __init__(self, name, desc, techid, cost, utype, reqids=None):
            self.name = name
            self.desc = desc
            self.techid = techid
            self.cost = cost
            self.reqids = reqids
            self.type = utype
            if not self.type in ["r", "s", "t", "a"]:
                raise Exception("Invalid Unlockable Type!")

    class Technology(Unlockable):
        def __init__(self,
                     name,
                     desc,
                     techid,
                     invention,
                     math,
                     science,
                     aerospace,
                     eventname,
                     reqids=None):
            super().__init__(name, desc, techid, None, "r", reqids)
            self.name = name
            self.desc = desc
            self.techid = techid
            self.invention = invention
            self.math = math
            self.science = science
            self.aerospace = aerospace
            if "-" in eventname:
                raise (Exception("'-' cannot be used in a event name"))
            self.eventname = eventname
            self.cost = [invention, math, science, aerospace]
            self.reqids = reqids

        def researchable(self):
            if G.DEBUG:
                print("Checking technology " + self.techid)
            if self.reqids == None:
                if G.DEBUG:
                    print(C.g + "Technology " + self.techid +
                          " VALID (requirements = 0)" + C.n)
                return True
            status = True
            for req in self.reqids:
                obtained = False
                for tech in G.researched:
                    if tech.techid == req:
                        obtained = True
                if obtained == False:
                    if G.DEBUG:
                        print(C.r + "Technology " + self.techid +
                              " INVALID (missing requirement)" + C.n)
                    return False
                status = True
            if status:
                if G.DEBUG:
                    print(C.g + "Technology " + self.techid +
                          " VALID (requirements met)" + C.n)
                return True
            if G.DEBUG:
                print(C.r + "Technology " + self.techid +
                      " INVALID (unknown reason)" + C.n)
            return False

    class Job:
        def __init__(self, name, jobid, count):
            self.name = name
            self.jobid = jobid
            self.count = count

    class LootTable:
        def __init__(self, lootid, content):
            self.lootid = lootid
            self.content = content

        def roll(self, count):
            total_weight = 0
            table = []
            things = []
            results = []
            output = {}
            for thing in self.content:
                total_weight += thing.weight
                table.append(total_weight)
                things.append(thing)
            for _ in range(count):
                roll = randint(1, total_weight)
                for weight in range(len(table)):
                    if roll <= table[weight]:
                        results.append(things[weight])
                        break
            for result in results:
                if result.entry in output:
                    output[result.entry] += result.count
                else:
                    output[result.entry] = result.count
            return output

    class LootEntry:
        def __init__(self, entry, weight, count):
            self.entry = entry
            self.weight = weight
            self.count = count

    class Empty:
        pass

    def inventory_lookup(self, item):
        for category in self.inventory:
            for entry in self.inventory[category].items:
                if entry.resid == item:
                    return entry
        raise Exception("Item id does not exist")

    def register_command(self,
                         command,
                         mod,
                         function,
                         unlocked=False,
                         hidden=False):
        self.commands.append(command)
        if unlocked:
            self.unlocked.append(command)
        if hidden:
            self.hidden.append(command)
        self.definitions[command] = Command(function, mod)

    def get_gamestate(self):
        return self.gamestate

    def get_command(self):
        command = input(">")
        if not command in self.unlocked and not command in self.hidden:
            print("{C.y}Unreconized command, try 'help' for help{C.n}".format(
                C=C))
        else:
            self.run_command(command)

    def run_command(self, command):
        runcommand = self.definitions[command]
        runcommand.run()

    def initialize_mod(self, mod):
        self.mods.append(mod)

    #Events
    DEBUG = True
    ADV_DEBUG = False

    def rsm__(self, event):
        for mod in self.mods:
            try:
                getattr(sys.modules[mod], "rsm__" + event)()
            except AttributeError as err:
                if G.ADV_DEBUG:
                    print(C.r+"AttributeError '{}' at '{}'".format(event,mod) + C.n)
                    if mod == "mods.basemod":
                        raise Exception() from err
                pass
            except BaseException as err:
                if self.DEBUG:
                    raise Exception() from err
        if not event in ["version","init"]:
            for entry in self.event_blacklist:
                if entry in event:
                    return False
            sys.modules["saving"].rsm__autosave()
        return True


G = Game()
