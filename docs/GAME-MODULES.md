# TCE and game modules

TCE owns the generic tabletop engine, module registry, game library, artwork installer, runtime lifecycle, synthetic Core codec and Bluetooth transport. Each game owns its rules/data, tabletop screens, app observations, miniature semantics and artwork selection. There is no import of Milan from the shared engine, server or transport. Only Milan currently has a real app adapter; this architecture does not claim that other Teburu games have already been implemented or hardware-validated.

Multiple modules can remain installed and enabled simultaneously. Enabling or opening one does not disable another. Each has its own archive, cache, adapter workspace and session/game identifiers. The library distinguishes **enabled games** from the game currently opened for play. Standalone tables can be opened separately. The current linked launcher runs one Android/Core adapter session at a time; switching first returns the previous session's Bluetooth adapter and closes its service. A cleanup failure prevents switching. That limit does not limit how many modules can remain enabled.

| Location | Responsibility |
| --- | --- |
| `src/engine/`, `src/application/` | Headless generic state, commands and sessions |
| `server/game-modules.mjs`, `server/game-addons.mjs` | Registry, independent game installation/enabling and compatibility with old installation state |
| `server/artwork-acquisition.mjs`, `tools/extract-unity-artwork.py` | Shared verified-download/extraction pipeline |
| `integration/runtime/` | Shared Core codec, WSL/Bluetooth lifecycle and OCR infrastructure |
| `games/<id>/module.json` | Versioned module descriptor and reviewed acquisition source |
| `src/games/<id>/` | Game rules/projections, browser entry point, game-specific screens and styles |
| `data/games/<id>/` | Game profiles and artwork selection recipe |
| `integration/<id>/` | Game app adapter, recognition, miniature catalog and app-specific controls |
| `resources/addons.json` | Explicit registry of bundled supported modules |

The existing Milan session formats, module/profile IDs, `private/bundled-artwork/` image cache and `private/linked/` adapter workspace are preserved. New modules choose distinct cache/workspace names. Shared PC prerequisites and adapter settings are stored in ignored `private/tce-machine.json` and reused when preparing another module. Game sessions and observations remain in the game's workspace. The former single-active add-on state migrates to schema 2 with an `enabled` list; it does not discard the existing installation. The `active` API field remains a compatibility alias for the selected game, not the list of enabled modules.

## Adding another supported game

1. Add a descriptor at `games/<id>/module.json` and register `{ "id": "<id>", "module": "games/<id>/module.json" }` in `resources/addons.json`.
2. Provide the game's engine module/profiles and browser entry points in its own source/data folders. The engine module implements the existing headless contract; there are no graphics or app payloads in generic domain state. Give saves distinct game/package IDs.
3. For linked play, implement the adapter under `integration/<id>/`. Its descriptor declares `linked.source`, `linked.entry`, a unique `linked.workspace`, `androidPackage` and supported `display` dimensions. The adapter runs from its generated private workspace, alongside the shared Core services; source templates are not writable runtime state. Follow the launch/cleanup IPC contract below.
4. Put game-specific miniature semantic bytes in that adapter's `miniatures.json` (`schemaVersion: 1`, slot keys with `identityKey` and byte-array `data`). The shared codec reads this catalog and generates synthetic identities. No Core source edit is required to add miniature definitions.
5. Supply a matching artwork archive or a reviewed `acquisition` descriptor. The current acquisition provider handles an HTTPS Windows Unity ZIP, pinned byte count/SHA-256, version and recipe path. A recipe selects exact source files, Texture2D/Sprite object IDs, names and dimensions, plus the catalog bindings. Unknown/changed clients fail explicitly rather than guessing.
6. Add headless, isolation, browser and adapter tests. Validate the real official app separately before claiming compatibility. The release builder stages each registered adapter automatically.

Milan's descriptor is the working example. Arbitrarily declaring a game in JSON does not implement its renderer or official-app integration, and no external plugin code is downloaded by the artwork installer.

## Linked adapter lifecycle

The shared launcher prepares common sources plus the selected adapter in `private/<workspace>/`, writes its `game-module.json`, and starts the declared entry point. The adapter announces readiness with its `http://127.0.0.1:5180` address. On IPC `tce-shutdown`, it must stop polling/input, stop its Core, return only its recorded radio ownership and close its web server, then send `tce-stopped`. If cleanup fails, send `tce-stop-failed` with a message and remain available for recovery. `tce-quit` requests closing TCE through the same cleanup. Opening the same running adapter reuses it. TCE does not silently take over another application's service on that port.

## Artwork acquisition

The Milan source is the official [Windows download](https://xplo.red/VtM-Win-Download), pinned to Windows 1.0.9 and its reviewed archive hash. Clicking **Add game** uses an existing resource archive when available; otherwise it downloads about 1.01 GB in the background. The shared Python runtime includes UnityPy 1.23.0 and pinned compatible dependencies, so release users do not install Python or extraction tools.

The Windows game is neither installed nor executed. Only the Unity resource files needed for the 156 selected PNGs are temporarily unpacked. After the extraction process exits, the parent checks and removes its own staging directories, then removes the downloaded client ZIP. The resulting artwork archive remains in `resources` and the regular installer validates its PNG hashes before enabling the game. Failed downloads/extractions leave other games usable; retry can reuse an already verified download. Partial downloads are restarted. Closing TCE interrupts acquisition; the user can retry after reopening.

Existing artwork archives remain supported, including the earlier Milan bundle format. Missing archives block that game's use even if its extracted cache remains. A separate archive can still be copied into the displayed resource folder. Builds include available archives by default; `--without-artwork` ships the code, recipes and extractors without them. No original SDK or official client ZIP is included in the release.
