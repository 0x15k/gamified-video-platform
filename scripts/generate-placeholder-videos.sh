#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

OUT_DIR="${VIDEO_STORAGE_PATH:-./storage/videos}"
mkdir -p "$OUT_DIR"

if ! command -v ffmpeg >/dev/null 2>&1; then
  echo "ffmpeg not found. Install with: brew install ffmpeg"
  exit 1
fi

NAMES=(intro path-a path-b ending-a premium-path)
for name in "${NAMES[@]}"; do
  ffmpeg -y -f lavfi -i "color=c=0x1e293b:s=1280x720:d=8" -f lavfi -i "sine=frequency=440:duration=8" \
    -shortest -c:v libx264 -pix_fmt yuv420p -c:a aac -movflags +faststart \
    "$OUT_DIR/${name}.mp4" 2>/dev/null
  echo "Created $OUT_DIR/${name}.mp4"
done
