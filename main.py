"""
Rogue-like survival management game
Inspired by NeverEnding Legacy
Version ALPHA 1.0.1
"""
print("Initializing...")
from init import G
import builtin
from mods import *
import saving
G.rsm__("init")
print("-------------")
print(G.short) 
G.rsm__("version")
print(G.release + G.version)
while True:
    G.get_command()