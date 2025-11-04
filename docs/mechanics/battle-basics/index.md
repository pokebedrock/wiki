---
title: "Battle Basics"
description: "Core combat loop, stamina flow, and status effects in PokéBedrock battles."
tags:
  - combat
  - mechanics
  - guide
lastUpdated: "2025-11-04"
lang: en
---

Battles in PokéBedrock follow a hybrid turn-timer model. Trainers take turns selecting moves, but animations and damage resolve in real time.

| Phase | Duration | Notes |
| ----- | -------- | ----- |
| Selection | 6s | Choose move or item |
| Resolve | variable | Damage calculations and status updates |
| Cooldown | 3s | Movement locked, swap allowed |

:::info Formula reference
Damage is calculated using the `battle-calculations` partial:

```js
import { applyBattleModifiers } from "../../_partials/battle-calculations.ts";
```

:::

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque ut mi sit amet nibh commodo sagittis quis sed erat.
