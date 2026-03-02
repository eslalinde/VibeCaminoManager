<#
.SYNOPSIS
    Apaga ComunidadCat de forma ordenada.

.DESCRIPTION
    Para uso manual (mantenimiento). Cierra Electron, detiene Supabase,
    y opcionalmente detiene Docker Desktop.

.PARAMETER StopDocker
    Si se especifica, tambien detiene Docker Desktop.

.PARAMETER InstallDir
    Directorio de instalacion. Default: C:\ComunidadCat
#>

param(
    [string]$InstallDir = "C:\ComunidadCat",
    [switch]$StopDocker
)

$ErrorActionPreference = "Continue"

function Write-Step {
    param([string]$Message)
    Write-Host "`n===> $Message" -ForegroundColor Cyan
}

# ---------------------------------------------------------------------------
# 1. Cerrar Electron app
# ---------------------------------------------------------------------------
Write-Step "Cerrando ComunidadCat..."

$processes = Get-Process -Name "ComunidadCat" -ErrorAction SilentlyContinue
if ($processes) {
    foreach ($proc in $processes) {
        try {
            # Intento graceful: enviar WM_CLOSE
            $proc.CloseMainWindow() | Out-Null
            Write-Host "  Enviado CloseMainWindow a PID $($proc.Id)"
        } catch {
            Write-Host "  No se pudo enviar CloseMainWindow a PID $($proc.Id)" -ForegroundColor Yellow
        }
    }

    # Esperar hasta 15 segundos
    $waited = 0
    while ($waited -lt 15) {
        Start-Sleep -Seconds 1
        $waited++
        $remaining = Get-Process -Name "ComunidadCat" -ErrorAction SilentlyContinue
        if (!$remaining) { break }
    }

    $remaining = Get-Process -Name "ComunidadCat" -ErrorAction SilentlyContinue
    if ($remaining) {
        Write-Host "  Forzando cierre de procesos restantes..." -ForegroundColor Yellow
        $remaining | Stop-Process -Force
    }

    Write-Host "  [OK] ComunidadCat cerrado" -ForegroundColor Green
} else {
    Write-Host "  ComunidadCat no estaba corriendo"
}

# ---------------------------------------------------------------------------
# 2. Detener Supabase
# ---------------------------------------------------------------------------
Write-Step "Deteniendo Supabase..."

Push-Location $InstallDir

try {
    $output = supabase stop 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  [OK] Supabase detenido" -ForegroundColor Green
    } else {
        Write-Host "  [WARN] supabase stop retorno codigo $LASTEXITCODE" -ForegroundColor Yellow
        Write-Host "  $output" -ForegroundColor Yellow
    }
} catch {
    Write-Host "  [WARN] Error ejecutando supabase stop: $_" -ForegroundColor Yellow
}

Pop-Location

# ---------------------------------------------------------------------------
# 3. Detener Docker Desktop (opcional)
# ---------------------------------------------------------------------------
if ($StopDocker) {
    Write-Step "Deteniendo Docker Desktop..."

    $dockerProcess = Get-Process -Name "Docker Desktop" -ErrorAction SilentlyContinue
    if ($dockerProcess) {
        $dockerProcess.CloseMainWindow() | Out-Null
        Start-Sleep -Seconds 5

        $remaining = Get-Process -Name "Docker Desktop" -ErrorAction SilentlyContinue
        if ($remaining) {
            $remaining | Stop-Process -Force
        }

        Write-Host "  [OK] Docker Desktop detenido" -ForegroundColor Green
    } else {
        Write-Host "  Docker Desktop no estaba corriendo"
    }
} else {
    Write-Host "`nDocker Desktop sigue corriendo. Use -StopDocker para detenerlo." -ForegroundColor Gray
}

Write-Host "`n[OK] Apagado completado." -ForegroundColor Green
