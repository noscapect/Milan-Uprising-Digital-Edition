# Location tiles and Haven room bonuses

Updated 26 October 2026.

## Haven rooms

The ten Haven positions, their room types, and both sides' effects are fixed game data. They are available as soon as the table opens, without reading the official app, selecting room types, or typing bonus text. Haven rooms are separate from the house-shaped Haven tile in a city district.

| Board row, from top | Left room | Right room |
| --- | --- | --- |
| 1 | Personal room 1 | Personal room 2 |
| 2 | Personal room 3 | Personal room 4 |
| 3 | Living Room | Meditation Room |
| 4 | Office | Gym |
| 5 | Library | Gallery |

This mapping was cross-checked against the locally available original board artwork. It is fixed Milan module data, not a runtime visual classification.

### Recording the current side

Every room displays its standard starting side unless an upgraded/purchased side has already been recorded. Existing recorded upgrades are preserved. Selecting a Haven field shows its fixed type, its current recorded effect, and the effects of **both** sides.

Use **Record upgraded side** or **Record standard side** to switch the recorded side directly. Alternatively, choose a level and press **Save room side**. Room types and bonus text are read-only for these fixed positions. Original local upgraded artwork is shown on the physical map when available; returning to standard restores the base map image. The public demo works without these optional images.

Only the side purchased or upgraded in the current campaign is variable. These controls record that side on our table; they do not purchase a room, spend currency, execute a room action, or apply player statistics in Milan.

### Fixed room effects

The public manual explains Haven use and upgrades on page 6 but does not provide a complete room-by-room effect table. The following factual summaries were checked against locally available Windows Milan 1.0.9 room/action definitions. Original app files and artwork remain private. Purchase prices are omitted because local description text and the observed Android purchase UI differed.

| Room | Standard side | Upgraded / purchased side |
| --- | --- | --- |
| Personal room | +1 Willpower | +2 Willpower |
| Meditation room | Spend 2 Willpower: +2 XP or -3 Hunger | Spend 1 Willpower: +2 XP or -3 Hunger |
| Living room | Spend 3 Resources: +1 AP next turn | Spend 3 Resources: all characters gain +1 AP next turn |
| Office | Not purchased | Spend 2 Resources: -2 Suspicion |
| Gym | Not purchased | Spend 1 Willpower: +1 Physical next night |
| Library | Not purchased | Spend 1 Willpower: +1 Mental next night |
| Gallery | Not purchased | Spend 1 Willpower: +1 Social next night |

For Office, Gym, Library, and Gallery, the second side represents the purchased room. Room effects are descriptions of actions, not automatically applied passive buffs. Milan controls availability, payment, recipients, and duration.

### Removed dependency on screen recognition

The earlier approach incorrectly treated the fixed room layout and effect text as information that needed to be observed in Milan. The experimental Haven screenshot worker is no longer scheduled and no longer updates room state in the private adapter. No ten-room overview is required. Legacy observation helpers remain compatible with saved side data, but the normal board obtains its room identity and effect text from the fixed catalog.


## City location tiles

Select a city district and open **Location → Board tiles** to see the tile symbol, meaning, and usage. **Flip tile** switches between its back and symbol sides. Use **Copy or correct a tile** to record a tile shown in Milan. This works on the schematic map and the shared linked board.

The [official game manual, page 7](https://teburu.com/downloads/VtM/VTM_MU_GameManual.pdf#page=7) describes Haven, Herd, Income, Media Office, Possible Haven, Secret Bar, and Underground bonuses. A complete verified mapping of both physical tile sides to every district is not built in. Unknown tiles remain unconfigured or unidentified. Selecting a bonus does not perform its associated game action; Milan handles that action.

The observed Android **Scenario setup → Board tiles** screen showed a house symbol in QT8. The board labels this **Haven** and explains its purpose. The former labels “Haven 11” and “Haven 12” were not supported as distinct rule terms. Their legacy storage values remain readable, but the UI no longer presents them as different Haven types or room numbers. Mapping every physical tile side remains open.

## Physical meaning and UI behavior

A location bonus is a small reversible insert. Its symbol is a reminder of the unlocked bonus; the official app offers the associated action. Attribute icons in the center of a district indicate expected encounter attributes and are a separate information layer. Control tokens indicate which faction controls the district. See the manual, pages 7, 8, and 13.

The board explains symbols and tile sides and keeps tile correction separate from playing the associated action. During a recognized setup step, compare the displayed side and then use **Continue** in Milan. Displaying the explanation does not execute a game action. A connection error in Milan is recognized as an error rather than successful setup.

## Storage and architecture

Tile state is separate, headless Milan module data: `milan-location-tiles`, schema version 1, with a revision and per-district bonus and special tiles. Each tile has a value and a visibility state: unconfirmed, hidden, or visible. Commands validate the district, tile kind, value, and expected revision. No graphical objects are stored in this state, so it can be consumed by 2D and future 3D presentations.

Haven room data is an optional `havenRooms` map in the same state. Existing exports without that field remain readable. Changes do not alter the engine, board profiles, or component events.

For fixed Haven positions, missing side records resolve to the standard starting side. Existing upgraded records retain their side; room type and effect text are resolved from the fixed catalog, including when old manual metadata is imported. Missing records do not hide a room's identity or rules. Generic nonstandard Haven fields retain the legacy editor behavior.

Standalone session JSON exports include the optional `locationTiles` state. Import validates it before replacing the table; older exports without it remain usable. Tile state does not have its own undo/redo history; flip a tile again to restore its previous visibility.

The private linked table stores tile data separately on the PC. All connected browsers read and modify the same state. A stale revision is rejected and refreshed. Flipping a loose physical tile does not require sensor contact and sends no simulated confirmation to Milan. The player uses **Continue** in the official app. Automatic recognition of every setup tile and automatic tile reset for a new campaign remain unimplemented.

## Validation history

The 24 October checks covered both tile kinds, validation, revision conflicts, preservation of component positions, export/restore, immutable projections, shared state, flipping, and persistence after reload. The meaning check used actual stored tile state with a simulated setup phase; Milan displayed a network error during that test. The routes retain the same login and origin checks as board movement. All 48 tests available at that time passed, and existing drag controls were checked in the browser.

The later Haven checks cover complete atomic observations, idempotency, room identifiers, bonus and upgrade changes, immutable state, and hiding unknown map labels. Local reference images and recognition data remain under ignored `private/` storage.

The fixed room reference update passes all 80 public tests. Tests cover both sides for every known room type, rejection of unknown reference states, immutable reference results, and preserving engine/player state when recording a side. The browser check verifies automatic bonus filling, standard/upgraded switching on the map, purchased-room text, manual correction reset, and mobile layout. No action was sent to the official app.

The subsequent fixed-layout correction passes all 86 public tests. The browser check verifies all ten room identities and bonus labels immediately on opening, both side descriptions, read-only room identity/effect text, side changes, optional upgraded artwork, return to the standard background, and mobile layout. Headless checks cover preserved upgrades, legacy metadata correction, export/restore, and unchanged player/component state. The previous screenshot and manual-bonus workflows are historical, not requirements of the current UI.
