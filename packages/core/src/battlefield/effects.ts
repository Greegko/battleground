import { find } from "lodash-es";

import { Effect, Unit, UnitState } from "../interface";
import { Context } from "./context";

export class EffectsContext {
  constructor(private context: Context) {}

  applyEffect(effects: Effect[], targetUnit: Unit) {
    const dmgEffect = find(effects, { type: "dmg" });
    if (dmgEffect) {
      this.dmg(targetUnit, dmgEffect.args);
    }

    if (find(effects, { type: "revive" })) {
      targetUnit.hp = targetUnit.maxHp;
    }

    if (find(effects, { type: "spawn-unit" })) {
      this.spawnUnit(targetUnit);
    }

    const healEffect = find(effects, { type: "heal" });
    if (healEffect) {
      targetUnit.hp = Math.min(targetUnit.hp + healEffect.args, targetUnit.maxHp);
    }
  }

  private dmg(unit: Unit, dmg: number) {
    unit.hp = Math.max(0, unit.hp - dmg);
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
    };

    this.context.unit.addUnit({ ...swapwnedUnit, ...skeletonState });
  }
}
