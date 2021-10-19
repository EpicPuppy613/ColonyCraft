modfile = open("mods/modlist.txt", "r")
mods = modfile.read().split("\n")
__all__ = mods
modfile.close()
