#!/bin/sh
set -e

# Start Vite with error handling
exec npm run dev 2>&1 | grep -v "EIO" || true

