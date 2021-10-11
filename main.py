"""
Rogue-like survival management game
Inspired by NeverEnding Legacy
Version ALPHA 0.1.1
"""
print("Initializing...")
from init import G
import time as t
import builtin
from mods import *
import saving
import app
print("-------------")
G.rsm__("init")
t.sleep(0.2)
print(G.short) 
G.rsm__("version")
print(G.release + G.version)
while True:
    G.get_command()
