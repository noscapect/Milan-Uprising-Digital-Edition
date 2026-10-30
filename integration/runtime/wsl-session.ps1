# Keep only our own WSL client alive while USB is attached and Core starts.
# Closing stdin ends /bin/cat; never terminate a user's distribution or shell.
function ConvertTo-WslArgument([string]$Value) {
  if($Value -match '["\r\n]'){throw 'Invalid WSL argument.'}
  if($Value -match '\s'){return '"'+$Value+'"'}
  return $Value
}
function Start-WslSession([string]$Distribution,[string]$LinuxUser) {
  if(-not $Distribution -or $Distribution -match '["\r\n]'){throw 'Invalid Linux distribution name.'}
  if($LinuxUser -and $LinuxUser -notmatch '^[a-z_][a-z0-9_-]{0,31}$'){throw 'Invalid Linux helper account.'}
  $userArguments=if($LinuxUser){' -u '+$LinuxUser}else{''}
  $info=New-Object System.Diagnostics.ProcessStartInfo
  $info.FileName='wsl.exe'
  $info.Arguments='-d '+(ConvertTo-WslArgument $Distribution)+$userArguments+' --exec /bin/cat'
  $info.UseShellExecute=$false
  $info.CreateNoWindow=$true
  $info.RedirectStandardInput=$true
  $info.RedirectStandardOutput=$true
  $info.RedirectStandardError=$true
  $session=New-Object System.Diagnostics.Process
  $session.StartInfo=$info
  try {
    $null=$session.Start()
    $userArgs=@();if($LinuxUser){$userArgs=@('-u',$LinuxUser)}
    & wsl.exe -d $Distribution @userArgs --exec /bin/true
    if($LASTEXITCODE -or $session.HasExited){
      $detail=if($session.HasExited){($session.StandardOutput.ReadToEnd()+$session.StandardError.ReadToEnd()).Replace([string][char]0,'')}else{'readiness exit '+$LASTEXITCODE}
      throw ('The Linux environment could not be started: '+$detail.Trim())
    }
    return $session
  }catch{Stop-WslSession $session;throw}
}
function Stop-WslSession($Session) {
  if(-not $Session){return}
  try {
    if(-not $Session.HasExited){$Session.StandardInput.Close();if(-not $Session.WaitForExit(3000)){$Session.Kill();$null=$Session.WaitForExit(3000)}}
  }finally{$Session.Dispose()}
}
function Invoke-WithWslSession([string]$Distribution,[string]$LinuxUser,[scriptblock]$Action) {
  $session=Start-WslSession $Distribution $LinuxUser
  try { & $Action } finally { Stop-WslSession $session }
}
