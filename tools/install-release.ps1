param([string]$Destination=(Join-Path $env:LOCALAPPDATA 'MilanUprising'),[switch]$NoShortcuts)
$ErrorActionPreference='Stop'
$source=[System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$destination=[System.IO.Path]::GetFullPath($Destination)
if(-not (Test-Path -LiteralPath (Join-Path $source 'release.json'))){throw 'Run this installer from an extracted TCE release.'}
$manifest=Get-Content -LiteralPath (Join-Path $source 'release-files.json') -Raw | ConvertFrom-Json
if($manifest.schemaVersion -ne 1){throw 'Unsupported release manifest.'}
foreach($file in $manifest.files.PSObject.Properties){
 if($file.Name -match '(^[\\/]|(^|[\\/])\.\.([\\/]|$)|[:\x00-\x1F]|^(private|work|\.git)[\\/])'){throw 'Unsafe release path.'}
 $inputFile=Join-Path $source $file.Name
 $stream=[System.IO.File]::OpenRead($inputFile);$hasher=[System.Security.Cryptography.SHA256]::Create()
 try{$digest=[System.BitConverter]::ToString($hasher.ComputeHash($stream)).Replace('-','')}finally{$stream.Dispose();$hasher.Dispose()}
 if($digest -ne $file.Value){throw ('Release file is damaged: '+$file.Name)}
}
if($source -ne $destination){
  foreach($runningFile in @('runtime/node.exe','runtime/python/python.exe')){
    $existing=Join-Path $destination $runningFile
    if(Test-Path -LiteralPath $existing){try{$probe=[System.IO.File]::Open($existing,[System.IO.FileMode]::Open,[System.IO.FileAccess]::ReadWrite,[System.IO.FileShare]::None);$probe.Dispose()}catch{throw 'Close TCE using Quit app before updating, then retry the installer.'}}
  }
  $null=New-Item -ItemType Directory -Path $destination -Force
  # Preserve private settings and campaigns when upgrading; never copy private files.
  foreach($file in $manifest.files.PSObject.Properties){$target=Join-Path $destination $file.Name;$null=New-Item -ItemType Directory -Path ([System.IO.Path]::GetDirectoryName($target)) -Force;Copy-Item -LiteralPath (Join-Path $source $file.Name) -Destination $target -Force}
  Copy-Item -LiteralPath (Join-Path $source 'release-files.json') -Destination $destination -Force
}
if(-not $NoShortcuts){$shell=New-Object -ComObject WScript.Shell
foreach($folder in @([Environment]::GetFolderPath('Desktop'),(Join-Path ([Environment]::GetFolderPath('Programs')) 'Teburu Core Emulator'))){
 $null=New-Item -ItemType Directory -Path $folder -Force
 $shortcut=$shell.CreateShortcut((Join-Path $folder 'Teburu Core Emulator (TCE).lnk'))
 $shortcut.TargetPath=Join-Path $PSHOME 'powershell.exe';$shortcut.Arguments='-NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -File "'+(Join-Path $destination 'tools/launch-release.ps1')+'"';$shortcut.WorkingDirectory=$destination;$shortcut.Save()
}
}
Write-Host 'TCE installed for your Windows account. Use the Teburu Core Emulator (TCE) shortcut to start.'
