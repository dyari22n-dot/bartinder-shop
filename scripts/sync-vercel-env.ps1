# PowerShell: .\scripts\sync-vercel-env.ps1
# داتا: Vercel Blob (BLOB_READ_WRITE_TOKEN لە Dashboard)
# ئیمەیڵی ئەدمین (ئارەزوومەند): firebase-service-account تەنها بۆ Auth

Set-Location $PSScriptRoot\..

$whoami = npx vercel whoami 2>&1
if ($LASTEXITCODE -ne 0) {
  Write-Error "Vercel login نییە — سەرەتا: npx vercel login"
  exit 1
}

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
}

Set-VercelEnv "ADMIN_PASSWORD" "bartender2026" -Sensitive

$saPath = Join-Path $PWD "firebase-service-account.json"
if (Test-Path $saPath) {
  $sa = Get-Content $saPath -Raw | ConvertFrom-Json
  $pk = ($sa.private_key -replace "`r`n", "`n")
  Set-VercelEnv "FIREBASE_PROJECT_ID" $sa.project_id -Sensitive
  Set-VercelEnv "FIREBASE_CLIENT_EMAIL" $sa.client_email -Sensitive
  Set-VercelEnvFromStdin "FIREBASE_PRIVATE_KEY" $pk -Sensitive
  $apiKey = $env:NEXT_PUBLIC_FIREBASE_API_KEY
  if (-not $apiKey -and (Test-Path ".env.local")) {
    Get-Content ".env.local" | ForEach-Object {
      if ($_ -match "^\s*NEXT_PUBLIC_FIREBASE_API_KEY\s*=\s*(.+)\s*$") {
        $apiKey = $matches[1].Trim().Trim('"').Trim("'")
      }
    }
  }
  if ($apiKey) {
    Set-VercelEnv "NEXT_PUBLIC_FIREBASE_API_KEY" $apiKey
    Set-VercelEnv "NEXT_PUBLIC_FIREBASE_PROJECT_ID" $sa.project_id
    Set-VercelEnv "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN" "$($sa.project_id).firebaseapp.com"
  }
} else {
  Write-Host "تێبینی: firebase-service-account.json نییە — تەنها ADMIN_PASSWORD و Blob"
}

Write-Host ""
Write-Host "BLOB: Vercel → Storage → Blob → Connect (BLOB_READ_WRITE_TOKEN خۆکار)"
Write-Host "دواتر: npm run store:blob-sync · Redeploy Production"