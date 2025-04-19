@echo off
echo Starting KYC Automation Agent...

echo Starting backend server...
start cmd /k "cd backend && npm run dev"

echo Starting frontend server...
start cmd /k "cd frontend && npm run dev"

echo KYC Automation Agent started!
echo Backend: http://localhost:5000
echo Frontend: http://localhost:5173
