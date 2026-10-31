# Teburu Core Emulator (TCE)

Teburu Core Emulator (TCE) is an independent, modular digital tabletop project, with **Vampire: The Masquerade – Milan Uprising** as its first game module. The goal is to use the unmodified official game app with a virtual table, without physical game components. The official app remains responsible for rules, story, and campaign progress.

Renamed from Milan Uprising: Digital Edition on 29 October 2026. TCE now separates its shared engine/Core infrastructure from game-specific code, data, screens and app adapters. Milan is the first implemented module; see [the module contract](docs/GAME-MODULES.md) for adding other games. Existing compatibility and validation limits still apply.

The default application is a standalone sandbox with the included artwork. The optional linked-table runtime is also included as source, with a setup procedure for a Windows PC and the official app on an Android tablet. It has demonstrated limited interaction with the official app, including character registration, movement, dice interaction, resuming a campaign, and copying observed board changes. This is not evidence that every phase, expansion, or hardware behavior works. See [installation on another computer](docs/INSTALLATION.md).

## Quick start

Requires Node.js 22 or later. The standalone source edition needs no package installation when its artwork archive is included. Choose **Add game** for Milan; installation and enabling happen together. The packaged Windows edition also includes the tools to download and extract missing artwork automatically.

```powershell
cd Teburu-Core-Emulator
node server.mjs
```

Open http://127.0.0.1:5178 for **Your games**, choose **Add game**, then **Open tabletop**. Multiple supported games can stay enabled independently. If an archive is missing, the packaged edition downloads the reviewed official Windows client and extracts only the required artwork; it never installs or starts that client. The source edition additionally needs Python/UnityPy for that optional extraction route. The archive must remain present for the game to be usable, including when an extracted cache remains. See [adding games](docs/GAME-ADDONS.md). Stop the standalone server with Ctrl+C.

On Windows, `Start-TCE.cmd` opens the TCE game library. **Connect Android** starts only the selected game adapter and opens its Control Center, with one **Set up automatically** action after one-time terms consent. Missing WSL2/usbipd, Linux helpers and Android tools are prepared in sequence; tablet detection is automatic. Text recognition is included, without a Windows language-pack installation. See [automatic PC setup](docs/AUTOMATIC-SETUP.md). The official Android game app remains required for linked play. Shared PC prerequisites are reused across games. A source checkout still needs Node and the app-helper prerequisites; see [first-time setup](docs/INSTALLATION.md).

`Start-Milan.cmd` remains a compatibility shortcut to `Start-TCE.cmd`. Existing session formats, game IDs and the installation's storage directory are preserved.

A Windows release-candidate builder now packages the runtimes and prebuilt helpers, adds per-user installation, Linux-helper preparation, a tablet wizard and Bluetooth cleanup/recovery. This work is awaiting review; the release workflow has not been executed. See [release review](docs/RELEASE-REVIEW.md).

Run the public test suite with:

```powershell
node --test
```

If npm is available, `npm start` and `npm test` are equivalent shortcuts. The latest Windows checks on 30 October 2026 passed all 150 public tests with both Node 26 and the bundled Node 22 runtime, including independent Control updates, completed NPC movement, setup-tile preservation, portable OCR packaging, WSL startup, add-on availability, optional artwork, release staging, installer integrity, tablet checks and Bluetooth lifecycle ordering alongside the board regressions. See [validation](docs/VALIDATIE.md) for separate browser, package and hardware evidence. Temporary copies under ignored work directories may be discovered by a bare `node --test`; the recorded 150-test result covers the public `test/` and `tests/` suites only.

## Current features and limits

| Feature | Current behavior | Validation limit |
| --- | --- | --- |
| Sandbox table | Place, move, remove, and flip components; export and restore sessions; undo/redo | Does not implement Milan's campaign rules |
| Base game and six expansions | Separate inventories, 233 total components, expansion filters | Full expansion campaigns have not been validated |
| Linked table | Published optional runtime for app-led input and observed board updates; source tools support LAN sharing | Only recognized scenes and observations are supported; LAN sharing starts with the linked adapter |
| Allies and ghouls | Optional Sunset deployment, pending confirmation, and automatic return to stock on confirmed Day | Cleanup tested with recorded Day observations; arbitrary story-driven removals are not fully covered |
| Haven rooms | All ten fixed room types, standard/upgraded effects, recorded side controls, and optional upgraded artwork | Standard starting sides are used unless an upgrade is recorded; purchases and room actions remain in Milan |
| LED ring | App-led colors with segment orientation matching Teburu; simulated firmware and battery status | Static colors only; full hardware animations remain unvalidated |
| Artwork | One-click game installation; uses a bundled archive or downloads/extracts a reviewed Windows client in the background | Milan: 156 images; Windows game never installed or started; the original SDK remains excluded |
| Windows candidate | Bundled runtimes, per-user installer, helper preparation, tablet wizard and Bluetooth recovery | Built and tested locally; no release published and clean-machine physical acceptance remains open |

See [ally and ghoul deployment](docs/ALLIES-EN-GHOULS.md) and [location tiles and Haven bonuses](docs/LOCATIETEGELS.md) for current instructions and evidence.

## Using the table

The activated board uses the available screen width, with **Stock**, **Location**, and **Session** controls. Missing game artwork keeps that game unavailable; TCE's add-on screen remains accessible.

Hold the left mouse button and drag a miniature to a destination, then release. Escape or dropping outside the board cancels the move. Selecting a component and clicking a destination is also supported. Every miniature and token remains visible in crowded locations; there is no four-component cutoff or `+n` counter. Influence follows Milan's display: one cube per faction and district, with no number for one influence, and a **2** or **3** for two or three. Individual cube identities remain in the session and location list. Invalid sandbox counts above three are not silently clamped. The physical-map renderer spreads the displayed components within each approximate region and reduces their size when needed. Zoom in to inspect crowded districts. This is presentation only.

In the sandbox, component positions are manual. Save a JSON export before closing or reloading the page. Import validates the profile, events, and state before replacing the session. Undo/redo keeps up to 100 local operations in the current tab; redo preserves recorded dice results. These controls do not change the official app.

On the linked table, Milan determines which miniature may move. The board does not treat sending a sensor contact as proof of a persistent position. Use the linked board for supported app-led input, and follow Milan for phase changes and campaign decisions.

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

All ten Haven room types and their standard/upgraded effects are fixed and appear immediately. Each room shows its current recorded bonus directly on the board; district bonus labels remain in the Location panel. The standard starting side is shown unless an upgrade was previously recorded. Select a room to see both side descriptions and use **Record upgraded side**, **Record standard side**, or **Save room side** to record the campaign's current side. Room types and effects do not require screen recognition or manual bonus entry. Optional local upgraded artwork changes with the recorded side. These controls do not buy or use a room or apply player statistics in Milan.

The experimental Haven screenshot reader has been removed from the active adapter flow. Fixed layout and effect data no longer depend on an app overview. Only the campaign's purchased/upgraded side needs to be recorded.

For city districts, **Location → Board tiles** explains the tile symbol and lets you flip or correct its recorded side. Tile edits do not execute the corresponding game action in Milan. See [location tiles and Haven bonuses](docs/LOCATIETEGELS.md).

See [faster movement feedback](docs/SNELLERE-TERUGKOPPELING.md) for the pending destination display, targeted confirmation and measured timing limits.

When resuming a loaded game, the linked adapter also reads visible NPC portraits on the **Scenario setup → NPC placement** map after two matching observations. Agnese was verified at Washington; this does not restore hidden pieces or establish a complete save import.

See [placement synchronization and corrections](docs/PLAATSINGSSYNC.md) for named NPC outcomes, all-component copy controls, and automatic recognition limits.

### Other linked-table controls

- **Table menu → Clear board & resync** clears the virtual table and tile settings. Show the relevant setup or map screen in Milan to reread supported visible information. Hidden or unobserved components cannot be restored automatically. The Android campaign save is kept.
- The **Saved roster** guides character registration during recognized setup requests. Unused playable characters are hidden once their selection step is over; the miniature shelf follows the current scan request.
- Prospero's LED-base accessory appears beside the map and displays supported received light states. Its orientation matches Teburu: lights 3/4 above and 2/1 below. See [LED ring behavior](docs/PROSPERO.md). It is separate from the Prospero's Legacy campaign.
- The local Control Center can simulate Core, dice and LED-ring firmware version updates. The ring reports compatibility version 1.15.0 and a stable simulated battery value; Teburu 1.2.0 displayed Firmware up to date and 46% in the live check. See [firmware simulation](docs/FIRMWARE-SIMULATIE.md). It does not install official firmware or implement the official app's bootloader updater.
- A shared LAN board uses the same PC session and an access code. Technical Core controls remain local.

Detailed historical guides: [clearing and resyncing](docs/TAFEL-LEGEN.md), [saved characters](docs/SAVEGAME-PERSONAGES.md), [Prospero](docs/PROSPERO.md), [firmware simulation](docs/FIRMWARE-SIMULATIE.md), and [LAN sharing](docs/BORD-DELEN.md).

## Profiles and artwork

The city map contains 30 named city districts and ten Haven rooms. Its presentation is an approximation of the printed layout, not a verified adjacency map or a complete official campaign starting state.

Choose **Milan · base game + 6 expansion packs** for all 233 components, including 101 expansion components. The linked table has 26 scannable miniatures and separate manual expansion-marker controls. Expansion selection, stories, and rules remain in Milan. See [expansion inventory](docs/UITBREIDINGEN.md).

Older city, retail, neutral-table, and sensor-study profiles remain available for their existing sessions. The retail base inventory contains 132 components. The neutral and reference profiles are demonstrations, not official Milan setups. Session compatibility is validated on import rather than silently migrated.

The sensor study explicitly separates temporary contact from persistent position. It is a local behavior simulation, not an RFID/BLE emulator. The original demo remains at http://127.0.0.1:5178/legacy/index.html; its old export format is not imported into the current engine.

The selected original images remain available in `resources/milan-artwork.json.gz`, with publication explicitly authorized by the project owner. **Add game** installs and enables Milan in one step. Without that archive, the packaged edition downloads the official Windows ZIP, verifies its pinned hash and extracts the 156 selected images. Temporary client resources and the ZIP are removed after success. Game artwork caches, adapter workspaces and enabled state are isolated; existing saves remain compatible. See [game add-ons](docs/GAME-ADDONS.md) and [module architecture](docs/GAME-MODULES.md).

## Architecture and repository

The engine, game rules, game data, UI, and presentation are separate. Milan is a game module rather than an engine dependency. Engine and rule interfaces are headless; graphical objects do not belong in domain state. Future 3D presentation should use the same commands and state as 2D.

| Path | Purpose |
| --- | --- |
| `src/engine/` | Generic state, commands, events, validation, and replay |
| `src/games/milan-uprising/` | Milan module, setup builders, tile state, and companion placement validation |
| `src/application/` | Tabletop orchestration and session handling |
| `src/ui/`, `src/presentation/` | Shared game library, PC preparation and reusable presentation primitives |
| `src/adapters/` | Public adapters, including local sensor behavior simulation |
| `data/games/` | Versioned board and component profiles |
| `server/`, `server.mjs` | Local serving and restricted board sharing |
| `test/` | Current public engine, module, adapter, and replay tests |
| `tests/` | Original regression tests |
| `legacy/`, `src/model.js` | Preserved original reference implementation |
| `integration/runtime/` | Shared Core codec, WSL/Bluetooth and OCR infrastructure; no original SDK |
| `integration/<game-id>/` | Game-specific app adapter, recognition and miniature definitions |
| `games/<game-id>/module.json` | Versioned client, adapter and artwork-source contract |
| `resources/` | Included artwork archive and provenance note |
| `private/` | Ignored generated runtime, settings, sessions, observations and identifiers |

The recent usage guides and this README are in English. Earlier architecture and research records retain their existing filenames and may still be in Dutch:

- [Development plan](docs/PLAN.md)
- [Documentation guide](docs/README.md)
- [Installation](docs/INSTALLATION.md)
- [Release review](docs/RELEASE-REVIEW.md)
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

Publication of the selected artwork and this project's derived integration code was explicitly authorized by the project owner on 29 October 2026. That authorization does not include the original SDK, SDK libraries, documentation or examples. Do not distribute other protected assets, app binaries, audio, story content, confidential SDK material, or private hardware identifiers. Do not bypass security, authentication, or licensing, clone RFID identities, or patch firmware. Do not present compatibility as proven without a reproducible test in the official app.

The standalone sandbox and optional linked table share the same engine and presentation. The objective remains use of the unmodified official app; the sandbox is an intermediate tool. The linked table requires machine-specific transport setup; see [installation](docs/INSTALLATION.md).
