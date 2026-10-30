param([Parameter(Mandatory=$true)][string]$Distribution)
$ErrorActionPreference='Stop'
# Fixed package operations; no app, firmware, USB attach or distribution deletion.
& wsl.exe -d $Distribution -u root --exec env DEBIAN_FRONTEND=noninteractive apt-get update
if($LASTEXITCODE){throw 'Linux package index update failed. Check your internet connection and retry.'}
& wsl.exe -d $Distribution -u root --exec env DEBIAN_FRONTEND=noninteractive apt-get install -y python3 python3-venv libusb-1.0-0
if($LASTEXITCODE){throw 'Linux dependency installation failed.'}
$helperUser='tce-core'
$null=& wsl.exe -d $Distribution -u root --exec getent passwd $helperUser
if($LASTEXITCODE -ne 0){& wsl.exe -d $Distribution -u root --exec /usr/sbin/useradd --create-home --shell /bin/bash $helperUser;if($LASTEXITCODE){throw 'Could not create the isolated TCE helper account.'}}
$helperUid=(& wsl.exe -d $Distribution -u root --exec id -u $helperUser).Trim()
if($LASTEXITCODE -or $helperUid -notmatch '^\d+$' -or $helperUid -eq '0'){throw 'The helper account must be an unprivileged Linux user.'}
$environment=(& wsl.exe -d $Distribution -u $helperUser --exec python3 -c "from pathlib import Path; print(Path.home()/'.local/share/tce-core/venv')").Trim()
if($LASTEXITCODE -or -not $environment.StartsWith('/') -or $environment.Contains("`n")){throw 'Linux environment path unavailable. Retry automatic setup.'}
& wsl.exe -d $Distribution -u $helperUser --exec python3 -m venv $environment
if($LASTEXITCODE){throw 'Could not create the isolated Linux helper environment.'}
& wsl.exe -d $Distribution -u $helperUser --exec ($environment+'/bin/python') -m pip install 'bumble==0.0.236' 'aiohttp'
if($LASTEXITCODE){throw 'Linux helper download failed. Retry when online.'}
& wsl.exe -d $Distribution -u $helperUser --exec ($environment+'/bin/python') -c 'import bumble,aiohttp,usb1'
if($LASTEXITCODE){throw 'The Linux helper did not pass its import check.'}
Write-Output ('MILAN_CORE_PYTHON='+$environment+'/bin/python')
Write-Output ('TCE_LINUX_USER='+$helperUser)
