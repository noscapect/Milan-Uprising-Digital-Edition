# Install on another computer

## Windows release candidate

The local release-candidate build includes Node, Python/NumPy/OpenCV, UnityPy and its pinned extraction dependencies, and self-contained .NET helpers. Extract its ZIP and run **Install-TCE.cmd**, then use the desktop shortcut. This installs for your Windows account and preserves private settings on upgrade. **Start-TCE.cmd** also runs directly from the extracted folder. No system Node, Python, .NET SDK or extraction-tool installation is needed for this packaged edition.

In Control Center, accept the setup/Android tools terms once and choose **Set up automatically**. TCE prepares missing Windows components, Linux, Bluetooth sharing and app helpers in sequence. Text recognition is included and needs no Windows language installation. Already installed components are reused. Approve Windows permission prompts; if a restart is needed, reopen TCE and choose **Continue setup**. Connect and unlock the Android tablet by USB, allow debugging and open Milan. Tablet checks are automatic. Confirm English/landscape and choose **Start Core**. See [automatic setup](AUTOMATIC-SETUP.md) for recovery and exceptional manual steps.

These release changes are awaiting owner review. The GitHub release workflow has not been run, and a complete clean-machine/hardware acceptance test is still required. See [release review and acceptance checklist](RELEASE-REVIEW.md). The instructions below also document the source edition, which still needs development tools.

First open the TCE game library and choose **Add game** for Milan. TCE uses an existing artwork archive or downloads the reviewed Windows ZIP (about 1.01 GB), extracts 156 images and enables the game. It never installs or starts the Windows client. Choose **Connect Android** to open Milan’s Control Center, then follow the PC/tablet steps above. Multiple games can remain enabled. See [adding games](GAME-ADDONS.md).

## Table with the included artwork

Install Node.js 22 or later, then clone or download this repository:

```powershell
git clone https://github.com/noscapect/Teburu-Core-Emulator.git
cd Teburu-Core-Emulator
npm start
```

Open http://127.0.0.1:5178 for **Your games** and choose **Add game**, then **Open tabletop**. No npm packages, Python, SDK or developer-private files are required when `resources/milan-artwork.json.gz` is supplied. Its 156 images install into ignored `private/bundled-artwork/`; keep the archive. If absent, automatic download/extraction requires Python with `UnityPy==1.23.0` in the source edition; the Windows package already includes that runtime. A separate archive can also be copied into the displayed resource folder. No Git LFS is needed.

The table starts with its own empty sandbox session. Export/import your tabletop JSON if you want to transfer a position. Another person's campaign, device identities and pairing secrets are never included.

## Connect the unmodified official app

### Advanced manual Windows preparation

On Windows, double-click `Start-TCE.cmd` to open the game library, add Milan and choose **Connect Android**. Its Control Center opens only when requested. A source checkout requires Node.js 22 or later; the packaged candidate uses its included runtime.

Normally use **Set up automatically**. The controls below are retained under **Advanced setup and troubleshooting**. The **Prepare this PC** panel checks WSL, Debian's WSL version, usbipd and available USB Bluetooth adapters. Checking does not install software, share a USB device or start Core. You can then choose:

- **Install WSL**: opens Microsoft's installer with a Windows administrator prompt. It installs WSL without installing or deleting a distribution. If Windows requests a reboot, save your work, restart and reopen the app. The app never reboots Windows itself.
- **Install Debian**: installs the supported Linux distribution for the current user, keeping existing distributions. **Finish Linux setup** opens Debian for any account setup prompts. An existing WSL1 Debian is not automatically converted; the panel links to Microsoft's conversion instructions so users can back up their data first.
- **Install usbipd**: opens the Windows Package Manager installer for the exact `dorssel.usbipd-win` package. Its prompts and agreements remain visible. This installer adds its normal USB-sharing service and local-subnet firewall rule. If Package Manager is missing, the panel links to Microsoft's App Installer.
- Select a detected **Bluetooth adapter** and choose **Prepare selected adapter**. After a separate confirmation, Windows asks for administrator permission to share only that adapter. An already shared radio can be saved with **Use selected adapter**. Neither button attaches it to WSL or starts Bluetooth. Selection is saved only in `private/linked/machine.json`, including the chosen USB bus, so two identical adapter models are not silently interchanged.

Progress, cancellation, installation failures and restart notices appear in the panel. Reopening the app after an interrupted operation never automatically repeats an installer: use **Check again** and retry the required step. Existing distributions are never removed, the default distribution is not changed, and no automatic firmware, official-app or radio-driver modifications are performed by our setup helper. usbipd itself is installed through its normal Windows installer.

For the source edition, the .NET/Python/ADB prerequisites and app-helper build below are still needed. Once the panel has saved an adapter, `npm run setup:linked` can reuse the saved adapter and distribution without typing their identifiers. Prepare the Windows components before running that command; restart `npm run linked` after the helper build. In the packaged candidate, use **Prepare app helpers** instead.

Implementation references: [Microsoft WSL installation](https://learn.microsoft.com/en-us/windows/wsl/install), [WSL commands](https://learn.microsoft.com/en-us/windows/wsl/basic-commands), [USB setup](https://learn.microsoft.com/en-us/windows/wsl/connect-usb), and [usbipd-win](https://github.com/dorssel/usbipd-win).

### App helpers and tablet connection

The optional linked table includes the project's own integration source, Core codec, Bluetooth transport and screenshot readers. The original Teburu SDK, its libraries, examples and documentation are not included or required to build this runtime. Publishing the artwork and the project's derived integration code was explicitly authorized by the project owner on 29 October 2026. This does not grant permission to redistribute the SDK itself.

The supported setup is a Windows 10/11 PC and the official Milan app on an Android tablet. The app needs its own normal installation. This remains an experimental integration with the limited validation documented in [README](../README.md); an entire campaign and arbitrary tablet layouts have not been validated. Screenshot recognition is calibrated to English, landscape 2560 × 1600. The source edition requires an authorized USB debugging connection, Android Platform Tools (`adb` on PATH), .NET 8 SDK, Python 3 with the `py` launcher, WSL2 with a Linux distribution and Python 3/venv, and usbipd-win. Source setup downloads the pinned English OCR model and prepares the local reader; the packaged edition includes it. Windows English OCR is optional. These tools are prerequisites for the integration, not for the standalone table.

1. Connect your own tablet over USB and approve USB debugging. `adb devices` must list exactly one authorized device. Open Milan yourself; the capture reader refuses other apps.
2. Use `usbipd list` to identify the Bluetooth adapter you intend to use. Record its VID:PID and bus ID. Do not copy the original developer's adapter settings. Sharing this radio with WSL temporarily disconnects its Windows Bluetooth devices; choose an appropriate adapter for your machine.
3. Prefer **Prepare this PC** to select and share the adapter with a Windows confirmation. For manual preparation, use an administrator terminal to share only that adapter with `usbipd bind --busid YOUR-BUS-ID`. Neither path starts the radio. No PC rename, firmware installation or official-app modification is performed.
4. Run the build/setup below, substituting your adapter and installed WSL distribution. This builds the two local .NET executables and installs the Python dependencies in dedicated environments. For an ADB outside PATH add `--adb=C:\path\to\adb.exe` (quote the complete option if it contains spaces).

```powershell
node tools/setup-linked.mjs --usb=YOUR-VID:YOUR-PID --distro=YOUR-DISTRIBUTION
npm run linked
```

5. Open http://127.0.0.1:5178, choose **Add game** for Milan and **Connect Android**. In its Control Center press **Start Core on PC**. Only this explicit action attaches the configured shared adapter to WSL. Use Milan’s normal Core connection flow, then open the linked tabletop.
6. Use **Stop Core** when finished: the app stops its helper and returns the radio transfer it recorded. Use **Quit app and return Bluetooth to Windows** to also close both web services. For a radio you manually attached outside this app, detach that device yourself with `usbipd detach --busid YOUR-BUS-ID`; the app does not automatically detach someone else's transfer.

`npm run linked` starts the TCE library. **Connect Android** prepares shared infrastructure plus that game’s adapter in its isolated ignored workspace; Milan preserves `private/linked/`. New machines generate their own synthetic identities and transport secrets. Shared PC configuration is in `private/tce-machine.json`; game sessions, captures and diagnostics remain in their game workspace. The developer workspace under `private/integration/` is neither read nor copied.

If prerequisites are missing, the standalone artwork table remains available. A real app connection still requires the above hardware transport setup; cloning cannot configure or authorize another computer's Bluetooth adapter or tablet.

From a source checkout, share the linked board on your LAN with `node tools/share-board.mjs YOUR-PC-LAN-IP` in another terminal. The Control Center displays the generated URL and access code. The linked launcher starts LAN sharing automatically; the source CLI remains available for selecting an address manually. Allow the Node service through your firewall for your private network if Windows asks. Technical Core controls remain local; this command does not change firewall rules automatically.

## Updating and verification

Pull changes and restart. The linked launcher refreshes only the distributed runtime source and preserves its private settings and sessions. Re-run setup after changing build dependencies or C# code. Do not run files under `integration/runtime/` directly: they are templates for the private runtime.

```powershell
node --test
```

The public test suite checks engine/session behavior and artwork installation. A successful test suite is not proof of compatibility with every physical adapter or official-app version.
