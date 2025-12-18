#!/bin/sh
# Create files that Vite might try to access to prevent EIO errors
# Ensure package-lock.json exists (create empty if missing)
if [ ! -f /usr/src/app/package-lock.json ]; then
  echo '{}' > /usr/src/app/package-lock.json
fi

# Set memory-optimized Node.js flags
export NODE_OPTIONS="${NODE_OPTIONS:---max-old-space-size=1024}"

# Start Vite with memory optimizations and hot reload
exec node --max-old-space-size=1024 node_modules/vite/bin/vite.js --host 0.0.0.0
