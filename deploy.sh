#!/bin/bash
# ==============================================================================
# ISP Billing Management System - cPanel Deployment Automation Script
# Compatible with: Putul Host / cPanel "Setup Node.js App" / Phusion Passenger
# ==============================================================================

set -e # Exit immediately if a command exits with a non-zero status

echo "=========================================="
echo " Starting ISP Billing Deployment..."
echo "=========================================="

# 1. Verify Node.js and npm
echo "--> Node version: $(node -v)"
echo "--> NPM version:  $(npm -v)"

# 2. Install production and build dependencies
echo "--> Installing dependencies (including devDependencies needed for build)..."
npm install

# 3. Generate Prisma Client
echo "--> Generating Prisma Client..."
npx prisma generate

# 4. Run Prisma production database migrations
echo "--> Applying database migrations to PostgreSQL..."
npx prisma migrate deploy

# 5. Build Next.js standalone application
echo "--> Building Next.js standalone application..."
npm run build

# 6. Signal Phusion Passenger to reload
echo "--> Triggering Phusion Passenger restart..."
mkdir -p tmp
touch tmp/restart.txt

echo "=========================================="
echo "✔ Deployment successfully finished!"
echo "  Your application has restarted."
echo "=========================================="

