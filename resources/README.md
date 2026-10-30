# Bundled artwork

`milan-artwork.json.gz` contains the 156 PNG resources used by this edition and a sanitized manifest. Publication was explicitly authorized by the project owner on 29 October 2026. No SDK, application binary, source-installation path, hardware identity or campaign save is included.

`addons.json` registers versioned descriptors in `games/<id>/module.json`. TCE starts without archives. **Add game** installs and enables that game, using its resource archive when present or its reviewed automatic acquisition source otherwise. Multiple games can remain enabled independently. Missing archives still block game use even with an extracted cache; downloading prepares a new archive before installation. Separately supplied archives can be copied here and detected with **Check resource folder again**.

Release builds include available declared archives by default. Use `node tools/build-release.mjs --without-artwork` to omit them while keeping module code, recipes and the bundled extraction tools. The official Windows client is downloaded only when needed, never installed or executed, and removed after successful artwork extraction. The SDK and client ZIP are never shipped. See [game add-ons](../docs/GAME-ADDONS.md) and [module contract](../docs/GAME-MODULES.md). Artwork rights remain with their respective owners.
