with open("mods/modlist.txt", "r", encoding="utf-8") as modfile:
    mods = modfile.read().split("\n")
    __all__ = mods
modfile.close()