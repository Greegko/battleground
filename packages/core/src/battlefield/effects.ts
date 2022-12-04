import { find } from "lodash-es";

import { ArmorEffect, DmgEffect, DmgEffectArgs, Effect, EffectType, HealEffect, Unit, UnitState } from "../interface";
import { Context } from "./context";

export class EffectsContext {
  constructor(private context: Context) {}

  applyEffect(effects: Effect[], targetUnit: Unit) {
    const dmgEffect = find(effects, { type: EffectType.Dmg }) as DmgEffect;
    if (dmgEffect) {
      this.dmg(targetUnit, dmgEffect.args);
    }

    if (find(effects, { type: "revive" })) {
      targetUnit.hp = targetUnit.maxHp;
    }

    if (find(effects, { type: "spawn-unit" })) {
      this.spawnUnit(targetUnit);
    }

    const healEffect = find(effects, { type: "heal" }) as HealEffect;
    if (healEffect) {
      targetUnit.hp = Math.min(targetUnit.hp + healEffect.args.power, targetUnit.maxHp);
    }
  }

  private dmg(targetUnit: Unit, args: DmgEffectArgs) {
    const armor = find(targetUnit.effects, { type: "armor" }) as ArmorEffect;

    const dmg = armor.args.type === args.type ? Math.max(0, args.power - armor.args.power) : args.power;

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
      effects: [],
    };

    this.context.unit.addUnit({ ...swapwnedUnit, ...skeletonState });
  }
}
