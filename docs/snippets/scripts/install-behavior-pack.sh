#!/usr/bin/env bash
set -euo pipefail

if [[ $# -ne 2 ]]; then
  echo "Usage: $0 <WORLD_PATH> <ZIP_PATH>" >&2
  exit 1
fi

WORLD_PATH="$1"
ZIP_PATH="$2"

if [[ ! -d "$WORLD_PATH" ]]; then
  echo "World path '$WORLD_PATH' does not exist" >&2
  exit 2
fi

if [[ ! -f "$ZIP_PATH" ]]; then
  echo "ZIP file '$ZIP_PATH' does not exist" >&2
  exit 3
fi

mkdir -p "$WORLD_PATH/behavior_packs"
unzip -o "$ZIP_PATH" -d "$WORLD_PATH/behavior_packs"

echo "PokéBedrock behavior packs installed to $WORLD_PATH"
