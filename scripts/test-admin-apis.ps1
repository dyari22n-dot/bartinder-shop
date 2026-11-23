# Smoke test admin APIs on production
$Base = "https://bartinder-shop.vercel.app"
$session = New-Object Microsoft.PowerShell.Commands.WebRequestSession

function Post-Json($url, $body) {
  Invoke-WebRequest -Uri $url -Method POST -Body ($body | ConvertTo-Json -Compress) `
    -ContentType "application/json" -WebSession $session -UseBasicParsing
}

Write-Host "login..." -ForegroundColor Cyan
$r = Post-Json "$Base/api/admin/login" @{ login = ""; password = "bartender2026" }
Write-Host "login" $r.StatusCode

Write-Host "me..." -ForegroundColor Cyan
$me = Invoke-WebRequest -Uri "$Base/api/admin/me" -WebSession $session -UseBasicParsing
Write-Host "me" $me.StatusCode ($me.Content.Substring(0, [Math]::Min(80, $me.Content.Length)))

Write-Host "health..." -ForegroundColor Cyan
$h = Invoke-WebRequest -Uri "$Base/api/admin/health" -WebSession $session -UseBasicParsing
Write-Host "health" $h.Content

Write-Host "OK" -ForegroundColor Green