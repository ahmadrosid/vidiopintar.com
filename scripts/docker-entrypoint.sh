#!/bin/sh
set -e

node /app/scripts/migrate-sqlite.mjs

exec node server.js
