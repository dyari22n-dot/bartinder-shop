# دوای npx vercel login و npx vercel link
# PowerShell: .\scripts\sync-vercel-env.ps1

Set-Location $PSScriptRoot\..

$whoami = npx vercel whoami 2>&1
if ($LASTEXITCODE -ne 0) {
  Write-Error "Vercel login نییە — سەرەتا: npx vercel login"
  exit 1
}

$saPath = Join-Path $PWD "firebase-service-account.json"
if (-not (Test-Path $saPath)) {
  Write-Error "firebase-service-account.json نەدۆزرایەوە"
  exit 1
}

$sa = Get-Content $saPath -Raw | ConvertFrom-Json

function Set-VercelEnv($name, $value, [switch]$Sensitive) {
  $vercelArgs = @(
    "env", "add", $name,
    "--environment", "production,preview,development",
    "--value", $value,
    "--yes", "--force"
  )
  if ($Sensitive) { $vercelArgs += "--sensitive" }
  npx vercel @vercelArgs 2>&1 | Out-Host
  if ($LASTEXITCODE -ne 0) {
    Write-Error "vercel env add $name شکستی هێنا (exit $LASTEXITCODE)"
    exit 1
  }
}

function Set-VercelEnvFromStdin($name, $stdinText, [switch]$Sensitive) {
  $vercelArgs = @(
    "env", "add", $name,
    "--environment", "production,preview,development",
    "--yes", "--force"
  )
  if ($Sensitive) { $vercelArgs += "--sensitive" }
  $stdinText | npx vercel @vercelArgs 2>&1 | Out-Host
  if ($LASTEXITCODE -ne 0) {
    Write-Error "vercel env add $name (stdin) شکستی هێنا"
    exit 1
  }
}

$saJson = (Get-Content $saPath -Raw).Trim()
$saB64 = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($saJson))
Set-VercelEnv "FIREBASE_SERVICE_ACCOUNT_B64" $saB64 -Sensitive
Set-VercelEnvFromStdin "FIREBASE_SERVICE_ACCOUNT_JSON" (Get-Content $saPath -Raw) -Sensitive
Set-VercelEnv "FIREBASE_PROJECT_ID" $sa.project_id -Sensitive
Set-VercelEnv "FIREBASE_CLIENT_EMAIL" $sa.client_email -Sensitive
Set-VercelEnvFromStdin "FIREBASE_PRIVATE_KEY" $sa.private_key -Sensitive
Set-VercelEnv "FIRESTORE_DATABASE_ID" "default"
Set-VercelEnv "FIRESTORE_STORE_DOC" "bartender-kurd"
Set-VercelEnv "FIREBASE_STORAGE_BUCKET" "$($sa.project_id).firebasestorage.app"
Set-VercelEnv "ADMIN_PASSWORD" "bartender2026" -Sensitive

$apiKey = $env:NEXT_PUBLIC_FIREBASE_API_KEY
if (-not $apiKey) {
  $envLocal = Join-Path $PWD ".env.local"
  if (Test-Path $envLocal) {
    Get-Content $envLocal | ForEach-Object {
      if ($_ -match "^\s*NEXT_PUBLIC_FIREBASE_API_KEY\s*=\s*(.+)\s*$") {
        $apiKey = $matches[1].Trim().Trim('"').Trim("'")
      }
    }
  }
}
if (-not $apiKey) {
  Write-Host "تێبینی: NEXT_PUBLIC_FIREBASE_API_KEY لە .env.local یان دەستدانان بۆ Vercel"
} else {
  Set-VercelEnv "NEXT_PUBLIC_FIREBASE_API_KEY" $apiKey
  Set-VercelEnv "NEXT_PUBLIC_FIREBASE_PROJECT_ID" $sa.project_id
  Set-VercelEnv "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN" "$($sa.project_id).firebaseapp.com"
}

Write-Host ""
Write-Host "OK — گۆڕانکاری env تەنها دوای یەک redeploy/production دەچێتە ژوورەوە."
Write-Host "ئەگەر سنووری 100 deploy لە Hobby: Vercel Dashboard → Project → Deployments → … → Redeploy (یەکجار)"
Write-Host "یان: npx vercel redeploy <production-url> --target production --yes"