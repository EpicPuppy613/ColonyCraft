"""
Rogue-like survival management game
Inspired by NeverEnding Legacy
Version ALPHA 0.0.1
"""
print("Initializing...")
from init import G
import time as t
import builtin
from mods import *
print("-------------")
t.sleep(0.2)
print(G.short + "\n" + G.release + " " + G.version)
while True:
    G.get_command()
