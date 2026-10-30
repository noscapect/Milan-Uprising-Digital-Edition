import test from 'node:test';
import assert from 'node:assert/strict';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {fileURLToPath} from 'node:url';
const execute=promisify(execFile);
test('WSL startup holds the session across attach/service work and closes it on success and failure',{skip:process.platform!=='win32'},async()=>{
 const script=fileURLToPath(new URL('../integration/runtime/wsl-session.ps1',import.meta.url));
 const {stdout}=await execute('powershell.exe',['-NoProfile','-NonInteractive','-Command',`
 $ErrorActionPreference='Stop'
 . $env:TCE_WSL_SESSION_TEST
 if((ConvertTo-WslArgument 'Debian') -ne 'Debian'){throw 'Unnecessary quotes around distribution'}
 if((ConvertTo-WslArgument '/home/tce-core/venv/bin/python') -ne '/home/tce-core/venv/bin/python'){throw 'Unnecessary quotes around executable'}
 if((ConvertTo-WslArgument '/mnt/c/Folder With Spaces/core.py') -ne '"/mnt/c/Folder With Spaces/core.py"'){throw 'Missing path quotes'}
 $script:events=@()
 function Start-WslSession($Distribution,$LinuxUser){$script:events+='open';return 'owned-client'}
 function Stop-WslSession($Session){if($Session -ne 'owned-client'){throw 'Wrong client'};$script:events+='close'}
 Invoke-WithWslSession 'Debian' 'tce-core' { $script:events+='attach';$script:events+='service' }
 try { Invoke-WithWslSession 'Debian' 'tce-core' { $script:events+='failed-attach';throw 'Expected attach failure' } } catch {if($_.Exception.Message -ne 'Expected attach failure'){throw}}
 $script:events|ConvertTo-Json -Compress
 `],{windowsHide:true,env:{...process.env,TCE_WSL_SESSION_TEST:script}});
 assert.deepEqual(JSON.parse(stdout),['open','attach','service','close','open','failed-attach','close']);
});
