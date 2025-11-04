---
title: "Install PokéBedrock"
description: "Prepare your Bedrock world and deploy the PokéBedrock behavior packs."
tags:
  - setup
  - installation
  - server
lastUpdated: "2025-11-04"
lang: en
---

To install PokéBedrock, download the latest release assets and copy them into your Bedrock worlds directory.

```bash
# docs/snippets/scripts/install-behavior-pack.sh
#!/usr/bin/env bash
set -euo pipefail

WORLD_PATH="$1"
ZIP_PATH="$2"

unzip -o "$ZIP_PATH" -d "$WORLD_PATH/behavior_packs"
echo "PokéBedrock behavior packs installed to $WORLD_PATH"
```

1. Locate your world folder under `%LOCALAPPDATA%/Packages/Microsoft.MinecraftUWP`.
2. Create a backup of the existing `behavior_packs` directory.
3. Run the installation script above, passing the world path and downloaded archive.

:::warning Backup required
Modifying default packs without backups may corrupt your world. Always keep a copy of the original directory before installing new components.
:::

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse euismod, lorem vitae pharetra volutpat, mauris dui vulputate elit, sed volutpat neque neque sed nisl.
