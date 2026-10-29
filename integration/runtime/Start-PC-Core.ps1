param()
$ErrorActionPreference='Stop'
$settings=Get-Content -LiteralPath (Join-Path $PSScriptRoot 'machine.json') -Raw | ConvertFrom-Json
if($settings.usbAdapter -notmatch '^[0-9a-fA-F]{4}:[0-9a-fA-F]{4}$'){throw 'Run the linked setup with your USB adapter VID:PID first.'}
if(-not $settings.wslDistribution -or -not $settings.corePython){throw 'Run the linked setup first.'}
if(Get-NetTCPConnection -LocalPort 5181 -State Listen -ErrorAction SilentlyContinue){return}
$usbip=(Get-Command usbipd.exe -ErrorAction Stop).Source
$adapterPattern=[regex]::Escape($settings.usbAdapter)
$rows=@((& $usbip list) | Where-Object {$_ -match ('^\s*\d+-\d+\s+'+$adapterPattern+'\s')})
if($rows.Count -ne 1 -or $rows[0] -notmatch '^\s*(\d+-\d+)\s'){throw 'The selected USB adapter was not found uniquely.'}
$busId=$Matches[1]
if($rows[0] -match '\bNot shared\s*$'){throw 'Share this adapter explicitly with usbipd bind --busid before starting. This requires administrator rights.'}
if($rows[0] -notmatch '\bAttached\s*$'){
  if($rows[0] -notmatch '\bShared\s*$'){throw 'Unexpected USB sharing state.'}
  & $usbip attach --wsl $settings.wslDistribution --busid $busId
  if($LASTEXITCODE){throw 'Could not attach the selected adapter to WSL.'}
}
$linuxScript=(& wsl.exe -d $settings.wslDistribution --exec wslpath -u (Join-Path $PSScriptRoot 'bumble-core.py')).Trim()
if($LASTEXITCODE){throw 'Could not resolve the runtime path in WSL.'}
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
