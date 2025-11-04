---
title: "Mob Spawning"
description: "Rules governing wild Pokémon spawning, biome weighting, and event hooks."
tags:
  - spawning
  - mechanics
  - systems
lastUpdated: "2025-11-04"
lang: en
---

PokéBedrock tracks spawn weights via a biome registry. Each entry defines biome IDs, time of day, and rarity tiers.

```json
{
  "biome": "minecraft:plains",
  "time": ["day"],
  "rarity": "uncommon",
  "species": ["pidgey", "rattata", "spearow"]
}
```

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer ac consectetur mi. Nullam ac ligula in libero cursus elementum.
