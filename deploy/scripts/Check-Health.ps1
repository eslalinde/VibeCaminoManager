<#
.SYNOPSIS
    Verifica el estado de salud de ComunidadCat.

.DESCRIPTION
    Verifica Docker, contenedores, API, espacio en disco, disco WSL2,
    y edad del ultimo backup. Genera reporte en logs.

.PARAMETER InstallDir
    Directorio de instalacion. Default: C:\ComunidadCat

.PARAMETER DiskThresholdGB
    Alerta si el espacio libre es menor a este valor. Default: 5

.PARAMETER WslDiskThresholdGB
    Alerta si el disco virtual WSL2 supera este valor. Default: 20

.PARAMETER BackupMaxAgeHours
    Alerta si el ultimo backup tiene mas de estas horas. Default: 36
#>

param(
    [string]$InstallDir = "C:\ComunidadCat",
    [int]$DiskThresholdGB = 5,
    [int]$WslDiskThresholdGB = 20,
    [int]$BackupMaxAgeHours = 36
)

$ErrorActionPreference = "Continue"

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
$logDir = "$InstallDir\logs"
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$logFile = "$logDir\health-$timestamp.log"

if (!(Test-Path $logDir)) {
    New-Item -ItemType Directory -Path $logDir -Force | Out-Null
}

$issues = @()

function Log {
    param([string]$Message, [string]$Level = "INFO")
    $ts = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $line = "[$ts] [$Level] $Message"
    Write-Host $line
    $line | Out-File -Append -FilePath $logFile -Encoding UTF8
}

function Check-OK {
    param([string]$Check)
    Log "[PASS] $Check"
}

function Check-WARN {
    param([string]$Check, [string]$Detail)
    Log "[WARN] $Check - $Detail" "WARN"
    $script:issues += "$Check`: $Detail"
}

function Check-FAIL {
    param([string]$Check, [string]$Detail)
    Log "[FAIL] $Check - $Detail" "ERROR"
    $script:issues += "$Check`: $Detail"
}

Log "=== ComunidadCat Health Check ==="

# ---------------------------------------------------------------------------
# 1. Docker engine
# ---------------------------------------------------------------------------
Log "Verificando Docker engine..."

try {
    $null = docker info 2>&1
    if ($LASTEXITCODE -eq 0) {
        Check-OK "Docker engine corriendo"
    } else {
        Check-FAIL "Docker engine" "No responde (exit code: $LASTEXITCODE)"
    }
} catch {
    Check-FAIL "Docker engine" "No disponible: $_"
}

# ---------------------------------------------------------------------------
# 2. Contenedores criticos
# ---------------------------------------------------------------------------
Log "Verificando contenedores criticos..."

$criticalContainers = @(
    @{ Pattern = "supabase_db"; Name = "Database (PostgreSQL)" },
    @{ Pattern = "supabase_kong"; Name = "API Gateway (Kong)" },
    @{ Pattern = "supabase_auth"; Name = "Auth (GoTrue)" },
    @{ Pattern = "supabase_rest"; Name = "REST (PostgREST)" },
    @{ Pattern = "supabase_meta"; Name = "Meta (pg_meta)" }
)

foreach ($container in $criticalContainers) {
    $running = docker ps --filter "name=$($container.Pattern)" --format "{{.Status}}" 2>&1
    if ($running -and $running -match "Up") {
        Check-OK "$($container.Name) corriendo ($running)"
    } else {
        Check-FAIL "$($container.Name)" "No esta corriendo"
    }
}

# ---------------------------------------------------------------------------
# 3. API respondiendo
# ---------------------------------------------------------------------------
Log "Verificando API..."

try {
    $response = Invoke-WebRequest -Uri "http://127.0.0.1:54321/rest/v1/" -Method Head -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
    Check-OK "API respondiendo en :54321 (HTTP $($response.StatusCode))"
} catch {
    Check-FAIL "API" "No responde en :54321"
}

# ---------------------------------------------------------------------------
# 4. Espacio en disco
# ---------------------------------------------------------------------------
Log "Verificando espacio en disco..."

$installDrive = (Split-Path $InstallDir -Qualifier)
if ($installDrive) {
    $drive = Get-PSDrive -Name $installDrive.TrimEnd(':') -ErrorAction SilentlyContinue
    if ($drive) {
        $freeGB = [math]::Round($drive.Free / 1GB, 1)
        if ($freeGB -lt $DiskThresholdGB) {
            Check-WARN "Espacio en disco" "Solo $freeGB GB libres en $installDrive (umbral: $DiskThresholdGB GB)"
        } else {
            Check-OK "Espacio en disco: $freeGB GB libres en $installDrive"
        }
    }
}

# ---------------------------------------------------------------------------
# 5. Tamano del disco virtual WSL2
# ---------------------------------------------------------------------------
Log "Verificando disco virtual WSL2..."

$wslDiskPaths = @(
    "$env:LOCALAPPDATA\Docker\wsl\disk\docker_data.vhdx",
    "$env:LOCALAPPDATA\Docker\wsl\data\ext4.vhdx"
)

foreach ($vhdxPath in $wslDiskPaths) {
    if (Test-Path $vhdxPath) {
        $vhdxSizeGB = [math]::Round((Get-Item $vhdxPath).Length / 1GB, 1)
        if ($vhdxSizeGB -gt $WslDiskThresholdGB) {
            Check-WARN "Disco WSL2" "$vhdxPath tiene $vhdxSizeGB GB (umbral: $WslDiskThresholdGB GB). Considere compactar con Optimize-VHD."
        } else {
            Check-OK "Disco WSL2: $vhdxSizeGB GB ($vhdxPath)"
        }
        break
    }
}

# ---------------------------------------------------------------------------
# 6. Edad del ultimo backup
# ---------------------------------------------------------------------------
Log "Verificando ultimo backup..."

$backupDir = "$InstallDir\backups"
$latestBackup = Get-ChildItem "$backupDir\comunidadcat-*.sql*" -ErrorAction SilentlyContinue |
    Sort-Object LastWriteTime -Descending |
    Select-Object -First 1

if ($latestBackup) {
    $ageHours = [math]::Round(((Get-Date) - $latestBackup.LastWriteTime).TotalHours, 1)
    if ($ageHours -gt $BackupMaxAgeHours) {
        Check-WARN "Backup" "Ultimo backup tiene $ageHours horas ($($latestBackup.Name)). Umbral: $BackupMaxAgeHours horas."
    } else {
        Check-OK "Ultimo backup: $($latestBackup.Name) (hace $ageHours horas)"
    }
} else {
    Check-WARN "Backup" "No se encontraron backups en $backupDir"
}

# ---------------------------------------------------------------------------
# 7. Limpiar logs de health viejos (>7 dias)
# ---------------------------------------------------------------------------
$logCutoff = (Get-Date).AddDays(-7)
Get-ChildItem "$logDir\health-*.log" -ErrorAction SilentlyContinue |
    Where-Object { $_.LastWriteTime -lt $logCutoff } |
    ForEach-Object {
        Remove-Item $_.FullName -Force
    }

# ---------------------------------------------------------------------------
# Resumen
# ---------------------------------------------------------------------------
Log ""
if ($issues.Count -eq 0) {
    Log "=== Todos los checks pasaron ==="
} else {
    Log "=== $($issues.Count) problema(s) encontrado(s) ===" "WARN"
    foreach ($issue in $issues) {
        Log "  - $issue" "WARN"
    }
}
