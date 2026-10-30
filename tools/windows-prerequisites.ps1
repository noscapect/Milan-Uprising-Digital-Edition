param(
  [ValidateSet('Check','InstallWsl','InstallUsbipd','InstallLinux','InstallOcr','OpenLinux','BindAdapter')][string]$Action='Check',
  [string]$ResultPath,
  [string]$BusId,
  [string]$ExpectedVidPid,
  [switch]$Interactive,
  [switch]$Unattended
)
$ErrorActionPreference='Stop'
[Console]::OutputEncoding=[System.Text.UTF8Encoding]::new($false)
$OutputEncoding=[Console]::OutputEncoding

function Find-Usbipd {
  $found=Get-Command usbipd.exe -ErrorAction SilentlyContinue
  if($found){return $found.Source}
  $installed=Join-Path $env:ProgramFiles 'usbipd-win/usbipd.exe'
  if(Test-Path -LiteralPath $installed){return $installed}
  return $null
}
function Get-BluetoothAdapters($Usbipd) {
  if(-not $Usbipd){return @()}
  $ids=@(Get-CimInstance Win32_PnPEntity -Filter "PNPClass = 'Bluetooth'" -ErrorAction Stop | ForEach-Object {
    if($_.DeviceID -match '^USB\\VID_([0-9A-F]{4})&PID_([0-9A-F]{4})'){($Matches[1]+':'+$Matches[2]).ToLowerInvariant()}
  })
  $rows=@(& $Usbipd list)
  if($LASTEXITCODE){throw 'Could not list USB devices. Check the usbipd installation.'}
  return @($rows | ForEach-Object {
    if($_ -match '^\s*(\d+-\d+)\s+([0-9a-fA-F]{4}:[0-9a-fA-F]{4})\s+(.+?)\s{2,}(Not shared|Shared|Attached)\s*$'){
      $bus=$Matches[1];$vid=$Matches[2].ToLowerInvariant();$description=$Matches[3];$state=$Matches[4]
      if($ids -contains $vid){[pscustomobject]@{busId=$bus;vidPid=$vid;label=$description;state=$state}}
    }
  })
}
function Write-Result($Value) {
  if($ResultPath){[System.IO.File]::WriteAllText($ResultPath,($Value|ConvertTo-Json -Depth 6),[System.Text.UTF8Encoding]::new($false))}
  else{$Value|ConvertTo-Json -Depth 6 -Compress}
}

if($Action -eq 'Check'){
  $wsl=Get-Command wsl.exe -ErrorAction SilentlyContinue
  $wslReady=$false;$debianVersion=$null
  if($wsl){
    $savedErrorPreference=$ErrorActionPreference
    try{
      # Missing/disabled WSL is a normal prerequisite state, not a fatal probe error.
      $ErrorActionPreference='Continue'
      $null=& $wsl.Source --status 2>&1
      $wslReady=($LASTEXITCODE -eq 0)
      if($wslReady){
        $rows=@(& $wsl.Source --list --verbose 2>&1)
        if($LASTEXITCODE -eq 0){foreach($line in $rows){$clean=([string]$line).Replace([string][char]0,'');if($clean -match '^\s*\*?\s*Debian\s+.+?\s+([12])\s*$'){$debianVersion=[int]$Matches[1]}}}
      }
    }finally{$ErrorActionPreference=$savedErrorPreference}
  }
  $usbipd=Find-Usbipd
  $adapters=@();$adapterError=$null
  try{$adapters=@(Get-BluetoothAdapters $usbipd)}catch{$adapterError='Bluetooth adapters could not be identified. Check again after installing usbipd.'}
  $restartRequired=(Test-Path -LiteralPath 'HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Component Based Servicing\RebootPending') -or (Test-Path -LiteralPath 'HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\WindowsUpdate\Auto Update\RebootRequired')
  Write-Result @{wslReady=$wslReady;debianVersion=$debianVersion;usbipdInstalled=[bool]$usbipd;wingetAvailable=[bool](Get-Command winget.exe -ErrorAction SilentlyContinue);adapters=$adapters;adapterError=$adapterError;restartRequired=$restartRequired}
  exit 0
}

# Results must stay in this application's private workspace, including when elevated.
$allowedRoot=[System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../private/linked/setup-results'))+[System.IO.Path]::DirectorySeparatorChar
if(-not $ResultPath -or -not [System.IO.Path]::GetFullPath($ResultPath).StartsWith($allowedRoot,[System.StringComparison]::OrdinalIgnoreCase) -or [System.IO.Path]::GetExtension($ResultPath) -ne '.json'){throw 'Invalid private setup result path.'}
if($Action -eq 'BindAdapter' -and ($BusId -notmatch '^\d+-\d+$' -or $ExpectedVidPid -notmatch '^[0-9a-fA-F]{4}:[0-9a-fA-F]{4}$')){throw 'Choose a listed Bluetooth adapter.'}

if(-not $Interactive){
  $arguments=@('-NoProfile','-ExecutionPolicy','Bypass','-File',('"'+$PSCommandPath+'"'),'-Action',$Action,'-Interactive','-ResultPath',('"'+$ResultPath+'"'))
  if($Action -eq 'BindAdapter'){$arguments+=@('-BusId',$BusId,'-ExpectedVidPid',$ExpectedVidPid)}
  if($Unattended){$arguments+='-Unattended'}
  try{
    $launch=@{FilePath=(Join-Path $PSHOME 'powershell.exe');ArgumentList=$arguments;PassThru=$true;Wait=$true;WindowStyle='Normal'}
    if($Unattended){$launch.WindowStyle='Hidden'}
    if($Action -in @('InstallWsl','InstallUsbipd','InstallOcr','BindAdapter')){$launch.Verb='RunAs'}
    # Visible because these are user-requested installers with prompts and agreements.
    $child=Start-Process @launch
    if(-not (Test-Path -LiteralPath $ResultPath)){Write-Result @{ok=$false;message='The setup window closed before completing. Check again and retry.'}}
  }catch{
    $cancelled=($_.Exception.NativeErrorCode -eq 1223 -or $_.Exception.InnerException.NativeErrorCode -eq 1223)
    Write-Result @{ok=$false;cancelled=$cancelled;message=if($cancelled){'Windows permission was cancelled. Nothing further was started.'}else{'Windows could not open the setup window. Check your administrator permissions and retry.'}}
  }
  exit 0
}

try{
  $code=0;$restart=$false;$message='Step completed. Check again to verify the installation.'
  switch($Action){
    InstallWsl {
      & wsl.exe --install --no-distribution
      $code=$LASTEXITCODE
      $restart=($code -in @(3010,1641))
      if($code -eq 0){$setupPreference=$ErrorActionPreference;try{$ErrorActionPreference='Continue';$null=& wsl.exe --status 2>&1;$restart=($LASTEXITCODE -ne 0)}finally{$ErrorActionPreference=$setupPreference}}
      $message='WSL installation finished. Save your work and restart Windows if requested, then reopen Milan Control Center and check again.'
    }
    InstallUsbipd {
      $winget=Get-Command winget.exe -ErrorAction SilentlyContinue
      if(-not $winget){throw 'Install Microsoft App Installer from Microsoft Store to make Windows Package Manager available, then retry.'}
      if($Unattended){& $winget.Source install --silent --exact --id dorssel.usbipd-win --source winget --accept-source-agreements --accept-package-agreements --disable-interactivity}
      else{& $winget.Source install --interactive --exact --id dorssel.usbipd-win --source winget}
      $code=$LASTEXITCODE
      $restart=($code -in @(3010,1641))
      $message='usbipd installer finished. Check again; restart Windows if its installer requested it.'
    }
    InstallLinux {
      & wsl.exe --install --distribution Debian --no-launch
      $code=$LASTEXITCODE
      if($Unattended -and $code -eq 0){
        $setupPreference=$ErrorActionPreference;try{$ErrorActionPreference='Continue';$null=& wsl.exe -d Debian -u root --exec /bin/true 2>&1;$initialLinuxCode=$LASTEXITCODE}finally{$ErrorActionPreference=$setupPreference}
        if($initialLinuxCode -ne 0){$debian=Get-Command debian.exe -ErrorAction SilentlyContinue;if($debian){& $debian.Source install --root;$code=$LASTEXITCODE}else{throw 'Linux could not be initialized. Restart Windows and choose Continue setup.'}}
      }
      $message='Debian installation finished. TCE prepares its own helper account without changing existing Linux accounts.'
    }
    InstallOcr {
      $capability=Add-WindowsCapability -Online -Name 'Language.OCR~~~en-US~0.0.1.0'
      $restart=[bool]$capability.RestartNeeded
      $message='English text recognition is installed.'
    }
    OpenLinux {
      # Account setup requires the user's own username/password in the Linux window.
      $debian=Get-Command debian.exe -ErrorAction SilentlyContinue
      if($debian){$null=Start-Process -FilePath $debian.Source -WindowStyle Normal -PassThru}
      else{$null=Start-Process -FilePath wsl.exe -ArgumentList @('--distribution','Debian') -WindowStyle Normal -PassThru}
      $message='Complete the Linux username/password prompts in the opened window, then close that window and check again.'
    }
    BindAdapter {
      $usbipd=Find-Usbipd
      $matchesNow=@(Get-BluetoothAdapters $usbipd | Where-Object {$_.busId -eq $BusId -and $_.vidPid -eq $ExpectedVidPid})
      if($matchesNow.Count -ne 1 -or $matchesNow[0].state -ne 'Not shared'){throw 'The adapter list changed. Check again and choose the adapter anew.'}
      & $usbipd bind --busid $BusId
      $code=$LASTEXITCODE
      $message='The selected Bluetooth adapter is prepared. It has not been attached to WSL or started.'
    }
  }
  $ok=($code -in @(0,3010,1641))
  if(-not $ok){$message='The installer did not complete (exit code '+$code+'). Check the setup window, then retry.'}
  Write-Result @{ok=$ok;restartRequired=$restart;message=$message}
  if(-not $ok -and -not $Unattended){$null=Read-Host 'Press Enter to close this setup window'}
}catch{
  Write-Result @{ok=$false;message=$_.Exception.Message}
  Write-Host $_.Exception.Message
  if(-not $Unattended){$null=Read-Host 'Press Enter to close this setup window'}
}
