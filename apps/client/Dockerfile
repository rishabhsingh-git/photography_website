FROM node:20-alpine

WORKDIR /usr/src/app

# Copy manifests first for better cache
COPY package*.json ./

# Install dependencies with memory optimizations
# Note: Optional dependencies are needed for Rollup's native bindings (especially for Alpine/musl)
# Remove package-lock.json and node_modules to work around npm bug with optional dependencies
RUN rm -rf package-lock.json node_modules 2>/dev/null || true
RUN npm install --no-audit --progress=false
# Explicitly install rollup native dependency for Alpine Linux (musl) to work around npm bug
RUN npm install @rollup/rollup-linux-x64-musl --save-optional --no-audit || true

# Copy source
COPY . .

EXPOSE 5173

# Make startup script executable
RUN chmod +x start-dev.sh || true

# Use startup script that handles package-lock.json and memory optimization
CMD ["./start-dev.sh"]
