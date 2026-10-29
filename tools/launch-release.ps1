param()
$ErrorActionPreference='Stop'
$root=[System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$logs=Join-Path $root 'private/launcher'
$null=New-Item -ItemType Directory -Path $logs -Force
$stamp=Get-Date -Format 'yyyyMMdd-HHmmss-fff'
try{
 $child=Start-Process -FilePath (Join-Path $root 'runtime/node.exe') -ArgumentList @(('"'+(Join-Path $root 'tools/start-linked.mjs')+'"'),'--open') -WorkingDirectory $root -WindowStyle Hidden -Wait -PassThru -RedirectStandardOutput (Join-Path $logs "$stamp.out.log") -RedirectStandardError (Join-Path $logs "$stamp.err.log")
 if($child.ExitCode){throw 'Milan could not start or close normally. See the private launcher logs in the application folder.'}
}catch{
 Add-Type -AssemblyName System.Windows.Forms
 $null=[System.Windows.Forms.MessageBox]::Show($_.Exception.Message,'Milan Uprising')
}
