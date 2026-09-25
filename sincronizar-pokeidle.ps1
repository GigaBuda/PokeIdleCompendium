$repo = Split-Path -Parent $MyInvocation.MyCommand.Path

Set-Location $repo

git fetch origin main

if ($LASTEXITCODE -ne 0) {
    Write-Host "[AVISO] No se pudo comprobar GitHub. Continuando con la version local."
    exit 0
}

$local = git rev-parse HEAD
$remote = git rev-parse origin/main

if ($local -ne $remote) {
    git pull --ff-only origin main
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[AVISO] No se pudieron aplicar los cambios de GitHub. Continuando con la version local."
        exit 0
    }
}
