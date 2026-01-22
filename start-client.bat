@echo off
chcp 65001 > nul
cd /d d:\dashboard\client
echo Starting React development server on port 3000...
"C:\Program Files\nodejs\node.exe" "d:\dashboard\client\node_modules\react-scripts\bin\react-scripts.js" start
