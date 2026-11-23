# بڵاوکردنەوە لە Firebase (App Hosting یان Hosting+Frameworks)
# PowerShell: .\scripts\deploy-firebase.ps1

Set-Location $PSScriptRoot\..

Write-Host "Firebase project: bartender-3a68e"
Write-Host ""
Write-Host "1) Firestore check:"
npm run store:firestore-check
Write-Host ""
Write-Host "2) Env for secrets (App Hosting / Cloud):"
npm run deploy:env-hint
Write-Host ""
Write-Host "3a) App Hosting (Blaze plan required):"
Write-Host "   firebase apphosting:backends:create --project bartender-3a68e"
Write-Host "   firebase apphosting:secrets:set ADMIN_PASSWORD"
Write-Host "   firebase apphosting:secrets:set FIREBASE_PROJECT_ID"
Write-Host "   firebase apphosting:secrets:set FIREBASE_CLIENT_EMAIL"
Write-Host "   firebase apphosting:secrets:set FIREBASE_PRIVATE_KEY"
Write-Host "   firebase deploy --only apphosting"
Write-Host ""
Write-Host "3b) Or Firebase Hosting + Web Frameworks:"
Write-Host "   npx firebase deploy --only hosting --project bartender-3a68e"
Write-Host ""
Write-Host "Public URL: https://bartender-3a68e.web.app (after deploy)"