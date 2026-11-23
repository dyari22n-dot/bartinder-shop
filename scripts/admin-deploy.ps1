# یەک جار بۆ ئەdmین + Firestore لە production
Set-Location $PSScriptRoot\..

Write-Host "1/3 sync-vercel-env..." -ForegroundColor Cyan
& "$PSScriptRoot\sync-vercel-env.ps1"
if ($LASTEXITCODE -ne 0) { exit 1 }

Write-Host "2/3 build..." -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) { exit 1 }

Write-Host "3/3 vercel prod..." -ForegroundColor Cyan
npx vercel --prod --yes
if ($LASTEXITCODE -ne 0) {
  Write-Host "ئەگەر سنووری Hobby deploy: Dashboard → Redeploy یان:" -ForegroundColor Yellow
  Write-Host "  npx vercel redeploy https://bartinder-shop.vercel.app --environment production" -ForegroundColor Yellow
  exit 1
}

Write-Host ""
Write-Host "OK → https://bartinder-shop.vercel.app/admin" -ForegroundColor Green
Write-Host "خاوەن: ناو بەتاڵ + bartender2026"