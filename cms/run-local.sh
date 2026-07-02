#!/usr/bin/env bash
set -e
export PATH="$HOME/.nvm/versions/node/v18.20.8/bin:$PATH"
cd "$(dirname "$0")"
npm run build
exec npm start
