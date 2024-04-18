#!/bin/bash
APP_DIR="/var/www/defacto/server"

# Navigate to the app directory
cd "$APP_DIR"

pm2 bun .app.ts --name defacto-app