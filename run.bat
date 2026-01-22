@echo off
cd /d d:\dashboard\client
start "React Dev Server" cmd /k "C:\Program Files\nodejs\node.exe node_modules\react-scripts\bin\react-scripts.js start"
cd /d d:\dashboard\server
start "Backend Server" cmd /k "C:\Program Files\nodejs\node.exe server.js"
