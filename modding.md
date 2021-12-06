## What can be saved and what can't
Pushing a value to `G.dataToSave` will cause `G.[value]` to be added to the save data package.

Keep in mind that all methods will have to be reinitialized and any objects in the save package (nested or not) cannot contain any methods.