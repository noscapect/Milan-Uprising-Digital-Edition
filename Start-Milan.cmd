@echo off
rem Compatibility launcher for earlier project versions.
call "%~dp0Start-TCE.cmd" %*
exit /b %errorlevel%
