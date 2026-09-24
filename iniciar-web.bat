@echo off
setlocal
title PokeIdle Wiki - Servidor local
cd /d "%~dp0"

echo ============================================
echo   PokeIdle Wiki - arrancando la web
echo ============================================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo [ERROR] No tienes Node.js instalado.
  echo Descargalo desde https://nodejs.org ^(version 20.19 o superior^) e intentalo de nuevo.
  echo.
  pause
  exit /b 1
)

if not exist "package.json" (
  echo [ERROR] No encuentro package.json en esta carpeta.
  echo Copia este archivo .bat dentro de la carpeta del proyecto ^(donde esta package.json^).
  echo.
  pause
  exit /b 1
)

if not exist "node_modules" (
  echo Instalando dependencias ^(solo la primera vez, puede tardar unos minutos^)...
  call npm install --legacy-peer-deps
  if errorlevel 1 (
    echo.
    echo [ERROR] Fallo npm install. Revisa el mensaje de arriba.
    pause
    exit /b 1
  )
)

echo.
echo Iniciando servidor en http://localhost:3000
echo Deja esta ventana abierta mientras uses la web. Cierra con Ctrl+C.
echo.

start "" /b cmd /c "timeout /t 4 /nobreak >nul & start http://localhost:3000"
call npm run dev

echo.
pause