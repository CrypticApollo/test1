#!/usr/bin/env sh
# Build an .ipk and (optionally) install + launch it on a TV set up with ares-setup-device.
#   ./tools/package.sh            -> builds dist/com.nova.os_1.0.0_all.ipk
#   ./tools/package.sh mytv       -> builds, installs on device "mytv" and launches
set -e
cd "$(dirname "$0")/.."

STAGE=dist/app
rm -rf dist && mkdir -p "$STAGE"
cp -r appinfo.json index.html css js assets "$STAGE"/

ares-package "$STAGE" -o dist
IPK=$(ls dist/*.ipk)
echo "Built $IPK"

if [ -n "$1" ]; then
  ares-install -d "$1" "$IPK"
  ares-launch -d "$1" com.nova.os
fi
