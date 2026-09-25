$ErrorActionPreference = "Stop"

# Repositorio publico de PokeIdleCompendium.
$repoZip = "https://github.com/GigaBuda/PokeIdleCompendium/archive/refs/heads/main.zip"
$repo = $PSScriptRoot

$tempRoot = Join-Path $env:TEMP ("PokeIdleSync_" + [guid]::NewGuid().ToString("N"))
$zipFile = Join-Path $tempRoot "repo.zip"
$extractDir = Join-Path $tempRoot "extract"

try {
    New-Item -ItemType Directory -Path $tempRoot -Force | Out-Null

    Write-Host "Descargando la version actual desde GitHub..."
    Invoke-WebRequest -Uri $repoZip -OutFile $zipFile -UseBasicParsing

    Expand-Archive -Path $zipFile -DestinationPath $extractDir -Force

    $downloadedRoot = Get-ChildItem -Path $extractDir -Directory | Select-Object -First 1

    if (-not $downloadedRoot) {
        throw "No se encontro la carpeta del proyecto descargado."
    }

    # Conservamos la instalacion local y reemplazamos los archivos del proyecto
    # por los de GitHub. No tocamos node_modules ni .env local.
    Get-ChildItem -Path $downloadedRoot.FullName -Force | ForEach-Object {
        if ($_.Name -notin @("node_modules", ".env")) {
            Copy-Item -Path $_.FullName -Destination $repo -Recurse -Force
        }
    }

    Write-Host "[OK] PokeIdleCompendium esta actualizado."
}
catch {
    Write-Host "[AVISO] No se pudo actualizar desde GitHub. Continuando con la version local."
    Write-Host ("       " + $_.Exception.Message)
}
finally {
    if (Test-Path $tempRoot) {
        Remove-Item -Path $tempRoot -Recurse -Force -ErrorAction SilentlyContinue
    }
}
