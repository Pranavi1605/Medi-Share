Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "          Starting MediShare Healthcare App        " -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Starting Backend Server on port 5000..." -ForegroundColor Blue
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd server; npm run dev"
Write-Host "Starting Frontend Client on port 5173..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd client; npm run dev"
Write-Host ""
Write-Host "Both services have been launched!" -ForegroundColor Yellow
Write-Host "Backend API:  http://localhost:5000" -ForegroundColor Blue
Write-Host "Frontend App: http://localhost:5173" -ForegroundColor Green
Write-Host "===================================================" -ForegroundColor Cyan
