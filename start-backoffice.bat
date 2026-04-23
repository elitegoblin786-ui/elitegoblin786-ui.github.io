@echo off
setlocal EnableDelayedExpansion
cd /d "%~dp0"

call :probe_server
if "%SERVER_READY%"=="1" goto open_browser

set "PYTHON_CMD="
py -3 -c "import sys" >nul 2>&1 && set "PYTHON_CMD=py -3"
if not defined PYTHON_CMD python -c "import sys" >nul 2>&1 && set "PYTHON_CMD=python"

if not defined PYTHON_CMD (
  echo Python 3 was not found.
  echo Install Python and make sure the "py" launcher or "python" command is available.
  pause
  exit /b 1
)

start "TheBrandHouse Local Server" "%COMSPEC%" /k "cd /d ""%~dp0"" && %PYTHON_CMD% server.py"

set "SERVER_READY=0"
for /l %%I in (1,1,20) do (
  call :probe_server
  if "!SERVER_READY!"=="1" goto open_browser
  timeout /t 1 /nobreak >nul
)

echo The backoffice server did not respond on http://127.0.0.1:8080.
echo Keep the server window open and check that Python started without errors.
pause
exit /b 1

:probe_server
set "SERVER_READY=0"
powershell -NoProfile -ExecutionPolicy Bypass -Command "try { $null = Invoke-WebRequest -UseBasicParsing -Uri 'http://127.0.0.1:8080/backoffice' -TimeoutSec 2; exit 0 } catch { exit 1 }" >nul 2>&1
if not errorlevel 1 set "SERVER_READY=1"
exit /b 0

:open_browser
start "" "http://127.0.0.1:8080/backoffice"
exit /b 0
