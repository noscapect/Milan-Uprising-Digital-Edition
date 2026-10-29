param([Parameter(Mandatory=$true)][string]$Distribution)
$ErrorActionPreference='Stop'
# Fixed package operations; no app, firmware, USB attach or distribution deletion.
& wsl.exe -d $Distribution -u root --exec apt-get update
if($LASTEXITCODE){throw 'Linux package index update failed. Check your internet connection and retry.'}
& wsl.exe -d $Distribution -u root --exec apt-get install -y python3 python3-venv libusb-1.0-0
if($LASTEXITCODE){throw 'Linux dependency installation failed.'}
$environment=(& wsl.exe -d $Distribution --exec python3 -c "from pathlib import Path; print(Path.home()/'.local/share/milan-core/venv')").Trim()
if($LASTEXITCODE -or -not $environment.StartsWith('/') -or $environment.Contains("`n")){throw 'Linux environment path unavailable. Finish Debian setup first.'}
& wsl.exe -d $Distribution --exec python3 -m venv $environment
if($LASTEXITCODE){throw 'Could not create the isolated Linux helper environment.'}
& wsl.exe -d $Distribution --exec ($environment+'/bin/python') -m pip install 'bumble==0.0.236' 'aiohttp'
if($LASTEXITCODE){throw 'Linux helper download failed. Retry when online.'}
& wsl.exe -d $Distribution --exec ($environment+'/bin/python') -c 'import bumble,aiohttp,usb1'
if($LASTEXITCODE){throw 'The Linux helper did not pass its import check.'}
Write-Output ('MILAN_CORE_PYTHON='+$environment+'/bin/python')
