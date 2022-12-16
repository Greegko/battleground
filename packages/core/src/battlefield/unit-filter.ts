import { SeekCondition, Unit } from "../interface";
import { getUnitCentral } from "../utils/unit";
import { Vector, getVectorDistance } from "../utils/vector";

export interface SeekConditionContext {
  unit?: Unit;
  team?: number;
  targetLocation?: Vector;
}

type ConditionMap<Item extends SeekCondition> = Item extends string
  ? { [key in Item]: (context: SeekConditionContext) => boolean }
  : { [key in Item[0]]: (context: SeekConditionContext, config: Item[1]) => boolean };

export class UnitFilter {
  static conditions: ConditionMap<SeekCondition> = {
    "enemy-team": ({ unit, team }) => unit.team !== team,
    "same-team": ({ unit, team }) => unit.team === team,
    "in-distance": ({ unit, targetLocation }, { distance }) =>
      getVectorDistance(getUnitCentral(unit), targetLocation) <= unit.size / 2 + distance,
    alive: ({ unit }) => unit.hp > 0,
    dead: ({ unit }) => unit.hp === 0,
    damaged: ({ unit }) => unit.hp < unit.maxHp,
  };

  static filterBySeekConditions(units: Unit[], conditions: SeekCondition[], context: SeekConditionContext) {
    return conditions.reduce((remainingUnits, condition) => {
      const conditionFn =
        typeof condition === "string" ? (this.conditions as any)[condition] : (this.conditions as any)[condition[0]];
      return remainingUnits.filter(unit => conditionFn({ unit, ...context }, condition[1]));
    }, units);
  }
}
