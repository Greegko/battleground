import { find, merge, propEq } from "ramda";

import { DmgEffect, DotEffect, Effect, EffectType, HealEffect, Unit, UnitState } from "../interface";
import { Context } from "./context";

export class EffectsContext {
  constructor(private context: Context) {}

  applyEffect(effects: Effect[], targetUnit: Unit) {
    const dmgEffects = effects.filter(x => x.type === EffectType.Dmg) as DmgEffect[];
    if (dmgEffects.length) {
      this.context.unit.dmg(targetUnit, dmgEffects);
    }

    if (find(propEq("type", EffectType.Review), effects)) {
      targetUnit.hp = targetUnit.maxHp;
    }

    if (find(propEq("type", EffectType.SpawnUnit), effects)) {
      this.spawnUnit(targetUnit);
    }

    const dotEffects = effects.filter(x => x.type === EffectType.Dot) as DotEffect[];
    targetUnit.effects.push(
      ...dotEffects.map(x => ({ ...x, state: { intervalState: x.interval, remainingPeriod: x.period } } as DotEffect)),
    );

    const healEffect = find(propEq("type", EffectType.Heal), effects) as HealEffect;
    if (healEffect) {
      targetUnit.hp = Math.min(targetUnit.hp + healEffect.power, targetUnit.maxHp);
    }
  }

  private spawnUnit(source: Unit) {
    const unitId = (() => {
      const random = Math.random();

      if (random < 0.2) return "priest";
      if (random < 0.3) return "steam_dragon";
      if (random < 0.5) return "archer";

      return "skeleton";
    })();

    const spawnedUnit = this.context.resourceManager.getUnitConfig(unitId);
    const skeletonState: UnitState = {
      location: { x: source.location.x + source.size / 2, y: source.location.y + source.size + 20 },
      hp: spawnedUnit.maxHp,
      team: source.team,
      effects: spawnedUnit.effects || [],
    };

    const unit = merge(spawnedUnit, skeletonState);

    this.context.unit.addUnit(unit);
  }
}
