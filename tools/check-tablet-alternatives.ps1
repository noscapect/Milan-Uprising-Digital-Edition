#requires -Version 5.1
<#
Read-only host check for a future Android-emulator experiment.
No downloads, installs, radio changes, peer scans or official-app access.
Machine observations are written only under ignored private/.
#>
$ErrorActionPreference = 'Stop'
$workspace = Split-Path -Parent $PSScriptRoot
$outputDirectory = Join-Path $workspace 'private\integration'
$null = New-Item -ItemType Directory -Force -Path $outputDirectory
$computer = Get-CimInstance Win32_ComputerSystem
$processors = @(Get-CimInstance Win32_Processor)
$systemDrive = Get-PSDrive -Name ([IO.Path]::GetPathRoot($workspace).TrimEnd('\').TrimEnd(':'))
$sdkRoots = @((Join-Path $env:LOCALAPPDATA 'Android\Sdk'))
foreach ($candidate in @($env:ANDROID_SDK_ROOT, $env:ANDROID_HOME)) {
  if ($candidate -and $sdkRoots -notcontains $candidate) { $sdkRoots += $candidate }
}
$tools = @('emulator\emulator.exe','platform-tools\adb.exe') | ForEach-Object {
  $relativePath = $_
  [ordered]@{ tool=$relativePath; found=[bool](@($sdkRoots | Where-Object { Test-Path -LiteralPath (Join-Path $_ $relativePath) -PathType Leaf }).Count) }
}
$radioCount = $null
try {
  $radioCount = @(Get-PnpDevice -Class Bluetooth -PresentOnly | Where-Object { $_.InstanceId -like 'USB*' -or $_.InstanceId -like 'PCI*' }).Count
} catch { }
$report = [ordered]@{
  format='milan-tablet-alternatives-prerequisites'
  schemaVersion=1
  checkedAtUtc=[DateTime]::UtcNow.ToString('o')
  hypervisorPresent=[bool]$computer.HypervisorPresent
  memoryGiB=[math]::Round($computer.TotalPhysicalMemory/1GB,1)
  freeWorkspaceDriveGiB=[math]::Round($systemDrive.Free/1GB,1)
  processorVirtualizationFirmwareEnabled=@($processors | ForEach-Object { [bool]$_.VirtualizationFirmwareEnabled })
  physicalBluetoothRadioCount=$radioCount
  androidTools=$tools
  limitations=@(
    'An active hypervisor may mask processor virtualization flags; false is not a BIOS diagnosis.'
    'Does not check Windows Hypervisor Platform or run emulator -accel-check.'
    'No Android image, app ABI, Play availability, Bluetooth or Milan compatibility tested.'
    'No hardware identifiers, device names or pairing secrets included.'
  )
}
$report | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath (Join-Path $outputDirectory 'tablet-alternatives-prerequisites.json') -Encoding UTF8
$report | ConvertTo-Json -Depth 6
