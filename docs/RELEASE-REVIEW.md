# Windows release candidate review

The release workflow is **manual only** (`workflow_dispatch`). No tag, push or pull request starts it. It has not been executed for this work. Do not dispatch it until the project owner has reviewed and approved the work.

`node tools/build-release.mjs` builds a local review ZIP under ignored `work/release-<timestamp>/`. It downloads Node 22 with the official SHA-256 list, Python 3.13.17 with its published SHA-256, and pinned NumPy/OpenCV Windows wheels with PyPI hashes. It builds the project's .NET helpers as self-contained Windows x64 programs. No system runtime, Python installation or SDK is needed on the recipient PC. Source staging uses reviewed public roots and excludes private workspaces, SDK binaries and build caches. Runtime licenses/notices are preserved. The release manifest records dependency versions and file hashes; these check integrity, not publisher authenticity.

The ZIP is named `TCE-<version>-windows-x64.zip` and contains a folder `TCE`. Extract it, then double-click **Install-TCE.cmd**. This per-user installer verifies the file manifest, copies the application to the preserved storage directory `%LOCALAPPDATA%\MilanUprising`, keeps existing `private/` settings and saves, and creates **Teburu Core Emulator (TCE)** desktop/Start-menu shortcuts. The storage path and internal format IDs retain their previous names for compatibility. It needs no administrator rights for the application itself. Stop any running version before upgrading. You can also run **Start-TCE.cmd** from the extracted folder without installing.

First start:

In **Your games**, choose **Add game**, then **Connect Android** for Milan. Existing artwork installs immediately; otherwise the packaged extraction runtime downloads and verifies the reviewed official Windows ZIP and exports the required images automatically. Test both bundled and missing-archive paths, and multiple independently enabled modules. The Windows game is never installed or started. `--without-artwork` and the manual workflow’s **include_artwork** option control packaging. Changing that option does not authorize executing the workflow. See [game installation](GAME-ADDONS.md) and [module contract](GAME-MODULES.md).

1. Accept the setup/package/Android terms once, then choose **Set up automatically**. TCE installs missing components, prepares one radio and the helpers, with progress in the same card. Existing components are reused; manual controls are under Advanced.
2. Approve Windows administrator prompts. If requested, restart Windows, reopen TCE and choose **Continue setup**. No automatic reboot is performed. Adapter selection is asked only when ambiguous or the saved radio is missing.
3. Connect one Android tablet, allow USB debugging, open Milan in English/landscape and confirm that display setting. Tablet checks run automatically. The calibrated resolution remains 2560 × 1600.
4. Choose **Start Core**, connect through Milan's normal flow and open the linked tabletop. Setup alone never attaches the adapter or starts Core.
5. **Stop Core** returns this session's Bluetooth transfer. **Quit app and return Bluetooth to Windows** closes the services. Browser closure does not quit TCE; crash recovery remains explicit.

Local review checks:

```powershell
node tools/build-release.mjs
node tools/smoke-release.mjs
```

The smoke check launches the included Node, Python/vision and Core with development runtime paths removed; it does not open a radio. For an isolated installation copy without desktop shortcuts, run the candidate's `tools/install-release.ps1 -Destination <your-test-folder> -NoShortcuts`. Do not include the candidate's generated `private/` files when repackaging. The ZIP is produced before smoke tests create any local state.

Required physical acceptance before calling the release ready:

- Clean Windows x64 installation without Node, Python or .NET; manifest checks and per-user shortcuts.
- Fresh one-action WSL2/usbipd/Debian/helper installation, UAC cancel/retry and continuation after a real reboot. Verify bundled OCR without any Windows OCR language pack or machine-wide C++ runtime installation. Verify unprivileged helper-account creation without manual Linux account setup, plus multiple/missing radio selection.
- Linux helper preparation with internet loss/retry and default Linux USB permissions.
- Real authorized Android tablet, English/landscape, unsupported resolution and disconnected/reconnected USB.
- Core discovery/connection in the unmodified official app; supported scans, moves, dice and observed board updates.
- Stop, quit, adapter returned to Windows; start failure rollback, app crash/relaunch and explicit recovery. No unrelated adapter may be detached.
- Existing private settings and saved tabletop preserved on upgrade.
- TCE startup without artwork; one-click download/extraction/install/enabling, interruption/retry, temporary-file cleanup and separately supplied archives. Missing archives must block game use despite an existing cache. Multiple enabled modules and switching with successful/failed Bluetooth cleanup must remain independent.

No test on the development PC substitutes for these clean-machine and real-hardware checks. A full campaign and arbitrary adapters/tablet sizes remain unproven.

After approval, the workflow can first be dispatched with `publish=false` to create a downloadable Actions artifact. Creating a **draft** GitHub release additionally requires `publish=true`, the exact full reviewed commit SHA and approval through the `release-review` environment (configure required reviewers in GitHub). The workflow never makes that draft public automatically. Local builds do not contact GitHub Releases.
