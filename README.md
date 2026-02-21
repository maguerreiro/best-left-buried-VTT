# best-left-buried-VTT

Change log :


# **2026-02-21**

-  Migration to v3
-  New file structure
-  Code modularized

**Bugs**
-  Fixed Encumbrance only updating after closing/opening sheet



# **2026-02-15**

**Description editor:**
-  Fixed editor bugs
-  Fixed scroll position after re-rendering

**Bugs:**
-  Fixed when equipping a weapon, armor or loot, appears in the console: 
                        foundry.mjs:28185 Uncaught (in promise) TypeError: handler?.call is not a function
                            at #onClickAction (foundry.mjs:28185:56)
                            at #onClick (foundry.mjs:28138:51)

**Character sheet:**
-  Fixed header position in equipment tab



# **2026-02-10**

**Character sheet:**
-  allow paragraphs in the descriptions (new line)

**Item sheets:**
-  text editor (allow formatting) instead of multivarchar
-  same font in the description as on the character sheet 



# **2026-02-06**

**Armor and Loot:**
-  add description to character sheet 



# Older changes
**Character sheet**
Observation + affluence 
-  add upper hand / against all odds

Advancements + consequences
-  description justified
-  change font of description to the same as in the header
-  remove alignment from advancements and consequences names

Advancements:
-  add roll button in the character sheet
-  remove roll button from advancement sheet
-  no upper hand/against odds

Weapons:
-  fix the editable numbers not saving

**Weapons sheet**
-  fix the editable numbers not saving

**Loot sheet:**
-  add description box

**Consequences sheet**
-  Maximum and current number of uses
-  add button to show or hide number of uses in the character sheet

**Character sheet**
Consequences:
-  add Maximum and current of uses
-  only visible the current number of uses
-  number of uses can be hidden from the consequence sheet
-  editable
