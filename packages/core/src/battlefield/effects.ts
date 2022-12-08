import { find, groupBy, map, sum, sumBy } from "lodash-es";

import { ArmorEffect, DmgEffect, Effect, EffectType, HealEffect, Unit, UnitState } from "../interface";
import { Context } from "./context";

export class EffectsContext {
  constructor(private context: Context) {}

  applyEffect(effects: Effect[], targetUnit: Unit) {
    const dmgEffects = effects.filter(x => x.type === EffectType.Dmg) as DmgEffect[];
    if (dmgEffects.length) {
      this.dmg(targetUnit, dmgEffects);
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

  private dmg(targetUnit: Unit, dmgEffects: DmgEffect[]) {
    const armors = targetUnit.effects.filter(x => x.type === EffectType.Armor) as ArmorEffect[];

    const effectsByDmgType = groupBy(dmgEffects, x => x.dmgType);

    const totalDmgs = map(effectsByDmgType, (effects, dmgType) => {
      const dmgArmors = armors.filter(x => x.dmgType === dmgType);
      const totalArmor = sumBy(dmgArmors, "power");
      const totalDmg = sumBy(effects, "power");

      return Math.max(0, totalDmg - totalArmor);
    });

    const totalDmg = sum(totalDmgs);

    if (totalDmg) {
      targetUnit.hp = Math.max(0, targetUnit.hp - totalDmg);
    }
  }

  private spawnUnit(source: Unit) {
    const unitId = (() => {
      const random = Math.random();

      if (random < 0.1) return "necromancer";
      if (random < 0.2) return "priest";
      if (random < 0.3) return "steam_dragon";
      if (random < 0.5) return "archer";

      return "skeleton";
    })();

    const swapwnedUnit = this.context.resourceManager.getUnitConfig(unitId);
    const skeletonState: UnitState = {
      location: { x: source.location.x + source.size / 2, y: source.location.y + source.size + 20 },
      actionState: {},
      hp: swapwnedUnit.maxHp,
      team: source.team,
      effects: swapwnedUnit.effects || [],
    };

    this.context.unit.addUnit({ ...swapwnedUnit, ...skeletonState });
  }
}
