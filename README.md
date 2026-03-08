# best-left-buried-VTT

Change log :

# **2026-03-08**

**Weapons sheet**
- Added note box after initiative in the item sheet. Note is not in the character sheet. Note appears in the roll chat. 

**Loot**
- Added counter for number of items of the same loot.
- Replaced in the character sheet the tick box for equipping with the number of items.
- Added counter for number of uses. Also appears in the character sheet.
- Number of slots is added manually.

# **2026-03-06**

- Fixed upper hand and against the odds rolls removing 2 dice instead of 1.
- Fixed bug with weapon's attributes not displaying correctly.

**Consequences and advancements:**
- Added "Type" text box above description. Only appears in the item sheet.


# **2026-02-22**

**Advancements sheet:**
- Added maximum and current of uses
- Add uses counter to the character sheet
- Fixed custom formula not formatting the roll accordingly (upper hand formula, in the roll did not scratch the lowest dice)

**Consequences and advancements:**
- Counter is now editable in the character sheet 


# **2026-02-21**

-  Migration to v3
-  New file structure
-  Code modularized

**Bugs**
-  Fixed Encumbrance only updating after closing/opening sheet

**Roll messages:**
-  New lines on the comment 
-  Attribute and damagemod in bold in new lines
-  Fixed attributes not changing and not included in the roll
-  Fixed custom modifiers not in the roll message 
-  Fixed upper hand and against all odds is not showing the attribute stat

**Armor:**
- Fixed armor value not updating 

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
- Added Prosemirror editor

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
