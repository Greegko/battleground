import { find } from "lodash-es";

import { ArmorEffect, DmgEffect, Effect, EffectType, HealEffect, Unit, UnitState } from "../interface";
import { Context } from "./context";

export class EffectsContext {
  constructor(private context: Context) {}

  applyEffect(effects: Effect[], targetUnit: Unit) {
    const dmgEffect = find(effects, { type: EffectType.Dmg }) as DmgEffect;
    if (dmgEffect) {
      this.dmg(targetUnit, dmgEffect);
    }

    if (find(effects, { type: EffectType.Review })) {
      targetUnit.hp = targetUnit.maxHp;
    }

    if (find(effects, { type: EffectType.SpawnUnit })) {
      this.spawnUnit(targetUnit);
    }

    const healEffect = find(effects, { type: EffectType.Heal }) as HealEffect;
    if (healEffect) {
      targetUnit.hp = Math.min(targetUnit.hp + healEffect.power, targetUnit.maxHp);
    }
  }

  private dmg(targetUnit: Unit, dmgEffect: DmgEffect) {
    const armor = find(targetUnit.effects, { type: EffectType.Armor }) as ArmorEffect;

    const dmg =
      armor && armor.dmgType === dmgEffect.dmgType ? Math.max(0, dmgEffect.power - armor.power) : dmgEffect.power;

    if (dmg) {
      targetUnit.hp = Math.max(0, targetUnit.hp - dmg);
    }
  }

  private spawnUnit(source: Unit) {
    const unitId = (() => {
      const random = Math.random();

      if (random < 0.1) return "necromancer";
      if (random < 0.2) return "priest";
      if (random < 0.5) return "archer";
      return "skeleton";
    })();

    const swapwnedUnit = this.context.resourceManager.getUnitConfig(unitId);
    const skeletonState: UnitState = {
      location: { x: source.location.x + source.size / 2, y: source.location.y + source.size + 20 },
      actionState: {},
      hp: swapwnedUnit.maxHp,
      team: source.team,
      effects: swapwnedUnit.effects,
    };

    this.context.unit.addUnit({ ...swapwnedUnit, ...skeletonState });
  }
}
