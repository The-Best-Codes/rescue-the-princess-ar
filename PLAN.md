# RESCUE THE PRINCESS - AR: Gameplay Flow

**Tagline:** "The classic game plot with an AR twist"

A game where you collect coins through unconventional inputs (hand tracking, facial expressions, AR walking) to buy weapons and defeat a monster to rescue the princess.

---

## GAME PHASES

### **PHASE 0: SPLASH SCREEN & PERMISSIONS**

**What the player sees:**

- Game title and tagline
- Brief story: A villain/monster kidnaps the princess. You must collect coins, buy weapons, and defeat the monster to save her.
- Loading indicator as libraries load

**What happens:**

- Request camera access (REQUIRED)
- Check for AR support (WebXR)
- Check for device motion/gyroscope support
- Display warnings for missing capabilities (but allow game to proceed)
  - "Your device doesn't support AR. The game will still function, but it won't be as cool!"
  - "Your device doesn't support device motion. Shake detection will use alternative input."
- Start button to proceed

**Outcome:** → PHASE 1

---

### **PHASE 1: HAND TRACKING COIN COLLECTION (30 seconds)**

**Instructions Screen (before playing):**

- "Line up your fingertip with the coins to collect them!"
- "The number on the coin shows how long you have to grab it"
- "Move your hand quickly to collect as many coins as possible!"
- Shows visual demo of hand + coin interaction

**What the player sees:**

- Camera feed with live hand skeleton overlay
- Coins appearing on screen with:
  - Large coin SVG (golden)
  - Countdown number in center of the coin: 3 → 2 → 1 → fade out
  - Glow effect around coin
- Coin counter (top-left)
- Timer counting down from 30s (top-right)

**What happens (difficulty progression):**

- **0-10s:** 1 coin at a time, spawns every 1-1.5s, 80-100px size
- **10-20s:** 2-3 coins on screen, spawn every 0.8-1.2s, 60-80px size (getting smaller)
- **20-30s:** 3-4 coins on screen, spawn every 0.5-1.0s, 40-60px size (very small)

**Collection mechanic:**

- Index fingertip must touch coin hitbox
- On touch: Coin disappears with pop animation + SFX (pop/chime sound)
- Counter increments
- If coin countdown reaches 0: Coin fades out silently (not collected)

**End:** Timer hits 0:00 → Show coins collected this phase → Continue button → PHASE 2

---

### **PHASE 2: FACIAL EXPRESSION COIN COLLECTION (30 seconds)**

**Instructions Screen (before playing):**

- "Make the facial expression shown on the coin to collect it!"
- "Expressions: 😊 Happy, 😠 Angry, 😮 Surprised, 😢 Sad, 😐 Neutral, 🤢 Disgusted"
- "The number on the coin shows how long you have to make the expression"
- Shows visual demo of face making expressions

**What the player sees:**

- Camera feed with live face detection overlay (subtle)
- Coins appearing on screen with:
  - Coin SVG (golden)
  - Emoji of target expression (😊, 😠, etc.)
  - Expression label text (e.g., "HAPPY")
  - Countdown number: 3 → 2 → 1 → fade out
- Coin counter (top-left)
- Timer counting down from 30s (top-right)
- Current detected emotion text (feedback showing what face is making)

**What happens (difficulty progression):**

- **0-10s:** Easier expressions (Happy, Sad, Neutral), 1 coin, spawn every 1.5-2s, 80-100px, 5s to collect
- **10-20s:** Mixed (Happy, Sad, Neutral, Angry), 2 coins possible, spawn every 1-1.5s, 60-80px, 4s to collect
- **20-30s:** All expressions (including Surprised, Disgusted), 2-3 coins, spawn every 0.5-1s, 40-60px, 3s to collect

**Collection mechanic:**

- When coin appears with expression, player has countdown seconds to make that facial expression
- Real-time emotion detection checks face
- On match (sufficient confidence): Coin disappears with pop animation + SFX
- Counter increments
- Next coin appears after 0.5s delay
- If countdown reaches 0: Coin fades out silently (not collected)

**End:** Timer hits 0:00 → Show coins collected (Phase 1 total + Phase 2 total) → Continue button → PHASE 3

---

### **PHASE 3: AR COIN HUNT (60 seconds)**

**Instructions Screen (before playing):**

**For AR-capable devices:**

- "Walk around to find coins floating in real space!"
- "When you get close to a coin, it will glow and show 'Shake to collect!'"
- "Shake your phone to collect the coin"
- "Collect as many as you can in 60 seconds!"

**For non-AR devices:**

- "Coins will appear on your screen over the next 60 seconds"
- "Shake your phone to collect them!"
- "You can collect up to 20 coins total"
- "Each coin stays for 3 seconds before disappearing"

**What the player sees (AR):**

- AR view of world with 18 coins scattered around
- Each coin is a 3D golden coin spinning
- When player gets close (~0.35m), coin glows green and shows "Shake to collect!" prompt
- Coin counter (top-left)
- Timer counting down from 60s (top-right)

**What the player sees (Non-AR):**

- 2D screen with coins appearing randomly
- Coin SVG with countdown: 3 → 2 → 1 → fade out
- "Shake to collect!" text below coin
- Coin counter (top-left)
- Timer counting down from 60s (top-right)

**What happens (AR):**

- 18 coins placed in hemisphere around player at 1.0-1.8m distance
- As player walks, they come near coins
- Proximity triggers prompt
- Player shakes phone (accelerometer detects shake)
- Coin collected, disappears with fade animation + SFX
- New coins can be collected as player continues moving

**What happens (Non-AR):**

- Coins spawn every 2-3 seconds
- Each coin visible for 3 seconds before fading
- Player shakes phone to collect
- Can collect max 20 coins
- Shaking collects nearest/any coin on screen

**End:** Timer hits 0:00 → Show coins collected (Phase 1 + Phase 2 + Phase 3 total) → Continue button → PHASE 4

---

### **PHASE 4: WEAPON SHOP**

**Instructions Screen (before playing):**

- "You have collected Y coins!"
- "Choose one weapon from each category: Shield, Sword, and Helmet"
- "Each weapon costs different amounts—choose wisely, warrior!"
- "More powerful weapons = more damage in battle!"

**What the player sees:**

- Three columns: SHIELDS | SWORDS | HELMETS
- Each column has 3 weapon options with:
  - Weapon icon
  - Weapon name
  - Cost in coins
  - Brief description
  - Damage bonus info
- Current coin total displayed at top: "COINS: Y"
- Remaining coins updated in real-time as selections made

**Weapon prices/bonuses:**

```
SHIELDS: Wooden (50 coins, 0%), Iron (100 coins, +5%), Gold (200 coins, +10%)
SWORDS: Iron (75 coins, 0%), Steel (125 coins, +5%), Diamond (250 coins, +10%)
HELMETS: Leather (40 coins, 0%), Steel (90 coins, +5%), Crystal (180 coins, +10%)
```

**What happens:**

- Player clicks weapon card to select it (per category)
- Selected weapon highlights/glows
- Remaining coins recalculate: "COINS: Y - [costs of selected weapons]"
- Buy button for each weapon:
  - ENABLED if player has enough coins
  - DISABLED if not enough coins (greyed out)
- Once all 3 weapons selected (1 Shield, 1 Sword, 1 Helmet):
  - "Proceed to Battle" button becomes active
  - Shows flavor text: "You're ready! Let's face the monster!"

**End:** All weapons selected, "Proceed to Battle" clicked → PHASE 5

---

### **PHASE 5: AR MONSTER BATTLE**

**Instructions Screen (before playing):**

- "Tap the monster repeatedly to attack it with your weapons!"
- "Each tap deals damage based on your weapon power"
- "More powerful weapons = more damage per tap!"
- "Defeat the monster to save the princess!"
- Shows selected weapons
- Shows damage per tap: "Base damage: 10 HP per tap + weapon bonuses = X HP per tap"

**What the player sees (AR):**

- AR view of world with monster appearing 2-3 meters away
- Monster is large, imposing 3D model (idle animation)
- Health bar above monster: "Monster HP: XXX / 300"
- Equipped weapons display (bottom-left): Shield, Sword, Helmet icons
- UI prompt: "Tap the monster to attack!"
- Attack counter showing number of taps (optional)

**What the player sees (Non-AR):**

- Monster appears center-screen as 2D/3D model (stationary)
- Health bar below or above monster
- Same UI elements and counters as AR

**What happens:**

- Player taps on monster
- Each tap:
  - Plays tap animation (sword swings, impact effects)
  - Monster flashes/recoils
  - SFX: Sword hit sound + monster grunt
  - Damage applied: `10 HP * (1 + shield_bonus + sword_bonus + helmet_bonus)`
  - Health bar decreases
  - Attack counter increments
- Monster sits in place (no movement, no attacks back, no roaring)
- Player can tap repeatedly with minimal cooldown

**Damage examples:**

- All base weapons: 10 HP per tap
- Mixed (Iron Shield 5% + Diamond Sword 10% + Steel Helmet 5%): 12 HP per tap
- All best weapons (Gold, Diamond, Crystal): 13 HP per tap

**Monster Health:**

- Scales slightly with weapon quality (200-250 HP total)
- Displays as "Current / Max"

**Victory:**

- Monster HP reaches 0
- Monster death animation (collapse, fade out)
- SFX: Monster death scream + triumphant fanfare
- Princess appears (visual element)
- Victory text: "VICTORY! You've rescued the princess!"

**Victory Screen shows:**

- Total coins collected (breakdown by phase)
- Weapons selected
- Damage per tap
- Total attacks made
- Battle duration
- "Play Again" button → Back to PHASE 0

---

## KEY MECHANICS

### **Coin Countdowns**

- Every coin displays a countdown number (3 → 2 → 1)
- Number updates every second
- After 0: Coin fades out if not collected
- Applies to: Phase 1, Phase 2, Phase 3 (fallback only)

### **Difficulty Progression**

- Phase 1: Coins get smaller, more numerous, faster spawning
- Phase 2: Expressions get harder, time limits decrease, more coins
- Phase 3: Player must move around (AR) or time multiple shakes (fallback)

### **Input Methods**

- **Hand tracking:** Index fingertip collision detection (MediaPipe)
- **Facial expressions:** Real-time emotion detection from face landmarks
- **AR/Shake:** Proximity detection + accelerometer shake detection
- **Tapping:** Traditional touch input for monster battle

### **Fallbacks**

- No AR? Use 2D screen-based coin hunt with shake detection
- No device motion? Use tap buttons instead of shake gesture
- No hand tracking? (Game requires camera, so hand tracking assumed)

### **Flavor & Story**

- "Choose wisely, warrior!" in shop (even though weapons don't matter much)
- Princess rescue as victory condition
- Monster is purely a challenge/sponge
- Simple, lighthearted tone

---

## GAME FLOW SUMMARY

```
PHASE 0 (Permissions)
         ↓
PHASE 1 (Hand Tracking) → Earn coins
         ↓
PHASE 2 (Facial Expressions) → Earn more coins
         ↓
PHASE 3 (AR Hunt) → Earn final coins
         ↓
PHASE 4 (Shop) → Spend coins on weapons
         ↓
PHASE 5 (Battle) → Defeat monster with weapons
         ↓
Victory Screen → Play Again or Exit
```

---

## SOUND EFFECTS NEEDED (tell developer where to download these)

- **Coin collect pop/chime** - Phase 1, 2, 3, 5
- **Sword hit/impact** - Phase 5
- **Monster grunt/pain** - Phase 5
- **Monster death scream** - Phase 5
- **Triumphant fanfare** - Phase 5 victory
