# Windows release candidate review

The release workflow is **manual only** (`workflow_dispatch`). No tag, push or pull request starts it. It has not been executed for this work. Do not dispatch it until the project owner has reviewed and approved the work.

`node tools/build-release.mjs` builds a local review ZIP under ignored `work/release-<timestamp>/`. It downloads Node 22 with the official SHA-256 list, Python 3.13.17 with its published SHA-256, and pinned NumPy/OpenCV Windows wheels with PyPI hashes. It builds the project's .NET helpers as self-contained Windows x64 programs. No system runtime, Python installation or SDK is needed on the recipient PC. Source staging uses reviewed public roots and excludes private workspaces, SDK binaries and build caches. Runtime licenses/notices are preserved. The release manifest records dependency versions and file hashes; these check integrity, not publisher authenticity.

The ZIP is named `TCE-<version>-windows-x64.zip` and contains a folder `TCE`. Extract it, then double-click **Install-TCE.cmd**. This per-user installer verifies the file manifest, copies the application to the preserved storage directory `%LOCALAPPDATA%\MilanUprising`, keeps existing `private/` settings and saves, and creates **Teburu Core Emulator (TCE)** desktop/Start-menu shortcuts. The storage path and internal format IDs retain their previous names for compatibility. It needs no administrator rights for the application itself. Stop any running version before upgrading. You can also run **Start-TCE.cmd** from the extracted folder without installing.

First start:

1. **Prepare this PC** installs/checks WSL2, Debian and usbipd after explicit confirmation and Windows UAC where needed. Existing distributions are kept; restart Windows only when requested by Windows.
2. Select the intended USB Bluetooth adapter. Preparing it shares that one device but does not attach/start it.
3. **Prepare app helpers** asks for approval of Linux package installation and Google's Android tools terms. It first checks Windows English OCR without capturing a screen. If missing, a link opens Windows language settings so English text recognition can be added. It downloads Android Platform Tools directly from Google and prepares Python/venv/libusb and the isolated Bumble/aiohttp environment in the selected Debian. No Python/.NET development setup or build commands are needed. Internet access is required for this step. These are Android USB tools, not the Teburu SDK.
4. Connect one Android tablet, allow USB debugging, open Milan and choose **Check tablet**. The wizard distinguishes no device, unauthorized/offline, multiple devices, another foreground app and unsupported physical display resolution. Supported resolution is 2560 × 1600; the user explicitly confirms English/landscape. This confirmation is not automated language/orientation verification.
5. **Start Core** transfers the selected shared radio to WSL and grants the Linux helper access only if that VID:PID is unique within WSL. Another attached identical radio is refused. Connect using Milan's normal Core flow and open the tabletop.
6. **Stop Core** stops the local helper and returns only the radio transfer recorded by this app session. **Quit app and return Bluetooth to Windows** also closes both web services. Closing a browser tab leaves the services running. Forced process termination, Windows shutdown and power loss cannot be guaranteed to run cleanup; on reopening, use the explicit previous-session recovery button. Devices not attached by this app are never automatically detached.

Local review checks:

```powershell
node tools/build-release.mjs
node tools/smoke-release.mjs
```

The smoke check launches the included Node, Python/vision and Core with development runtime paths removed; it does not open a radio. For an isolated installation copy without desktop shortcuts, run the candidate's `tools/install-release.ps1 -Destination <your-test-folder> -NoShortcuts`. Do not include the candidate's generated `private/` files when repackaging. The ZIP is produced before smoke tests create any local state.

Required physical acceptance before calling the release ready:

- Clean Windows x64 installation without Node, Python or .NET; manifest checks and per-user shortcuts.
- Fresh WSL2/usbipd/Debian installation, UAC cancel/retry, real reboot and first Linux account setup.
- Linux helper preparation with internet loss/retry and default Linux USB permissions.
- Real authorized Android tablet, English/landscape, unsupported resolution and disconnected/reconnected USB.
- Core discovery/connection in the unmodified official app; supported scans, moves, dice and observed board updates.
- Stop, quit, adapter returned to Windows; start failure rollback, app crash/relaunch and explicit recovery. No unrelated adapter may be detached.
- Existing private settings and saved tabletop preserved on upgrade.

No test on the development PC substitutes for these clean-machine and real-hardware checks. A full campaign and arbitrary adapters/tablet sizes remain unproven.

After approval, the workflow can first be dispatched with `publish=false` to create a downloadable Actions artifact. Creating a **draft** GitHub release additionally requires `publish=true`, the exact full reviewed commit SHA and approval through the `release-review` environment (configure required reviewers in GitHub). The workflow never makes that draft public automatically. Local builds do not contact GitHub Releases.
