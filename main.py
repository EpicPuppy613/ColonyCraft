"""
Rogue-like survival management game
Inspired by NeverEnding Legacy
Version ALPHA 0.1.1
"""
print("Initializing...")
from init import G
import time as t
import builtin
import saving
from mods import *
print("-------------")
t.sleep(0.2)
print(G.short) 
G.rsm__("init")
print(G.release + G.version)
while True:
    G.get_command()
