@echo off
title MediShare Launcher
echo ===================================================
echo           Starting MediShare Healthcare App
echo ===================================================
echo.
echo Starting Backend Server on port 5000...
start "MediShare Server" cmd /k "cd server && npm run dev"
echo Starting Frontend Client on port 5173...
start "MediShare Client" cmd /k "cd client && npm run dev"
echo.
echo Both services have been launched in separate windows!
echo Backend API:  http://localhost:5000
echo Frontend App: http://localhost:5173
echo ===================================================
pause
