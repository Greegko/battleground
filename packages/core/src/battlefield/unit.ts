import { groupBy, head, last, mapObjIndexed, prop, sortBy, sum, values, without } from "ramda";

import { ArmorEffect, DmgType, DotEffect, EffectType, Projectile, SeekCondition, Unit } from "../interface";
import { getUnitCentral } from "../utils/unit";
import {
  Vector,
  addVector,
  divVector,
  getVectorDistance,
  invXVector,
  invYVector,
  isZeroVector,
  multVector,
  normVector,
  rotateBy,
  subVector,
} from "../utils/vector";
import { Context } from "./context";
import { UnitFilter } from "./unit-filter";

export class UnitContext {
  constructor(private context: Context) {}

  units: Unit[] = [];

  triggerActionState(unit: Unit) {
    for (let [action, cooldown] of unit.actionsCooldowns.entries()) {
      if (cooldown > 0) {
        unit.actionsCooldowns.set(action, cooldown - 1);
      }
    }

    if (unit.activeAction) {
      if (unit.activeAction.speed > 0) --unit.activeAction.speed;
    }
  }

  triggerDotEffects(unit: Unit) {
    const effects = unit.effects.filter(x => x.type === EffectType.Dot) as DotEffect[];

    effects.forEach(effect => effect.state.intervalState--);

    const triggerEffects = effects.filter(x => x.state.intervalState === 0);

    if (triggerEffects.length) {
      this.dmg(unit, triggerEffects);
    }

    const clearEffects = [];

    for (let effect of triggerEffects) {
      if (effect.state.remainingPeriod === 1) {
        clearEffects.push(effect);
      } else {
        effect.state.remainingPeriod--;
        effect.state.intervalState = effect.interval;
      }
    }

    if (clearEffects.length > 0) {
      unit.effects = without(clearEffects, unit.effects);
    }
  }

  addUnit(unit: Unit) {
    this.units.push(unit);
  }

  moveUnit(unit: Unit) {
    if (!unit.moveSpeed) return;
    if (!unit.moveDirection) return;

    unit.location = addVector(unit.location, multVector(unit.moveDirection, unit.moveSpeed));
  }

  wander(unit: Unit) {
    if (!unit.moveSpeed) return;
    if (!unit.moveDirection) {
      unit.moveDirection = this.context.random.vector();
      return;
    }

    const angle = this.context.random.int(-10, 10) / 40;
    unit.moveDirection = rotateBy(unit.moveDirection, angle);
  }

  screenBoundaries(unit: Unit) {
    if (!unit.moveSpeed) return;
    if (!unit.moveDirection) return;

    const unitWidth = unit.size;

    const futurePoint = addVector(multVector(unit.moveDirection, unit.moveSpeed), unit.location);

    if (futurePoint.x > this.context.config.mapSize[0] - unitWidth || futurePoint.x < 0) {
      unit.moveDirection = invXVector(unit.moveDirection);
    }

    if (futurePoint.y > this.context.config.mapSize[1] - unitWidth || futurePoint.y < 0) {
      unit.moveDirection = invYVector(unit.moveDirection);
    }
  }

  seekAndMoveToTarget(unit: Unit, units: Unit[]) {
    if (!unit.moveSpeed) return;
    if (unit.activeAction) return;

    const closesUnits = unit.actions
      .map(action => this.seekTarget(unit, units, action.seekTargetCondition))
      .filter(x => x);

    const closestTarget = last(
      sortBy(targetUnit => getVectorDistance(unit.location, targetUnit.location), closesUnits),
    );

    if (!closestTarget) return;

    unit.moveDirection = normVector(subVector(closestTarget.location, unit.location));
  }

  lockActionWithTarget(unit: Unit, units: Unit[]) {
    if (unit.activeAction) return;

    const actions = unit.actions.map(
      action =>
        [action, action.seekTargetCondition ? this.seekTarget(unit, units, action.seekTargetCondition) : null] as const,
    );

    const [action, targetUnit] = head(
      sortBy(([, targetUnit]) => (targetUnit ? getVectorDistance(unit.location, targetUnit.location) : 0), actions),
    );

    // No valid seek target
    if (targetUnit === undefined) return;

    // No seek condition for the action (target itself)
    if (targetUnit === null) {
      unit.activeAction = { action, speed: action.speed };
      return;
    }

    const distance = getVectorDistance(unit.location, targetUnit.location);

    if (distance <= action.distance) {
      unit.activeAction = { action, speed: action.speed, targetUnit };
      delete unit.moveDirection;
    }
  }

  executeAction(unit: Unit) {
    if (!unit.activeAction) return;

    if (unit.activeAction.targetUnit) {
      if (unit.activeAction.targetUnit.hp === 0) {
        delete unit.activeAction;
        return;
      }

      const targetDistance = getVectorDistance(unit.location, unit.activeAction.targetUnit.location);

      if (targetDistance > unit.activeAction.action.distance) {
        delete unit.activeAction;
        return;
      }
    }

    if (unit.activeAction.speed > 0) return;
    if (unit.actionsCooldowns.get(unit.activeAction.action) > 0) return;

    if (unit.activeAction.action.projectileId) {
      this.shootProjectile(unit, unit.activeAction.targetUnit);
    } else {
      if (unit.activeAction.action.hitEffect && unit.activeAction.targetUnit) {
        this.context.effect.applyEffect(unit.activeAction.action.hitEffect, unit.activeAction.targetUnit);
      }

      if (unit.activeAction.action.effect) {
        this.context.effect.applyEffect(unit.activeAction.action.effect, unit);
      }
    }

    unit.actionsCooldowns.set(unit.activeAction.action, unit.activeAction.action.cooldown);

    delete unit.activeAction;
  }

  separation(unit: Unit, units: Unit[]) {
    if (!unit.moveSpeed) return;

    const otherUnitsInDistance = this.inTouchWithOthers(unit, units);
    let sumSubVector = otherUnitsInDistance.reduce(
      (acc, curr) => addVector(acc, normVector(subVector(unit.location, curr.location))),
      { x: 0, y: 0 },
    );

    if (otherUnitsInDistance.length > 0) {
      const direction = divVector(sumSubVector, otherUnitsInDistance.length);
      unit.moveDirection = isZeroVector(direction) ? this.context.random.vector() : direction;
    }
  }

  getUnitsInRange(targetLocation: Vector, distance: number): Unit[] {
    return UnitFilter.filterBySeekConditions(this.units, ["alive", ["in-distance", { distance }]], { targetLocation });
  }

  dmg(targetUnit: Unit, dmgEffects: { dmgType: DmgType; power: number | [number, number] }[]) {
    const armors = targetUnit.effects.filter(x => x.type === EffectType.Armor) as ArmorEffect[];

    const effectsByDmgType = groupBy(x => x.dmgType, dmgEffects);

    const totalDmgs = values(
      mapObjIndexed((effects, dmgType) => {
        const dmgArmors = armors.filter(x => x.dmgType === dmgType);
        const totalArmor = sum(dmgArmors.map(x => x.power));
        const totalDmg = sum(
          effects.map(x => (Array.isArray(x.power) ? this.context.random.int(x.power[0], x.power[1]) : x.power)),
        );

        return Math.max(0, totalDmg - totalArmor);
      }, effectsByDmgType),
    );

    const totalDmg = sum(totalDmgs);

    if (totalDmg) {
      targetUnit.hp = Math.max(0, targetUnit.hp - totalDmg);
    }
  }

  private seekTarget(unit: Unit, units: Unit[], seekConditions: SeekCondition[]): Unit {
    let filteredUnits = UnitFilter.filterBySeekConditions(units, seekConditions, { team: unit.team });
    let targetDistances = filteredUnits.map(
      target => [getVectorDistance(unit.location, target.location), target] as const,
    );
    let sorted = sortBy(prop(0), targetDistances);

    return head(sorted)?.[1];
  }

  private shootProjectile(unit: Unit, target: Unit) {
    const action = unit.activeAction.action;
    const targetLocation = getUnitCentral(target);
    const sourceLocation = getUnitCentral(unit);
    const time = Math.ceil(getVectorDistance(sourceLocation, targetLocation) / action.projectileSpeed);

    const projectile: Projectile = {
      area: 1,
      effect: action.hitEffect,
      projectileId: action.projectileId,
      source: unit,
      sourceLocation,
      speed: action.projectileSpeed,
      targetLocation,
      time,
      timeState: time,
    };

    this.context.map.addProjectile(projectile);
  }

  private inTouchWithOthers(unit: Unit, targets: Unit[]): Unit[] {
    return targets.filter(
      target =>
        target !== unit &&
        getVectorDistance(getUnitCentral(unit), getUnitCentral(target)) < target.size / 2 + unit.size / 2,
    );
  }
}
