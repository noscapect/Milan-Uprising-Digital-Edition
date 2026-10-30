# Automatic PC setup

In the game's Control Center, accept the setup/Android tools terms once and choose **Set up automatically**. That single action checks and prepares all required components in sequence:

1. WSL and the supported Debian WSL2 environment.
2. USB Bluetooth support (usbipd).
3. The selected Bluetooth adapter, without attaching it or starting Core.
4. Android USB tools and an isolated Linux helper account/environment.

Existing components are reused. When there is exactly one available radio, it is selected automatically. If there are several, or the saved radio is missing, TCE asks which one to use. It never silently switches away from a saved radio or takes over an attached radio.

Windows may still display administrator permission prompts. If a restart is needed, save your work, restart Windows, reopen TCE and choose **Continue setup**. Completed steps are skipped; accepted terms remain recorded in the private setup job. TCE never restarts Windows automatically, and reading setup status never resumes an interrupted installer.

Debian initialization does not require a manually entered Linux username/password. The helper preparation creates/reuses an unprivileged `tce-core` account and builds its environment in that account's home directory. Existing Linux accounts, default-user settings and distributions are kept. The Core launcher explicitly uses that account and grants USB access to its UID only for the selected radio. Older source configurations without `linuxUser` retain their previous default-user behavior.

After **This PC is ready**, connect and unlock the Android tablet over USB, allow USB debugging on the tablet and open the supported game. TCE checks the tablet automatically; no separate Check tablet action is required. Confirm English/landscape, then choose **Start Core**. Automatic setup does not start Bluetooth or interact with a campaign.

**Start Core** opens and holds its own WSL client before calling usbipd, including when Debian has stopped since setup finished. That temporary client closes after the Core service is listening, or on startup failure. The distribution and the user's Linux terminals are never terminated. WSL child arguments quote paths containing spaces and leave simple distribution names and Linux executable paths unquoted. A local cold-distribution start has reached `running:true`; this is separate from a tablet connecting successfully.

Errors, permission cancellation, restart and adapter choice are reported in the same setup card. **Retry setup** repeats only the unfinished work. A verified Android tools installation is retained if Linux preparation fails, avoiding another download on retry.

Before launching installers, setup checks the Windows servicing and Windows Update pending-restart flags. An unfinished system update pauses preparation with a restart instruction rather than placing another installer in the servicing queue. After restarting, reopen TCE and choose **Continue setup** to verify the remaining prerequisites.

Text recognition is included in the package: Tesseract 5.2.0 wrapper/native libraries, a checksum-verified English model and app-local C++ runtime libraries. The build and package smoke test force the portable backend and recognize sample text, even if Windows OCR is installed on the build machine. Existing working Windows English OCR remains usable; otherwise the reader automatically uses the bundled backend. No Windows language installation, Windows Update download or OCR-specific restart is started by automatic setup. Model downloads happen at build time only. See the upstream [wrapper](https://github.com/charlesw/tesseract) and [model documentation](https://github.com/tesseract-ocr/tessdata_fast).

Connection readiness is separate from text-recognition readiness. Missing or damaged OCR files do not block preparing the basic connection tools; the setup card explicitly reports that automatic board synchronization is unavailable and asks for TCE repair. It does not silently infer or confirm board changes. Android tools use Google's stable Windows download URL, and helper-account creation uses the explicit Debian `/usr/sbin/useradd` path rather than relying on WSL's inherited search path.

Manual component controls, Linux initialization and helper preparation remain under **Advanced setup and troubleshooting**. Remote-board and simulation controls are collapsed too. If Windows App Installer is missing, the setup card provides its Store link. Existing WSL1 Debian installations are not converted automatically: the card points to the Advanced conversion instructions so user data can be backed up first.

Automatic installation requires the complete packaged Windows edition. A source checkout can keep using the documented developer setup; it is rejected before system changes if the packaged helpers are missing.

## Implementation and checks

`server/automatic-setup.mjs` orchestrates the existing bounded Windows actions and helper preparation. `GET /api/automatic-setup` checks status only; local same-origin JSON `POST /api/automatic-setup/start` requires explicit setup, package and Android terms consent. Progress is stored only in the game's ignored private workspace. Manual preparation and Core startup are blocked while automatic preparation runs.

Unit/browser checks simulate installers, permissions, restart, multiple radios, network errors, retries and USB/tablet responses. They do not replace an actual clean-machine installation. System changes are not performed by those tests.

Platform references: [Microsoft WSL commands](https://learn.microsoft.com/en-us/windows/wsl/basic-commands), [WSL launcher initialization](https://github.com/microsoft/WSL-DistroLauncher), [Windows Package Manager installation options](https://learn.microsoft.com/en-us/windows/package-manager/winget/install), and [Windows capability installation](https://learn.microsoft.com/en-us/powershell/module/dism/add-windowscapability).
