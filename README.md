# Milan Uprising: Digital Edition

An independent, modular digital tabletop project, with **Vampire: The Masquerade – Milan Uprising** as its first game module. The goal is to use the unmodified official game app with a virtual table, without physical game components. The official app remains responsible for rules, story, and campaign progress.

The public application is a standalone sandbox. A separate private adapter has demonstrated limited interaction with the official app, including character registration, movement, dice interaction, resuming a campaign, and copying observed board changes. This is not evidence that every phase, expansion, or hardware behavior works.

## Quick start

Requires Node.js 22 or later. The public demo has no external runtime dependencies and needs no package installation.

```powershell
cd 'C:\CODE\Milan-Uprising-Digital-Edition'
node server.mjs
```

Open http://127.0.0.1:5178. Stop the server with Ctrl+C. Open the page through the server rather than directly from the filesystem.

Run the public test suite with:

```powershell
node --test
```

If npm is available, `npm start` and `npm test` are equivalent shortcuts. The latest implementation check on 26 October 2026 passed all 88 public tests, including automatic Day-phase companion cleanup, the fixed Haven layout and side persistence, Investigation marker transitions, influence stack counts, and placement of visible components within map regions.

## Current features and limits

| Feature | Current behavior | Validation limit |
| --- | --- | --- |
| Sandbox table | Place, move, remove, and flip components; export and restore sessions; undo/redo | Does not implement Milan's campaign rules |
| Base game and six expansions | Separate inventories, 233 total components, expansion filters | Full expansion campaigns have not been validated |
| Linked table | App-led input, observed board updates, shared LAN board | Private local integration; only recognized scenes and observations are supported |
| Allies and ghouls | Optional Sunset deployment, pending confirmation, and automatic return to stock on confirmed Day | Cleanup tested with recorded Day observations; arbitrary story-driven removals are not fully covered |
| Haven rooms | All ten fixed room types, standard/upgraded effects, recorded side controls, and optional upgraded artwork | Standard starting sides are used unless an upgrade is recorded; purchases and room actions remain in Milan |
| Local artwork | Optional images loaded from ignored local storage | Protected artwork is not distributed with the repository |

See [ally and ghoul deployment](docs/ALLIES-EN-GHOULS.md) and [location tiles and Haven bonuses](docs/LOCATIETEGELS.md) for current instructions and evidence.

## Using the table

The board uses the available screen width, with **Stock**, **Location**, and **Session** controls. With local artwork available, it opens the physical map presentation; without it, the schematic board remains usable.

Hold the left mouse button and drag a miniature to a destination, then release. Escape or dropping outside the board cancels the move. Selecting a component and clicking a destination is also supported. Every miniature and token remains visible in crowded locations; there is no four-component cutoff or `+n` counter. Influence follows Milan's display: one cube per faction and district, with no number for one influence, and a **2** or **3** for two or three. Individual cube identities remain in the session and location list. Invalid sandbox counts above three are not silently clamped. The physical-map renderer spreads the displayed components within each approximate region and reduces their size when needed. Zoom in to inspect crowded districts. This is presentation only.

In the sandbox, component positions are manual. Save a JSON export before closing or reloading the page. Import validates the profile, events, and state before replacing the session. Undo/redo keeps up to 100 local operations in the current tab; redo preserves recorded dice results. These controls do not change the official app.

On the private linked table, Milan determines which miniature may move. The board does not treat sending a sensor contact as proof of a persistent position. Use the linked board for supported app-led input, and follow Milan for phase changes and campaign decisions.

Stable positive character observations on Milan's city map update already placed characters as well as missing ones. Unseen or covered characters keep their previous positions. A pending move can also be confirmed by two matching map observations taken after the original placement request; this resolves the request without replaying sensor input if Milan advanced to a different screen.

Active location screens also confirm moves using the recognized character and district heading. Heading recognition includes the higher title position observed in City Life, and does not require an Influence action card: available actions vary by district. A recorded Aristide move from QT8 to City Life was confirmed after this correction, and the next move was enabled without resending the original input.

Investigation markers use a separate, faster image worker while retaining two matching observations. The recorded-image reader check completed those observations in about 4.8 seconds; capture and display updates add to that time. See [investigation marker latency](docs/INVESTIGATION-LATENCY.md) for the implementation changes and measurement limits.

Recognized ordered encounter cards can also move an Investigation marker from a superseded destination to the latest one. Marker updates and browser polling continue while an unrelated character move awaits confirmation. Missing visual icons alone do not remove markers, and Restricted-side tokens are preserved.

The day phase remains recognizable after its initial feed card scrolls away. A bounded, contrast-enhanced header read recovers a dim phase title when needed; explicit influence and control outcomes are checked across two observations. See [day-phase synchronization](docs/PHASE-SYNC.md) for the live validation and limits of partial text updates.

### Optional allies and ghouls

During Sunset, scan the desired ally or ghoul when Milan requests it. After the selected deployment screen is recognized, choose a city district above our board and press **Place in Milan**, or drag the scanned miniature there.

At most one recorded ally or ghoul may occupy a district. Player characters may share that district. Haven rooms are not valid destinations. Milan checks availability, Hunger costs, cooldowns, and effects.

If the app response cannot be recognized automatically, verify the result in Milan before using **Milan accepted this placement** or **Milan did not place it**. These buttons resolve the pending request without resending the sensor contact. Scanning alone does not place a miniature. To skip deployment, use **Done** in Milan.

Deployed allies and ghouls automatically return to stock after two matching observations of Milan's calibrated Day-phase heading. No manual removal is needed for that end-of-night return, and changing feed cards do not block it. Characters and other components are preserved. For corrections outside that recognized flow, **Pieces → Stock → Copy an ally / ghoul removal** remains available. A missing portrait on a partial map alone does not trigger removal. Returning a miniature to stock does not change recruitment or cooldown in Milan.

The UI and adapter behavior passed isolated tests and browser checks. No live companion deployment was performed and no Hunger was spent. See the [deployment guide](docs/ALLIES-EN-GHOULS.md).

### Haven rooms and location tiles

All ten Haven room types and their standard/upgraded effects are fixed and appear immediately. The standard starting side is shown unless an upgrade was previously recorded. Select a room to see both side descriptions and use **Record upgraded side**, **Record standard side**, or **Save room side** to record the campaign's current side. Room types and effects do not require screen recognition or manual bonus entry. Optional local upgraded artwork changes with the recorded side. These controls do not buy or use a room or apply player statistics in Milan.

The experimental Haven screenshot reader has been removed from the active adapter flow. Fixed layout and effect data no longer depend on an app overview. Only the campaign's purchased/upgraded side needs to be recorded.

For city districts, **Location → Board tiles** explains the tile symbol and lets you flip or correct its recorded side. Tile edits do not execute the corresponding game action in Milan. See [location tiles and Haven bonuses](docs/LOCATIETEGELS.md).

### Other linked-table controls

- **Table menu → Clear board & resync** clears the virtual table and tile settings. Show the relevant setup or map screen in Milan to reread supported visible information. Hidden or unobserved components cannot be restored automatically. The Android campaign save is kept.
- The **Saved roster** guides character registration during recognized setup requests. Unused playable characters are hidden once their selection step is over; the miniature shelf follows the current scan request.
- Prospero's LED-base accessory appears beside the map and displays supported received light states. It is separate from the Prospero's Legacy campaign.
- The local Control Center can simulate Core and dice firmware version updates. It does not install official firmware or implement the official app's bootloader updater.
- A shared LAN board uses the same PC session and an access code. Technical Core controls remain local.

Detailed historical guides: [clearing and resyncing](docs/TAFEL-LEGEN.md), [saved characters](docs/SAVEGAME-PERSONAGES.md), [Prospero](docs/PROSPERO.md), [firmware simulation](docs/FIRMWARE-SIMULATIE.md), and [LAN sharing](docs/BORD-DELEN.md).

## Profiles and artwork

The city map contains 30 named city districts and ten Haven rooms. Its presentation is an approximation of the printed layout, not a verified adjacency map or a complete official campaign starting state.

Choose **Milan · base game + 6 expansion packs** for all 233 components, including 101 expansion components. The private linked table has 26 scannable miniatures and separate manual expansion-marker controls. Expansion selection, stories, and rules remain in Milan. See [expansion inventory](docs/UITBREIDINGEN.md).

Older city, retail, neutral-table, and sensor-study profiles remain available for their existing sessions. The retail base inventory contains 132 components. The neutral and reference profiles are demonstrations, not official Milan setups. Session compatibility is validated on import rather than silently migrated.

The sensor study explicitly separates temporary contact from persistent position. It is a local behavior simulation, not an RFID/BLE emulator. The original demo remains at http://127.0.0.1:5178/legacy/index.html; its old export format is not imported into the current engine.

Optional original images from the locally installed app remain under ignored `private/artwork/`. The server serves only an allowlisted local catalog. The public demo also works without those files. Image counts vary with the local extraction; no protected artwork is included in Git. See [artwork handling](docs/ARTWORK.md).

## Architecture and repository

The engine, game rules, game data, UI, and presentation are separate. Milan is a game module rather than an engine dependency. Engine and rule interfaces are headless; graphical objects do not belong in domain state. Future 3D presentation should use the same commands and state as 2D.

| Path | Purpose |
| --- | --- |
| `src/engine/` | Generic state, commands, events, validation, and replay |
| `src/games/milan-uprising/` | Milan module, setup builders, tile state, and companion placement validation |
| `src/application/` | Tabletop orchestration and session handling |
| `src/ui/`, `src/presentation/` | Controls, artwork decoration, and board rendering |
| `src/adapters/` | Public adapters, including local sensor behavior simulation |
| `data/games/` | Versioned board and component profiles |
| `server/`, `server.mjs` | Local serving and restricted board sharing |
| `test/` | Current public engine, module, adapter, and replay tests |
| `tests/` | Original regression tests |
| `legacy/`, `src/model.js` | Preserved original reference implementation |
| `private/` | Ignored local integration, observations, identifiers, and assets |

The recent usage guides and this README are in English. Earlier architecture and research records retain their existing filenames and may still be in Dutch:

- [Development plan](docs/PLAN.md)
- [Architecture](docs/ARCHITECTUUR.md)
- [Decisions](docs/BESLUITEN.md)
- [Implemented contracts](docs/CONTRACTEN.md)
- [Research register](docs/ONDERZOEK.md)
- [Teburu source research](docs/TEBURU-DEEPSEARCH.md)
- [Official-app validation history](docs/APP-VALIDATIE.md)
- [Core validation](docs/CORE-VALIDATIE.md)
- [Contributor instructions](AGENTS.md)

## Boundaries and rights

This project is not affiliated with Xplored, Teburu, or the owners of Vampire: The Masquerade. Names identify the relevant products and components. No public software license has been selected.

Do not distribute protected artwork, app binaries, audio, story content, confidential SDK material, or private hardware identifiers. Private use does not automatically grant redistribution rights. Do not bypass security, authentication, or licensing, clone RFID identities, or patch firmware. Do not present compatibility as proven without a reproducible test in the official app.

The public sandbox and optional private integration are separate deliverables. The objective remains use of the unmodified official app; the sandbox is an intermediate tool.
