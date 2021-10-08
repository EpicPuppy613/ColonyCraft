import math
import sys


class Command:
    def __init__(self, command, mod):
        self.command = command
        self.mod = mod

    def run(self):
        getattr(sys.modules[self.mod], self.command)(G)


class Game:
    version = "0.1.0"
    release = "ALPHA"
    name = "Roguelike Survival Management - OS version 0"
    short = "RSM - OS v0"
    talents = []
    commands = []
    unlocked = []
    hidden = []
    inventory = {}
    definitions = {}
    mods = []
    unlockables = []
    unlocked = []
    """
    Gamestates
    0: Menu
    1: During run
    """
    gamestate = 0

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
            print("Unreconized command, try 'help' for help")
        else:
            self.run_command(command)

    def run_command(self, command):
        runcommand = self.definitions[command]
        runcommand.run()

    def printr(self, stuff):
        print(stuff, end="\r")

    #Events
    def rsm__(self, event):
        for mod in self.mods:
            try:
                getattr(sys.modules[mod], "rsm__" + event)(self)
            except:
                pass

    def initialize_mod(self, mod):
        self.mods.append(mod)


G = Game()
