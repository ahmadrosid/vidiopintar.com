#!/bin/sh
set -e

drizzle-kit migrate

exec node server.js
