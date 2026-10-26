# Location tiles and Haven room bonuses

Updated 26 October 2026.

## Haven rooms

The ten Haven rooms on the left of the board can store their own room type, level (unconfirmed, standard, or upgraded), and current bonus. Previously, these rooms were only part of the static background image, so the board could not display changed bonuses. Haven rooms are separate from the house-shaped Haven location tile in a city district.

The map displays a bonus label only when that room has stored bonus text. Unknown rooms no longer display **Bonus not copied from Milan** over the map. Select a room and use **Location → Haven room** to correct its type, level, and bonus manually. **Save current Haven bonus** saves these values; it does not use the room, purchase an upgrade, or change Milan's campaign.

### Experimental automatic observation

The private screen reader requires two consecutive matching observations of all ten distinct rooms in a validated grid before replacing the stored room state. The public Milan module validates and applies the complete observation atomically. Missing, duplicate, or invalid rooms leave the previous state intact. Repeating the same observation does not change the revision.

Browsers on the linked table share the stored values through the existing tile route. When the Haven overview is not visible, the board retains the last observed values; it does not continuously track changes to rooms that are off screen.

The reader has passed a composed browser fixture containing standard and upgraded rooms. An actual Android screen outside the Haven overview was correctly rejected. Recognition and grid-to-room assignment on the real Haven overview have **not** been validated. Automatic synchronization during a real play session therefore remains unproven. The Haven changes passed public tests and desktop/mobile browser checks; the latest full public suite contains 79 passing tests, including the later companion placement changes.

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

Standalone session JSON exports include the optional `locationTiles` state. Import validates it before replacing the table; older exports without it remain usable. Tile state does not have its own undo/redo history; flip a tile again to restore its previous visibility.

The private linked table stores tile data separately on the PC. All connected browsers read and modify the same state. A stale revision is rejected and refreshed. Flipping a loose physical tile does not require sensor contact and sends no simulated confirmation to Milan. The player uses **Continue** in the official app. Automatic recognition of every setup tile and automatic tile reset for a new campaign remain unimplemented.

## Validation history

The 24 October checks covered both tile kinds, validation, revision conflicts, preservation of component positions, export/restore, immutable projections, shared state, flipping, and persistence after reload. The meaning check used actual stored tile state with a simulated setup phase; Milan displayed a network error during that test. The routes retain the same login and origin checks as board movement. All 48 tests available at that time passed, and existing drag controls were checked in the browser.

The later Haven checks cover complete atomic observations, idempotency, room identifiers, bonus and upgrade changes, immutable state, and hiding unknown map labels. Local reference images and recognition data remain under ignored `private/` storage.
