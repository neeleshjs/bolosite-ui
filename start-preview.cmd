@echo off
setlocal
cd /d "%~dp0"
if exist ".venv\Scripts\python.exe" (
  ".venv\Scripts\python.exe" -B preview\server.py %*
) else (
  python -B preview\server.py %*
)
if errorlevel 1 (
  echo.
  echo Preview could not start. Follow README.md setup or try --port 4174.
  pause
)
