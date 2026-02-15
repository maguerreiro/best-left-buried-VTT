# best-left-buried-VTT

Change log :



<span style="color:red">**2026-02-15**</span>

**Description editor:**
- [x] Fixed editor bugs
- [x] Fixed scroll position after re-rendering

**Bugs:**
- [x] Fixed when equipping a weapon, armor or loot, appears in the console: 
                        foundry.mjs:28185 Uncaught (in promise) TypeError: handler?.call is not a function
                            at #onClickAction (foundry.mjs:28185:56)
                            at #onClick (foundry.mjs:28138:51)

**Character sheet:**
- [x] Fixed header position in equipment tab



<span style="color:red">**2026-02-10**</span>

**Character sheet:**
- [x] allow paragraphs in the descriptions (new line)

**Item sheets:**
- [x] text editor (allow formatting) instead of multivarchar
- [x] same font in the description as on the character sheet 



<span style="color:red">**2026-02-06**</span>

**Armor and Loot:**
- [x] add description to character sheet 



older
**Character sheet**
Observation + affluence 
- [x] add upper hand / against all odds

Advancements + consequences
- [x] description justified
- [x] change font of description to the same as in the header
- [x] remove alignment from advancements and consequences names

Advancements:
- [x] add roll button in the character sheet
- [x] remove roll button from advancement sheet
- [x] no upper hand/against odds

Weapons:
- [x] fix the editable numbers not saving

**Weapons sheet**
- [x] fix the editable numbers not saving

**Loot sheet:**
- [x] add description box

**Consequences sheet**
- [x] Maximum and current number of uses
- [x] add button to show or hide number of uses in the character sheet

**Character sheet**
Consequences:
- [x] add Maximum and current of uses
- [x] only visible the current number of uses
- [x] number of uses can be hidden from the consequence sheet
- [x] editable
