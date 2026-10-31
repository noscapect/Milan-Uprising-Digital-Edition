# Inspect listeners directly; avoid loading the slow NetTCPIP/CIM provider on each poll.
function Test-CoreListener {
  param([int]$Port=5181)
  return @([System.Net.NetworkInformation.IPGlobalProperties]::GetIPGlobalProperties().GetActiveTcpListeners() | Where-Object { $_.Port -eq $Port }).Count -gt 0
}
function Wait-CoreListener {
  param($Child,[int]$TimeoutMilliseconds=25000,[int]$Port=5181)
  $timer=[System.Diagnostics.Stopwatch]::StartNew()
  while($timer.ElapsedMilliseconds -lt $TimeoutMilliseconds){
    if(Test-CoreListener -Port $Port){return}
    if($Child.HasExited){throw 'Core service stopped. Check private/linked/logs.'}
    Start-Sleep -Milliseconds 100
  }
  throw 'Core service did not start in time. Check private/linked/logs.'
}
