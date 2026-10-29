param()
$ErrorActionPreference='Stop'
$settings=Get-Content -LiteralPath (Join-Path $PSScriptRoot 'machine.json') -Raw | ConvertFrom-Json
if($settings.usbAdapter -notmatch '^[0-9a-fA-F]{4}:[0-9a-fA-F]{4}$'){throw 'Run the linked setup with your USB adapter VID:PID first.'}
if(-not $settings.wslDistribution -or -not $settings.corePython){throw 'Run the linked setup first.'}
if(Get-NetTCPConnection -LocalPort 5181 -State Listen -ErrorAction SilentlyContinue){return}
$usbCommand=Get-Command usbipd.exe -ErrorAction SilentlyContinue
if($usbCommand){$usbip=$usbCommand.Source}
else{$usbip=Join-Path $env:ProgramFiles 'usbipd-win/usbipd.exe';if(-not (Test-Path -LiteralPath $usbip)){throw 'Install usbipd in Prepare this PC, then check again.'}}
$adapterPattern=[regex]::Escape($settings.usbAdapter)
$rows=@((& $usbip list) | Where-Object {$_ -match ('^\s*\d+-\d+\s+'+$adapterPattern+'\s')})
if($settings.usbBusId -and @($rows | Where-Object {$_ -match '\bAttached\s*$' -and $_ -notmatch ('^\s*'+[regex]::Escape($settings.usbBusId)+'\s')}).Count){throw 'Another radio of the same model is already attached to WSL. Return it first so the selected radio remains unambiguous.'}
if($settings.usbBusId){$selectedBus=[regex]::Escape($settings.usbBusId);$rows=@($rows | Where-Object {$_ -match ('^\s*'+$selectedBus+'\s')})}
if($rows.Count -ne 1 -or $rows[0] -notmatch '^\s*(\d+-\d+)\s'){throw 'The selected USB adapter was not found uniquely.'}
$busId=$Matches[1]
if($rows[0] -match '\bNot shared\s*$'){throw 'Share this adapter explicitly with usbipd bind --busid before starting. This requires administrator rights.'}
if($rows[0] -notmatch '\bAttached\s*$'){
  if($rows[0] -notmatch '\bShared\s*$'){throw 'Unexpected USB sharing state.'}
  $record=@{sessionId=$env:MILAN_SESSION_ID;busId=$busId;vidPid=$settings.usbAdapter;attemptedByUs=$true;attachedByUs=$false;released=$false}
  if(-not $record.sessionId){throw 'Start the app using Start-Milan before transferring Bluetooth.'}
  $record|ConvertTo-Json|Set-Content -LiteralPath (Join-Path $PSScriptRoot 'radio-ownership.json') -Encoding UTF8
  & $usbip attach --wsl $settings.wslDistribution --busid $busId
  if($LASTEXITCODE){throw 'Could not attach the selected adapter to WSL.'}
  $record.attachedByUs=$true
  $record|ConvertTo-Json|Set-Content -LiteralPath (Join-Path $PSScriptRoot 'radio-ownership.json') -Encoding UTF8
}
$linuxScript=(& wsl.exe -d $settings.wslDistribution --exec wslpath -u (Join-Path $PSScriptRoot 'bumble-core.py')).Trim()
if($LASTEXITCODE){throw 'Could not resolve the runtime path in WSL.'}
$linuxAccess=(& wsl.exe -d $settings.wslDistribution --exec wslpath -u (Join-Path $PSScriptRoot 'prepare-usb-access.py')).Trim()
$linuxUser=(& wsl.exe -d $settings.wslDistribution --exec id -u).Trim()
if($LASTEXITCODE -or $linuxUser -notmatch '^\d+$'){throw 'Could not identify your Linux user.'}
& wsl.exe -d $settings.wslDistribution -u root --exec python3 $linuxAccess $settings.usbAdapter $linuxUser
if($LASTEXITCODE){throw 'Could not grant your Linux helper access to the selected radio. No ambiguous USB devices were changed.'}
$logs=Join-Path $PSScriptRoot 'logs'
$null=New-Item -ItemType Directory -Path $logs -Force
$stamp=Get-Date -Format 'yyyyMMdd-HHmmss-fff'
$child=Start-Process -FilePath wsl.exe -ArgumentList @('-d',('"'+$settings.wslDistribution+'"'),'--exec',('"'+$settings.corePython+'"'),('"'+$linuxScript+'"'),'--serve',('usb:'+$settings.usbAdapter)) -WindowStyle Hidden -RedirectStandardOutput (Join-Path $logs "$stamp.out.log") -RedirectStandardError (Join-Path $logs "$stamp.err.log") -PassThru
for($attempt=0;$attempt -lt 100;$attempt++){
  if(Get-NetTCPConnection -LocalPort 5181 -State Listen -ErrorAction SilentlyContinue){return}
  if($child.HasExited){throw 'Core service stopped. Check private/linked/logs.'}
  Start-Sleep -Milliseconds 250
}
throw 'Core service did not start in time. Check private/linked/logs.'
