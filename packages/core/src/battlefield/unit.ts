import { groupBy, head, last, map, minBy, random, sortBy, sum, sumBy, without } from "lodash-es";

import { ArmorEffect, DmgType, DotEffect, EffectType, Projectile, SeekCondition, Unit } from "../interface";
import { getUnitCentral } from "../utils/unit";
import {
  Vector,
  addVector,
  createRandomVector,
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

  triggerDotEffects(unit: Unit) {
    const effects = unit.effects.filter(x => x.type === EffectType.Dot) as DotEffect[];

    effects.forEach(effect => effect.state.intervalState--);

    const triggerEffects = effects.filter(x => x.state.intervalState === 0);

    this.dmg(unit, triggerEffects);

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
      unit.effects = without(unit.effects, ...clearEffects);
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
      unit.moveDirection = createRandomVector();
      return;
    }

    const angle = random(-10, 10, false) / 40;
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

    const closesUnits = unit.actions
      .map(action => this.seekTarget(unit, units, action.seekTargetCondition))
      .filter(x => x);

    const closestTarget = last(
      sortBy(closesUnits, targetUnit => getVectorDistance(unit.location, targetUnit.location)),
    );

    if (!closestTarget) return;

    if (
      unit.activeAction &&
      getVectorDistance(unit.location, closestTarget.location) < unit.activeAction.action.distance
    ) {
      return;
    }

    unit.moveDirection = normVector(subVector(closestTarget.location, unit.location));
  }

  lockTargetAndAction(unit: Unit, units: Unit[]) {
    if (unit.activeAction) {
      if (!unit.activeAction.targetUnit) return;

      const distance = getVectorDistance(unit.location, unit.activeAction.targetUnit.location);

      if (distance <= unit.activeAction.action.distance) {
        return;
      } else {
        delete unit.activeAction;
      }
    }

    const actions = unit.actions.map(
      action =>
        [action, action.seekTargetCondition ? this.seekTarget(unit, units, action.seekTargetCondition) : null] as const,
    );

    const [action, targetUnit] = head(
      sortBy(actions, ([, targetUnit]) => (targetUnit ? getVectorDistance(unit.location, targetUnit.location) : 0)),
    );

    // No valid seek target
    if (targetUnit === undefined) return;

    // No seek condition for the action
    if (targetUnit === null) {
      unit.activeAction = { action, speed: action.speed };
      return;
    }

    const distance = getVectorDistance(unit.location, targetUnit.location);

    if (distance <= action.distance) {
      unit.activeAction = { action, speed: action.speed, targetUnit };
    }
  }

  executeAction(unit: Unit) {
    if (!unit.activeAction) return;
    if (!unit.activeAction.action.state) {
      unit.activeAction.action.state = {};
    }

    if (unit.activeAction.action.state.cooldown > 0) return --unit.activeAction.action.state.cooldown;

    if (unit.activeAction.action.state.cooldown === 0) {
      delete unit.activeAction.action.state.cooldown;
    }

    if (unit.activeAction.speed > 0) return --unit.activeAction.speed;

    if (unit.activeAction.action.projectileId) {
      this.shootProjectile(unit, unit.activeAction.targetUnit);
    } else {
      if (unit.activeAction.action.hitEffect) {
        this.context.effect.applyEffect(unit.activeAction.action.hitEffect, unit.activeAction.targetUnit);
      }

      if (unit.activeAction.action.effect) {
        this.context.effect.applyEffect(unit.activeAction.action.effect, unit);
      }
    }

    unit.activeAction.action.state.cooldown = unit.activeAction.action.cooldown;

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
      unit.moveDirection = isZeroVector(direction) ? createRandomVector() : direction;
    }
  }

  getUnitsInRange(targetLocation: Vector, distance: number): Unit[] {
    return UnitFilter.filterBySeekConditions(this.units, ["alive", ["in-distance", { distance }]], { targetLocation });
  }

  dmg(targetUnit: Unit, dmgEffects: { dmgType: DmgType; power: number }[]) {
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

  private seekTarget(unit: Unit, units: Unit[], seekConditions: SeekCondition[]): Unit {
    let filteredUnits = UnitFilter.filterBySeekConditions(units, seekConditions, { team: unit.team });

    return minBy(filteredUnits, enemy => getVectorDistance(unit.location, enemy.location));
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
