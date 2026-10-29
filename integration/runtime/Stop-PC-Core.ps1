param([string]$SessionId,[switch]$Recover)
$ErrorActionPreference='Stop'
$marker=Join-Path $PSScriptRoot 'radio-ownership.json'
if(-not (Test-Path -LiteralPath $marker)){return}
$record=Get-Content -LiteralPath $marker -Raw | ConvertFrom-Json
if($record.released -or (-not $record.attachedByUs -and -not ($Recover -and $record.attemptedByUs))){return}
if($SessionId -and $record.sessionId -ne $SessionId){throw 'This adapter transfer belongs to another app session.'}
if($record.busId -notmatch '^\d+-\d+$' -or $record.vidPid -notmatch '^[0-9a-fA-F]{4}:[0-9a-fA-F]{4}$'){throw 'Invalid saved radio ownership record.'}
$found=Get-Command usbipd.exe -ErrorAction SilentlyContinue
$usbip=if($found){$found.Source}else{Join-Path $env:ProgramFiles 'usbipd-win/usbipd.exe'}
$bus=[regex]::Escape($record.busId);$vid=[regex]::Escape($record.vidPid)
$rows=@((& $usbip list) | Where-Object {$_ -match ('^\s*'+$bus+'\s+'+$vid+'\s')})
if($LASTEXITCODE){throw 'Could not verify the selected radio before returning it to Windows.'}
if($rows.Count -gt 1){throw 'The radio is ambiguous; no device was detached.'}
if($rows.Count -eq 1 -and $rows[0] -match '\bAttached\s*$'){
 & $usbip detach --busid $record.busId
 if($LASTEXITCODE){throw 'The Bluetooth adapter could not be returned. Retry or disconnect that adapter manually.'}
}
$record|Add-Member -NotePropertyName released -NotePropertyValue $true -Force
$record|ConvertTo-Json|Set-Content -LiteralPath $marker -Encoding UTF8
