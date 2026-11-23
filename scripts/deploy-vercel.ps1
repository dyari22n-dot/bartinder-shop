# سێرڤەری هەمیشەیی + ئاپ لە مۆبایل — Vercel
# PowerShell: .\scripts\deploy-vercel.ps1

Set-Location $PSScriptRoot\..

Write-Host "1) Env list for Vercel dashboard:"
npm run deploy:env-hint
Write-Host ""
Write-Host "2) Login (browser opens):"
npx vercel login
Write-Host ""
Write-Host "3) Link (یەکەم جار):"
Write-Host "   npx vercel link"
Write-Host "4) Env لە Firestore:"
Write-Host "   .\scripts\sync-vercel-env.ps1"
Write-Host "5) Deploy production:"
Write-Host "   npx vercel --prod --yes"
Write-Host ""
Write-Host "Done — open URL, on phone: Install as app / Add to Home Screen"