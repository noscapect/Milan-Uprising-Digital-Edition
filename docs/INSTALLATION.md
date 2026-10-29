# Install on another computer

## Table with the included artwork

Install Node.js 22 or later, then clone or download this repository:

```powershell
git clone https://github.com/noscapect/Milan-Uprising-Digital-Edition.git
cd Milan-Uprising-Digital-Edition
npm start
```

Open http://127.0.0.1:5178. No npm packages, Python, SDK or files from the developer's PC are required for this table. `node server.mjs` is equivalent. All 156 selected images, including the map, portraits, expansion pieces, dice and Haven artwork, are included in `resources/milan-artwork.json.gz`. Node unpacks this archive automatically into ignored `private/bundled-artwork/`. The archive contains only a sanitized manifest and PNG images, with SHA-256 checks; local source paths and extraction history are excluded. Keep the archive when copying the application. No Git LFS or separate download is needed.

The table starts with its own empty sandbox session. Export/import your tabletop JSON if you want to transfer a position. Another person's campaign, device identities and pairing secrets are never included.

## Connect the unmodified official app

The optional linked table includes the project's own integration source, Core codec, Bluetooth transport and screenshot readers. The original Teburu SDK, its libraries, examples and documentation are not included or required to build this runtime. Publishing the artwork and the project's derived integration code was explicitly authorized by the project owner on 29 October 2026. This does not grant permission to redistribute the SDK itself.

The supported setup is a Windows 10/11 PC and the official Milan app on an Android tablet. The app needs its own normal installation. This remains an experimental integration with the limited validation documented in [README](../README.md); an entire campaign and arbitrary tablet layouts have not been validated. Screenshot recognition is calibrated to English, landscape 2560 × 1600. It requires an authorized USB debugging connection, Android Platform Tools (`adb` on PATH), Windows English OCR, .NET 8 SDK, Python 3 with the `py` launcher, WSL2 with a Linux distribution and Python 3/venv, and usbipd-win. These tools are prerequisites for the integration, not for the standalone table.

1. Connect your own tablet over USB and approve USB debugging. `adb devices` must list exactly one authorized device. Open Milan yourself; the capture reader refuses other apps.
2. Use `usbipd list` to identify the Bluetooth adapter you intend to use. Record its VID:PID and bus ID. Do not copy the original developer's adapter settings. Sharing this radio with WSL temporarily disconnects its Windows Bluetooth devices; choose an appropriate adapter for your machine.
3. In an administrator terminal, explicitly share only that adapter using `usbipd bind --busid YOUR-BUS-ID`. The setup tool does not bind a radio, change drivers, rename the PC, install firmware or modify the official app.
4. Run the build/setup below, substituting your adapter and installed WSL distribution. This builds the two local .NET executables and installs the Python dependencies in dedicated environments. For an ADB outside PATH add `--adb=C:\path\to\adb.exe` (quote the complete option if it contains spaces).

```powershell
node tools/setup-linked.mjs --usb=YOUR-VID:YOUR-PID --distro=YOUR-DISTRIBUTION
npm run linked
```

5. Open http://127.0.0.1:5180 and press **Start Core on PC**. Only this explicit action attaches the configured shared adapter to WSL. Use Milan's normal Core connection flow. Open **Tabletop** to use the linked board. Follow Milan for rules, story and campaign choices.
6. Use **Stop Core on PC** when finished. To return the radio to Windows, run `usbipd detach --busid YOUR-BUS-ID` for the same adapter. Stopping advertising alone does not detach USB.

`npm run linked` prepares source in ignored `private/linked/`, starts both local web services and leaves Bluetooth stopped until requested. A new machine generates its own synthetic identities, HTTP control secret and virtual radio address. Configuration is written only to `private/linked/machine.json`. Sessions, captured images and diagnostics stay in that private workspace. The existing developer workspace under `private/integration/` is neither read nor copied.

If prerequisites are missing, the standalone artwork table remains available. A real app connection still requires the above hardware transport setup; cloning cannot configure or authorize another computer's Bluetooth adapter or tablet.

To share the linked board on your LAN, run `node tools/share-board.mjs YOUR-PC-LAN-IP` in another terminal. The Control Center displays the generated URL and access code. Allow the Node service through your firewall for your private network if Windows asks. Technical Core controls remain local; this command does not change firewall rules automatically.

## Updating and verification

Pull changes and restart. The linked launcher refreshes only the distributed runtime source and preserves its private settings and sessions. Re-run setup after changing build dependencies or C# code. Do not run files under `integration/runtime/` directly: they are templates for the private runtime.

```powershell
node --test
```

The public test suite checks engine/session behavior and artwork installation. A successful test suite is not proof of compatibility with every physical adapter or official-app version.
