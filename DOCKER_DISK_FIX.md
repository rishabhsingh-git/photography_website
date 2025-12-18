# Docker Disk Space Fix Guide

## Problem
Your C: drive was 92.5% full, causing I/O errors with Vite trying to read `package-lock.json`. Docker was using ~32GB of space on C: drive.

## ✅ Immediate Fix Applied
- Cleaned up Docker: **Freed 22.59GB** of space
  - Removed unused volumes (22.37GB)
  - Removed unused images (5.65GB)
  - Removed build cache (1.5GB)

## 🔧 Permanent Solution: Move Docker to D: Drive

### Option 1: Move Docker Desktop Data (Recommended)

1. **Stop Docker Desktop completely**

2. **Move Docker data directory:**
   ```powershell
   # Create new directory on D: drive
   New-Item -ItemType Directory -Path "D:\DockerData" -Force
   
   # Copy existing data (if any)
   # Default location: C:\Users\<YourUser>\AppData\Local\Docker
   # Or: C:\ProgramData\Docker
   ```

3. **Update Docker Desktop Settings:**
   - Open Docker Desktop
   - Go to Settings → Resources → Advanced
   - Change "Disk image location" to `D:\DockerData`
   - Click "Apply & Restart"

### Option 2: Use WSL2 Backend (Better Performance)

1. **Enable WSL2:**
   - Docker Desktop → Settings → General
   - Enable "Use WSL 2 based engine"
   - Apply & Restart

2. **Move WSL2 to D: drive:**
   ```powershell
   # Export WSL2 distribution
   wsl --export docker-desktop D:\DockerData\docker-desktop.tar
   
   # Unregister old location
   wsl --unregister docker-desktop
   
   # Import to new location
   wsl --import docker-desktop D:\DockerData\docker-desktop D:\DockerData\docker-desktop.tar --version 2
   
   # Clean up
   Remove-Item D:\DockerData\docker-desktop.tar
   ```

### Option 3: Use Docker Context with Custom Root

Create a custom Docker root directory on D: drive:
```powershell
# Set environment variable
[System.Environment]::SetEnvironmentVariable("DOCKER_ROOT", "D:\DockerData", "Machine")
```

## 📊 Monitor Disk Usage

Check Docker disk usage:
```bash
docker system df
```

Clean up regularly:
```bash
# Remove unused data
docker system prune -a --volumes

# Remove only stopped containers
docker container prune

# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune
```

## 🎯 Prevent Future Issues

1. **Set up automatic cleanup** (add to your workflow):
   ```bash
   # Weekly cleanup script
   docker system prune -a --volumes --force
   ```

2. **Monitor C: drive space** - Keep it below 85% full

3. **Use D: drive for:**
   - Docker data
   - Project files (already on D:\cine_stories ✅)
   - Node modules (consider using D: for global packages)

## Current Status
- ✅ Freed 22.59GB from Docker
- ✅ C: drive now has ~15.6GB free
- ⚠️ Still recommend moving Docker to D: drive for long-term stability

