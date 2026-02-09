#!/bin/bash
# scripts/build-production-apks.sh

set -e

echo "🏗️  Building Production APKs for all flavors..."

# 1. Sync Capacitor
echo "🔄 Syncing Capacitor..."
pnpm --filter @sous/web run build
npx cap sync android

# 2. Build Flavors
cd apps/web/android

echo "📦 Building Signage (Production)..."
./gradlew assembleSignageRelease

echo "📦 Building KDS (Production)..."
./gradlew assembleKdsRelease

echo "📦 Building POS (Production)..."
./gradlew assemblePosRelease

echo "📦 Building Tools (Production)..."
./gradlew assembleToolsRelease

echo "✅ Build Complete!"
echo "Signage APK: apps/web/android/app/build/outputs/apk/signage/release/app-signage-release.apk"
echo "KDS APK:     apps/web/android/app/build/outputs/apk/kds/release/app-kds-release.apk"
echo "POS APK:     apps/web/android/app/build/outputs/apk/pos/release/app-pos-release.apk"
echo "Tools APK:   apps/web/android/app/build/outputs/apk/tools/release/app-tools-release.apk"
