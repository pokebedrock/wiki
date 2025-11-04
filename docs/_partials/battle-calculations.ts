export interface BattleContext {
  baseDamage: number;
  attackStat: number;
  defenseStat: number;
  modifiers?: Array<{ label: string; value: number }>;
}

export function applyBattleModifiers(ctx: BattleContext): number {
  const raw = (ctx.baseDamage * ctx.attackStat) / Math.max(1, ctx.defenseStat);
  return (ctx.modifiers ?? []).reduce((value, modifier) => value * modifier.value, raw);
}
