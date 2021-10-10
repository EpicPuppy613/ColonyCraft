import sys, getpass

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
        self.unlockables = []
        self.unlocked = []
        """
        Gamestates
        0: Menu
        1: During run
        """
        self.gamestate = 0
    mods = []
    definitions = {}
    version = "1.0.0"
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

    class Food(Resource):
        def __init__(self, name, count, catid, resid, saturation, enjoyment,
                     priority):
            super().__init__(name, count, catid, resid)
            self.saturation = saturation
            self.enjoyment = enjoyment
            self.priority = priority

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

    class Empty:
        pass

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

    def gen_bar(self,
                value,
                maximum,
                length,
                left="[",
                segment="█",
                empty="░",
                right="]"):
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
            print("{C.y}Unreconized command, try 'help' for help{C.n}".format(
                C=C))
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
    def rsm__(self, event):
        for mod in self.mods:
            try:
                getattr(sys.modules[mod], "rsm__" + event)()
            except:
                pass


G = Game()
