<#
.SYNOPSIS
    Arranca ComunidadCat: Docker Desktop, Supabase y Electron app.

.DESCRIPTION
    Script de arranque automatico, disenado para ejecutarse como tarea
    programada al iniciar sesion. Tambien se puede ejecutar manualmente.

.PARAMETER InstallDir
    Directorio de instalacion de ComunidadCat. Default: C:\ComunidadCat

.PARAMETER SkipElectron
    Si se especifica, no lanza la app Electron (util para mantenimiento).
#>

param(
    [string]$InstallDir = "C:\ComunidadCat",
    [switch]$SkipElectron
)

$ErrorActionPreference = "Continue"

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
$logDir = "$InstallDir\logs"
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$logFile = "$logDir\startup-$timestamp.log"

if (!(Test-Path $logDir)) {
    New-Item -ItemType Directory -Path $logDir -Force | Out-Null
}

function Log {
    param([string]$Message, [string]$Level = "INFO")
    $ts = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $line = "[$ts] [$Level] $Message"
    Write-Host $line
    $line | Out-File -Append -FilePath $logFile -Encoding UTF8
}

Log "=== ComunidadCat Startup ==="
Log "InstallDir: $InstallDir"

# ---------------------------------------------------------------------------
# Limpiar logs viejos (>30 dias)
# ---------------------------------------------------------------------------
Log "Limpiando logs de startup viejos (>30 dias)..."
$cutoff = (Get-Date).AddDays(-30)
Get-ChildItem "$logDir\startup-*.log" -ErrorAction SilentlyContinue |
    Where-Object { $_.LastWriteTime -lt $cutoff } |
    ForEach-Object {
        Remove-Item $_.FullName -Force
        Log "Log eliminado: $($_.Name)"
    }

# ---------------------------------------------------------------------------
# Verificar Docker Desktop
# ---------------------------------------------------------------------------
Log "Verificando Docker Desktop..."

$dockerRunning = $false
try {
    $dockerInfo = docker info 2>&1
    if ($LASTEXITCODE -eq 0) {
        $dockerRunning = $true
        Log "Docker engine ya esta corriendo"
    }
} catch {
    # Docker not running
}

if (!$dockerRunning) {
    Log "Docker engine no responde. Iniciando Docker Desktop..."

    $dockerDesktopPath = "$env:ProgramFiles\Docker\Docker\Docker Desktop.exe"
    if (!(Test-Path $dockerDesktopPath)) {
        # Try common alternate paths
        $altPaths = @(
            "${env:ProgramFiles(x86)}\Docker\Docker\Docker Desktop.exe",
            "$env:LOCALAPPDATA\Docker\Docker Desktop.exe"
        )
        foreach ($alt in $altPaths) {
            if (Test-Path $alt) {
                $dockerDesktopPath = $alt
                break
            }
        }
    }

    if (Test-Path $dockerDesktopPath) {
        Start-Process $dockerDesktopPath
        Log "Docker Desktop iniciado, esperando engine..."
    } else {
        Log "No se encontro Docker Desktop.exe" "ERROR"
        exit 1
    }

    # Esperar hasta 120 segundos
    $maxWait = 120
    $waited = 0
    $interval = 5
    while ($waited -lt $maxWait) {
        Start-Sleep -Seconds $interval
        $waited += $interval

        try {
            $null = docker info 2>&1
            if ($LASTEXITCODE -eq 0) {
                $dockerRunning = $true
                Log "Docker engine respondio despues de ${waited}s"
                break
            }
        } catch {
            # Still waiting
        }

        if ($waited % 15 -eq 0) {
            Log "Esperando Docker engine... (${waited}s/${maxWait}s)"
        }
    }

    if (!$dockerRunning) {
        Log "Docker engine no respondio despues de ${maxWait}s" "ERROR"
        exit 1
    }
}

# ---------------------------------------------------------------------------
# Verificar si Supabase ya esta corriendo
# ---------------------------------------------------------------------------
Log "Verificando si Supabase ya esta corriendo..."

$supabaseRunning = $false
try {
    $response = Invoke-WebRequest -Uri "http://127.0.0.1:54321/rest/v1/" -Method Head -TimeoutSec 5 -UseBasicParsing -ErrorAction SilentlyContinue
    if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 500) {
        $supabaseRunning = $true
        Log "Supabase API ya esta respondiendo en :54321"
    }
} catch {
    # Not running
}

# ---------------------------------------------------------------------------
# Iniciar Supabase si no esta corriendo
# ---------------------------------------------------------------------------
if (!$supabaseRunning) {
    Log "Iniciando Supabase..."

    $supabaseDir = "$InstallDir\supabase"
    if (!(Test-Path "$supabaseDir\config.toml")) {
        Log "config.toml no encontrado en $supabaseDir" "ERROR"
        exit 1
    }

    Push-Location $InstallDir

    try {
        $startOutput = supabase start 2>&1
        $startExitCode = $LASTEXITCODE

        if ($startExitCode -ne 0) {
            Log "supabase start fallo (exit code: $startExitCode). Intentando recovery..." "WARN"
            Log "Output: $startOutput" "WARN"

            # Recovery: stop + start
            Log "Ejecutando supabase stop..."
            supabase stop 2>&1 | Out-Null
            Start-Sleep -Seconds 5

            Log "Reintentando supabase start..."
            $startOutput = supabase start 2>&1
            $startExitCode = $LASTEXITCODE

            if ($startExitCode -ne 0) {
                Log "supabase start fallo en segundo intento" "ERROR"
                Log "Output: $startOutput" "ERROR"
                Pop-Location
                exit 1
            }
        }

        Log "supabase start completado"
    } catch {
        Log "Error ejecutando supabase start: $_" "ERROR"
        Pop-Location
        exit 1
    }

    Pop-Location

    # Esperar health checks
    Log "Esperando health checks..."

    $services = @(
        @{ Name = "API Gateway"; Url = "http://127.0.0.1:54321/rest/v1/"; MaxWait = 60 },
        @{ Name = "Database"; Host = "127.0.0.1"; Port = 54322; MaxWait = 30 }
    )

    foreach ($svc in $services) {
        if ($svc.Url) {
            $waited = 0
            $interval = 3
            $healthy = $false
            while ($waited -lt $svc.MaxWait) {
                try {
                    $r = Invoke-WebRequest -Uri $svc.Url -Method Head -TimeoutSec 3 -UseBasicParsing -ErrorAction SilentlyContinue
                    if ($r.StatusCode -ge 200 -and $r.StatusCode -lt 500) {
                        $healthy = $true
                        break
                    }
                } catch { }
                Start-Sleep -Seconds $interval
                $waited += $interval
            }
            if ($healthy) {
                Log "$($svc.Name) esta saludable"
            } else {
                Log "$($svc.Name) no respondio en $($svc.MaxWait)s" "WARN"
            }
        } elseif ($svc.Port) {
            $waited = 0
            $interval = 3
            $healthy = $false
            while ($waited -lt $svc.MaxWait) {
                try {
                    $tcp = New-Object System.Net.Sockets.TcpClient
                    $tcp.Connect($svc.Host, $svc.Port)
                    $tcp.Close()
                    $healthy = $true
                    break
                } catch { }
                Start-Sleep -Seconds $interval
                $waited += $interval
            }
            if ($healthy) {
                Log "$($svc.Name) esta saludable (port $($svc.Port))"
            } else {
                Log "$($svc.Name) no respondio en $($svc.MaxWait)s" "WARN"
            }
        }
    }
}

# ---------------------------------------------------------------------------
# Lanzar Electron app
# ---------------------------------------------------------------------------
if (!$SkipElectron) {
    Log "Buscando ComunidadCat.exe..."

    # Search in common NSIS install locations
    $electronPaths = @(
        "$env:LOCALAPPDATA\ComunidadCat\ComunidadCat.exe",
        "$env:ProgramFiles\ComunidadCat\ComunidadCat.exe",
        "${env:ProgramFiles(x86)}\ComunidadCat\ComunidadCat.exe",
        "$InstallDir\app\ComunidadCat.exe"
    )

    $electronExe = $null
    foreach ($path in $electronPaths) {
        if (Test-Path $path) {
            $electronExe = $path
            break
        }
    }

    if ($electronExe) {
        # Check if already running
        $existing = Get-Process -Name "ComunidadCat" -ErrorAction SilentlyContinue
        if ($existing) {
            Log "ComunidadCat.exe ya esta corriendo (PID: $($existing.Id))"
        } else {
            Log "Lanzando ComunidadCat.exe desde: $electronExe"
            Start-Process $electronExe
            Log "ComunidadCat.exe lanzado"
        }
    } else {
        Log "ComunidadCat.exe no encontrado en las rutas esperadas" "WARN"
        Log "Rutas buscadas: $($electronPaths -join ', ')" "WARN"
    }
} else {
    Log "SkipElectron flag activo, no se lanza la app"
}

# ---------------------------------------------------------------------------
# Resultado
# ---------------------------------------------------------------------------
Log "=== Startup completado ==="
