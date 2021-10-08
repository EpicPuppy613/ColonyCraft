## RSM OS - Modding Guide
### Mod Capabilities
- Add new commands
- Add new mechanics
- Add new researches / skills / traits / talents
### Mod Limitations
- Change the general program structure
- Add graphics (ok maybe if you put a lot of work into your mod)
## Modding Guide
### Libraries
```py
from init import G
```
`init` is the initialization module that's run when the game is starting `G` contains the Game object.

### Defining a Command
At the base of a command is a function that is run when the command is run. The function should only have one parameter, which is the Game object. Any variable interaction within the function should be handeled through the Game object.

To register a command use the function `G.register_command([command_name],__name__,[function_name])`, if your command should be unlocked when the game is loaded, put `unlocked=True` when you call the function.

### Game Events
- To define your own event call `[game].rsm__([event])` the event will then be broadcast to all mods as `rsm__[event]`
- `rsm__start` (required) when a new colony is started, include all starting resource giving and command status changing in this function
- `rsm__end` (required) when a colony ends, all resources will automatically be set to 0, revert all command status changes here
- `rsm__tick` (optional) run when time passes, use this event to handle any time based events and job processing
- ### All events below are added by basemod
- All researches/traits/skills/talents will automatically be called when they need to.
- `rsm__r__[research]` (optional) when a research completes, [research] will be the name of the research
- `rsm__t__[trait]` (optional) when a trait is obtained, [trait] will be the name of the trait
- `rsm__s__[skill]` (optional) run once when a new colony starts, [skill] will be the name of the skill
- `rsm__a__[talent]` (optional) run once when a new colony starts, [skill] will be the name of the skill
