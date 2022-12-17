import { Action, SeekCondition, Unit } from "../interface";
import { getUnitCentral } from "../utils/unit";
import { Vector, getVectorDistance } from "../utils/vector";

export interface SeekConditionContext {
  unit?: Unit;
  team?: number;
  targetLocation?: Vector;
}

type ConditionFn<Item extends SeekCondition> = Item extends [string, infer R]
  ? (context: SeekConditionContext, config: R) => boolean
  : (context: SeekConditionContext) => boolean;

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

  static getConditionFn<T extends SeekCondition>(condition: T): ConditionFn<T> {
    if (typeof condition === "string") {
      return (this.conditions as any)[condition];
    }

    return (this.conditions as any)[condition[0]];
  }

  static filterBySeekConditions(units: Unit[], conditions: SeekCondition[], context: SeekConditionContext) {
    return conditions.reduce((remainingUnits, condition) => {
      const conditionFn =
        typeof condition === "string" ? (this.conditions as any)[condition] : (this.conditions as any)[condition[0]];
      return remainingUnits.filter(unit => conditionFn({ unit, ...context }, condition[1]));
    }, units);
  }

  static isUnitActionHasValidTarget(unit: Unit, targetUnit: Unit, action: Action): boolean {
    const context: SeekConditionContext = {
      unit: targetUnit,
      team: unit.team,
      targetLocation: unit.location,
    };

    return action.seekTargetCondition.every(condition => this.getConditionFn(condition)(context, condition[1] as any));
  }
}
