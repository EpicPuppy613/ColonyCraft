import sys, getpass
from random import randint

dev_file = open("devpasscode.pass", "r")
dev_passcode = bytes.fromhex(dev_file.readline()).decode("utf-8")
dev_file.close()


class Color:
    def __init__(self):
        self.black = "\u001b[30m"
        self.red = "\u001b[31m"
        self.green = "\u001b[32m"
        self.yellow = "\u001b[33m"
        self.blue = "\u001b[34m"
        self.magenta = "\u001b[35m"
        self.cyan = "\u001b[36m"
        self.white = "\u001b[37m"
        self.reset = "\u001b[0m"
        self.d = self.black
        self.r = self.red
        self.g = self.green
        self.y = self.yellow
        self.b = self.blue
        self.m = self.magenta
        self.c = self.cyan
        self.w = self.white
        self.n = self.reset
        self.custom = []
        for i in range(0, 256):
            self.custom.append("\u001b[38;5;{ID}m".format(ID=i))


C = Color()


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
    mods = []
    definitions = {}
    version = "1.2.0"
    release = "{C.custom[204]}CORE{C.n} v".format(C=C)
    name = "{C.custom[51]}Colonycraft - CORE version 1{C.n}".format(
            C=C)
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
        def __init__(self, name, count, catid, resid, saturation, enjoyment, priority):
            super().__init__(name, count, catid, resid)
            self.saturation = saturation
            self.enjoyment = enjoyment
            self.priority = priority

    class Food(Consumable):
        def __init__(self, name, count, catid, resid, saturation, enjoyment, priority):
            super().__init__(name, count, catid, resid, saturation, enjoyment, priority)

    class Liquid(Consumable):
        def __init__(self, name, count, catid, resid, saturation, enjoyment, priority):
            super().__init__(name, count, catid, resid, saturation, enjoyment, priority)

    class Unlockable:
        def __init__(self, name, desc, techid, cost, utype, reqids=[]):
            self.name = name
            self.desc = desc
            self.techid = techid
            self.cost = cost
            self.reqids = reqids
            self.type = utype
            if not self.type in ["r", "s", "t", "a"]:
                raise Exception("Invalid Unlockable Type!")

    class Technology(Unlockable):
        def __init__(self, name, desc, techid, invention, math, science, aerospace, eventname, reqids=[]):
            self.name = name
            self.desc = desc
            self.techid = techid
            self.invention = invention
            self.math = math
            self.science = science
            self.aerospace = aerospace
            if "-" in eventname:
                raise(Exception("'-' cannot be used in a event name"))
            self.eventname = eventname
            self.cost = [invention, math, science, aerospace]
            self.reqids = reqids
        def researchable(self):
            if G.ADV_DEBUG:
                print("Checking technology " + self.techid)
            if len(self.reqids) == 0:
                if G.ADV_DEBUG:
                    print(C.g+"Technology " + self.techid + " VALID (requirements = 0)"+C.n)
                return True
            status = True
            for req in self.reqids:
                obtained = False
                for tech in G.researched:
                    if tech.techid == req:
                        obtained = True
                if obtained == False:
                    if G.ADV_DEBUG:
                        print(C.r+"Technology " + self.techid + " INVALID (missing requirement)"+C.n)
                    return False
                status = True
            if status:
                if G.ADV_DEBUG:
                    print(C.g+"Technology " + self.techid + " VALID (requirements met)"+C.n)
                return True
            if G.ADV_DEBUG:
                print(C.r+"Technology " + self.techid + " INVALID (unknown reason)"+C.n)
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
            for rolls in range(count):
                roll = randint(1,total_weight)
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

    def inventory_lookup(self,item):
        for category in self.inventory:
            for entry in self.inventory[category].items:
                if entry.resid == item:
                    return entry
        raise Exception("Item id does not exist")


    def register_command(self, command, mod, function, unlocked=False, hidden=False):
        self.commands.append(command)
        if unlocked:
            self.unlocked.append(command)
        if hidden:
            self.hidden.append(command)
        self.definitions[command] = Command(function, mod)

    def gen_bar(self,
                value,
                maximum,
                length,
                left="",
                segment="█",
                empty="░",
                right=""):
        progress = value / maximum
        amount = round(progress * length)
        output = left
        for i in range(amount):
            output += segment
        for i in range(length - amount):
            output += empty
        output += right
        return output

    def get_gamestate(self):
        return "[gamestate]"

    def get_command(self):
        command = input(">")
        if not command in self.unlocked and not command in self.hidden:
            print("{C.y}Unreconized command, try 'help' for help{C.n}".format(C=C))
        else:
            self.run_command(command)

    def run_command(self, command):
        runcommand = self.definitions[command]
        runcommand.run()

    def printr(self, stuff):
        print(stuff, end="\r")

    def initialize_mod(self, mod):
        self.mods.append(mod)

    def enter_dev_pass(self):
        print("DEV PASSCODE REQUIRED\n>", end="")
        passcode_entry = getpass.getpass("")
        if passcode_entry == dev_passcode:
            print("{C.g}ACCESS GRANTED{C.n}".format(C=C))
            return True
        else:
            print("{C.r}INCORRECT PASSCODE{C.n}".format(C=C))
            return False

    #Events
    DEBUG = True
    ADV_DEBUG = False
    def rsm__(self, event):
        for mod in self.mods:
            try:
                if self.ADV_DEBUG:
                    print("DEBUG: Calling event 'rsm__" + event + "' in module '" + mod + "'")
                getattr(sys.modules[mod], "rsm__" + event)()
            except AttributeError:
                if self.ADV_DEBUG:
                    print(C.r+"DEBUG: Event 'rsm__" + event + "' doesn't exist in module '" + mod + "'"+C.n)
                pass
            except BaseException as err:
                if self.DEBUG:
                    raise Exception() from err
        if event != "init" and event != "version":
            for entry in self.event_blacklist:
                if entry in event:
                    return False
            sys.modules["saving"].rsm__autosave()

G = Game()
