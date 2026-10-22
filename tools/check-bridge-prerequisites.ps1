#requires -Version 5.1
<#
Read-only preparation probe. Run with Windows PowerShell 5.1:
  powershell.exe -NoProfile -File tools/check-bridge-prerequisites.ps1
Never launches or changes the official app, advertises services, scans peers,
connects hardware, or reads save/log contents. Reports stay under private/.
#>
param(
  [string]$AppData = (Join-Path $env:LOCALAPPDATA 'Programs\Teburu\Milan Uprising\1.0.9\VTMTEBURU_v1.0.9\VTMTEBURU_Data')
)
$ErrorActionPreference = 'Stop'
$workspace = Split-Path -Parent $PSScriptRoot
$outputDirectory = Join-Path $workspace 'private\integration'
$null = New-Item -ItemType Directory -Force -Path $outputDirectory
$report = [ordered]@{
  format = 'milan-bridge-prerequisites'
  schemaVersion = 1
  checkedAtUtc = [DateTime]::UtcNow.ToString('o')
  appData = $AppData
  appDataPresent = (Test-Path -LiteralPath $AppData -PathType Container)
  assemblyManifest = 'not-found'
  softwareSignals = @{}
  placementFileCount = $null
  sourceFingerprints = @{}
  runtimeFiles = @{}
  bluetooth = @{ status='unavailable'; lowEnergy=$null; central=$null; peripheral=$null }
  limitations = @('No app launch or modification','No advertising or connection','Not an interoperability test','Not a protocol or sensor mapping')
}
$assemblyFile = Join-Path $AppData 'ScriptingAssemblies.json'
if (Test-Path -LiteralPath $assemblyFile -PathType Leaf) {
  try {
    $names = @((Get-Content -LiteralPath $assemblyFile -Raw | ConvertFrom-Json).names)
    $report.assemblyManifest = 'read'
    foreach ($name in @('Teburu.dll','Starbox.BLE.dll','Starbox.Network.dll','Starbox.Networking.dll','Unity.WebRTC.dll','Starbox.XUSB.dll','LibUsbDotNet.LibUsbDotNet.dll','UniversalDeepLinking-CSharp.dll','UniWebView-CSharp.dll')) {
      $report.softwareSignals[$name] = $names -contains $name
    }
  } catch { $report.assemblyManifest = 'unreadable' }
}
$placements = Join-Path $AppData 'StreamingAssets\MapsOffsets\Milan'
if (Test-Path -LiteralPath $placements -PathType Container) {
  $report.placementFileCount = @(Get-ChildItem -LiteralPath $placements -File -Filter 'Location_*.json').Count
}
foreach ($relative in @('app.info','ScriptingAssemblies.json','RuntimeInitializeOnLoads.json','Plugins\x86_64\BleWinrtDll.dll','Plugins\x86_64\webrtc.dll')) {
  $file = Join-Path $AppData $relative
  if (Test-Path -LiteralPath $file -PathType Leaf) {
    $report.sourceFingerprints[$relative] = @{bytes=(Get-Item -LiteralPath $file).Length;sha256=(Get-FileHash -LiteralPath $file -Algorithm SHA256).Hash.ToLowerInvariant()}
  }
}
# Expected Unity path for this build; existence is not proof of a usable save schema.
$runtime = Join-Path $env:USERPROFILE 'AppData\LocalLow\Xplored\VTMTEBURU'
$report.runtimeFiles = @{
  expectedDirectory = $runtime
  directoryPresent = (Test-Path -LiteralPath $runtime -PathType Container)
  playerLogPresent = (Test-Path -LiteralPath (Join-Path $runtime 'Player.log') -PathType Leaf)
  saveGamesPresent = (Test-Path -LiteralPath (Join-Path $runtime 'SaveGames') -PathType Container)
}
try {
  Add-Type -AssemblyName System.Runtime.WindowsRuntime
  $null = [Windows.Devices.Bluetooth.BluetoothAdapter, Windows.Devices.Bluetooth, ContentType = WindowsRuntime]
  $operation = [Windows.Devices.Bluetooth.BluetoothAdapter]::GetDefaultAsync()
  $method = [System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object { $_.Name -eq 'AsTask' -and $_.IsGenericMethod -and $_.GetGenericArguments().Count -eq 1 -and $_.GetParameters().Count -eq 1 -and $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncOperation`1' } | Select-Object -First 1
  $task = $method.MakeGenericMethod([Windows.Devices.Bluetooth.BluetoothAdapter]).Invoke($null,@($operation))
  if (-not $task.Wait(10000)) { throw 'Capability query timeout' }
  $adapter = $task.Result
  if ($null -eq $adapter) { $report.bluetooth.status = 'no-adapter' }
  else {
    $report.bluetooth = @{status='observed';lowEnergy=[bool]$adapter.IsLowEnergySupported;central=[bool]$adapter.IsCentralRoleSupported;peripheral=[bool]$adapter.IsPeripheralRoleSupported}
  }
} catch { $report.bluetooth.errorType = $_.Exception.GetType().FullName }
$report | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath (Join-Path $outputDirectory 'prerequisites.json') -Encoding UTF8
[ordered]@{report='private/integration/prerequisites.json';appDataPresent=$report.appDataPresent;assemblyManifest=$report.assemblyManifest;placementFileCount=$report.placementFileCount;bluetooth=$report.bluetooth} | ConvertTo-Json -Compress
