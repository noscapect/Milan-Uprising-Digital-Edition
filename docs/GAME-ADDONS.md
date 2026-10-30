# Add games to TCE

Open **Start-TCE.cmd** or the installed TCE shortcut. The game library lists supported modules. Click **Add game** for each game you want; multiple games can stay enabled independently. You do not have to disable one to add another.

If its artwork archive is already present, TCE installs and enables the game immediately. Otherwise Milan downloads the official Windows 1.0.9 client ZIP (about 1.01 GB), verifies it and extracts the 156 needed images in the background. Allow roughly 3 GB free disk space. Progress and errors appear on the game's card; other games remain usable. Use **Retry adding game** after a failure. The Windows game is never installed or started; temporary resource files and the downloaded ZIP are removed after success.

Once ready, **Open tabletop** opens that game's standalone table. **Connect Android** opens its linked-play controls when TCE was started through its launcher. The official Android companion app remains required for linked play; Windows is only an artwork source. Use **Set up automatically** once to prepare the PC; tablet detection then runs automatically. See [automatic setup](AUTOMATIC-SETUP.md).

**Disable game** keeps its files and saved sessions, and does not disable other games. If it is the current linked game, TCE finishes its Bluetooth cleanup before disabling it. Games can all remain enabled, while the current launcher runs one Android/Core session at a time. Switching linked games closes the previous session safely.

## Archives supplied separately

Milan uses `milan-artwork.json.gz`. You can still obtain this archive separately and place it in the running application's `resources` folder, then click **Check resource folder again** and **Add game**. TCE displays the actual folder path.

| Edition | Resource folder |
| --- | --- |
| Source checkout | `<repository>\resources` |
| Portable release | `<extracted TCE>\resources` |
| Default per-user installation | `%LOCALAPPDATA%\MilanUprising\resources` |

Use the displayed folder when a custom installation directory was chosen. Copying an archive into the original download folder after installing TCE elsewhere does not update the installed copy. Keep the resulting archive: if it disappears, that game becomes unavailable even if its extracted images remain. Other games, settings and saves are preserved. Restoring the same archive restores its previous installation and enabled state.

## Source edition and packaging

The included archives keep the standalone source edition dependent only on Node. Automatic extraction additionally needs Python with `UnityPy==1.23.0`; the packaged Windows release includes the correct runtime and all extraction dependencies. No Python installation is needed for release users.

Release builders include available declared artwork by default. `node tools/build-release.mjs --without-artwork` omits it while retaining code, recipes and extractors. The manual workflow has the equivalent **include_artwork** option. A missing declared archive does not prevent installing TCE itself. The SDK and official Windows client ZIP are never bundled. See [module architecture and extension contract](GAME-MODULES.md).
