<#
.SYNOPSIS
    Links AGENTS.md and custom skills into the Claude Code configuration directory.

.DESCRIPTION
    Creates symbolic links for:
    - AGENTS.md → project root (used by Claude Code as project-level instructions)
    - .claude/skills/*.md → project skills directory

    This script allows you to manage skills and agents config from a central location
    and symlink them into any project that needs them.

.PARAMETER SourceDir
    Path to the directory containing the source AGENTS.md and skills/ folder.
    Defaults to the project root (where this script lives).

.PARAMETER TargetProject
    Path to the target project where links will be created.
    Defaults to the current project root.

.PARAMETER DryRun
    Show what would be linked without actually creating links.

.PARAMETER Force
    Overwrite existing files/links without prompting.

.EXAMPLE
    # Link within this project (default)
    .\scripts\link-claude-config.ps1

.EXAMPLE
    # Link to another project
    .\scripts\link-claude-config.ps1 -TargetProject "C:\repos\other-project"

.EXAMPLE
    # Preview what would happen
    .\scripts\link-claude-config.ps1 -DryRun

.EXAMPLE
    # Force overwrite existing files
    .\scripts\link-claude-config.ps1 -Force
#>

param(
    [string]$SourceDir = "",
    [string]$TargetProject = "",
    [switch]$DryRun,
    [switch]$Force
)

$ErrorActionPreference = "Stop"

# Resolve project root (script is in /scripts/)
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir

if ([string]::IsNullOrEmpty($SourceDir)) {
    $SourceDir = $ProjectRoot
}

if ([string]::IsNullOrEmpty($TargetProject)) {
    $TargetProject = $ProjectRoot
}

# Resolve to absolute paths
$SourceDir = Resolve-Path $SourceDir
$TargetProject = [System.IO.Path]::GetFullPath($TargetProject)

Write-Host "============================================" -ForegroundColor Cyan
Write-Host " Claude Code Config Linker" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Source:  $SourceDir" -ForegroundColor Gray
Write-Host "Target:  $TargetProject" -ForegroundColor Gray
if ($DryRun) {
    Write-Host "Mode:    DRY RUN (no changes will be made)" -ForegroundColor Yellow
}
Write-Host ""

# Track results
$linked = 0
$skipped = 0
$errors = 0

function New-SymlinkSafe {
    param(
        [string]$LinkPath,
        [string]$TargetPath,
        [switch]$IsDirectory
    )

    $linkName = Split-Path -Leaf $LinkPath
    $relSource = [System.IO.Path]::GetRelativePath($TargetProject, $TargetPath)

    # Check if source exists
    if (-not (Test-Path $TargetPath)) {
        Write-Host "  [SKIP] $linkName - source not found: $relSource" -ForegroundColor Yellow
        $script:skipped++
        return
    }

    # Check if link already exists
    if (Test-Path $LinkPath) {
        $item = Get-Item $LinkPath -Force
        if ($item.LinkType -eq "SymbolicLink") {
            $existingTarget = $item.Target
            if ($existingTarget -eq $TargetPath) {
                Write-Host "  [OK]   $linkName - already linked correctly" -ForegroundColor Green
                $script:skipped++
                return
            }
        }

        if ($Force) {
            if ($DryRun) {
                Write-Host "  [WOULD OVERWRITE] $linkName" -ForegroundColor Yellow
            } else {
                Remove-Item $LinkPath -Force -Recurse
                Write-Host "  [DEL]  Removed existing: $linkName" -ForegroundColor DarkYellow
            }
        } else {
            Write-Host "  [SKIP] $linkName - already exists (use -Force to overwrite)" -ForegroundColor Yellow
            $script:skipped++
            return
        }
    }

    if ($DryRun) {
        Write-Host "  [WOULD LINK] $linkName -> $relSource" -ForegroundColor Cyan
        $script:linked++
        return
    }

    try {
        if ($IsDirectory) {
            New-Item -ItemType SymbolicLink -Path $LinkPath -Target $TargetPath | Out-Null
        } else {
            New-Item -ItemType SymbolicLink -Path $LinkPath -Target $TargetPath | Out-Null
        }
        Write-Host "  [LINK] $linkName -> $relSource" -ForegroundColor Green
        $script:linked++
    } catch {
        Write-Host "  [ERR]  $linkName - $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "         Try running as Administrator for symlink permissions." -ForegroundColor DarkRed
        $script:errors++
    }
}

# --- 1. Link AGENTS.md ---
Write-Host "AGENTS.md" -ForegroundColor White
$agentsSource = Join-Path $SourceDir "AGENTS.md"
$agentsTarget = Join-Path $TargetProject "AGENTS.md"

if ($SourceDir -eq $TargetProject) {
    if (Test-Path $agentsSource) {
        Write-Host "  [OK]   AGENTS.md exists in project root" -ForegroundColor Green
    } else {
        Write-Host "  [MISS] AGENTS.md not found in project root" -ForegroundColor Yellow
    }
} else {
    New-SymlinkSafe -LinkPath $agentsTarget -TargetPath $agentsSource
}
Write-Host ""

# --- 2. Link skills ---
Write-Host "Skills (.claude/skills/)" -ForegroundColor White

$skillsSourceDir = Join-Path (Join-Path $SourceDir ".claude") "skills"
$skillsTargetDir = Join-Path (Join-Path $TargetProject ".claude") "skills"

if (-not (Test-Path $skillsSourceDir)) {
    Write-Host "  [SKIP] No skills directory found at: $skillsSourceDir" -ForegroundColor Yellow
} else {
    # Ensure target directory exists
    if (-not (Test-Path $skillsTargetDir)) {
        if ($DryRun) {
            Write-Host "  [WOULD CREATE] .claude/skills/ directory" -ForegroundColor Cyan
        } else {
            New-Item -ItemType Directory -Path $skillsTargetDir -Force | Out-Null
            Write-Host "  [DIR]  Created .claude/skills/" -ForegroundColor DarkGray
        }
    }

    # Link each skill file
    $skillFiles = Get-ChildItem -Path $skillsSourceDir -Filter "*.md" -File
    if ($skillFiles.Count -eq 0) {
        Write-Host "  [SKIP] No .md files found in skills directory" -ForegroundColor Yellow
    } else {
        foreach ($skill in $skillFiles) {
            $linkPath = Join-Path $skillsTargetDir $skill.Name

            if ($SourceDir -eq $TargetProject) {
                Write-Host "  [OK]   $($skill.Name) exists" -ForegroundColor Green
            } else {
                New-SymlinkSafe -LinkPath $linkPath -TargetPath $skill.FullName
            }
        }
    }
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host " Summary" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan

if ($SourceDir -eq $TargetProject) {
    # Just inventory mode
    $allSkills = Get-ChildItem -Path $skillsSourceDir -Filter "*.md" -File -ErrorAction SilentlyContinue
    Write-Host "  AGENTS.md:  $(if (Test-Path $agentsSource) { 'Present' } else { 'Missing' })" -ForegroundColor White
    Write-Host "  Skills:     $($allSkills.Count) files" -ForegroundColor White
    Write-Host ""
    Write-Host "Available skills:" -ForegroundColor Gray
    foreach ($s in $allSkills) {
        $frontMatter = Get-Content $s.FullName -TotalCount 10 | Where-Object { $_ -match "^name:" }
        $name = if ($frontMatter) { ($frontMatter -replace "^name:\s*", "").Trim("'", '"') } else { $s.BaseName }
        Write-Host "    /$name" -ForegroundColor White
    }
    Write-Host ""
    Write-Host "To link these to another project:" -ForegroundColor Gray
    Write-Host "  .\scripts\link-claude-config.ps1 -TargetProject `"C:\repos\other-project`"" -ForegroundColor DarkGray
} else {
    Write-Host "  Linked:   $linked" -ForegroundColor Green
    Write-Host "  Skipped:  $skipped" -ForegroundColor Yellow
    Write-Host "  Errors:   $errors" -ForegroundColor $(if ($errors -gt 0) { "Red" } else { "Gray" })

    if ($errors -gt 0) {
        Write-Host ""
        Write-Host "Some links failed. On Windows, creating symlinks requires:" -ForegroundColor Yellow
        Write-Host "  - Running PowerShell as Administrator, OR" -ForegroundColor Yellow
        Write-Host "  - Enabling Developer Mode (Settings > Update & Security > For Developers)" -ForegroundColor Yellow
    }
}

Write-Host ""
