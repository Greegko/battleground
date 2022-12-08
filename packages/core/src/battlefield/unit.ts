import { minBy, random } from "lodash-es";

import { Projectile, Unit } from "../interface";
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

    const closestTarget = this.seekTarget(unit, units);

    if (!closestTarget) return;

    if (getVectorDistance(unit.location, closestTarget.location) >= unit.action.distance) {
      unit.moveDirection = normVector(subVector(closestTarget.location, unit.location));
    }
  }

  lockTarget(unit: Unit, units: Unit[]) {
    if (!unit.action.seekTargetCondition) return;

    const target = this.seekTarget(unit, units);

    if (target === unit.action.state.targetUnit) return;

    if (!target) {
      unit.action.state.speed = undefined;
      unit.action.state.targetUnit = undefined;

      return;
    }

    const distance = getVectorDistance(unit.location, target.location);

    if (distance <= unit.action.distance) {
      unit.action.state.speed = unit.action.speed;
      unit.action.state.targetUnit = target;
      unit.moveDirection = undefined;
    } else {
      unit.action.state.speed = undefined;
      unit.action.state.targetUnit = undefined;
    }
  }

  action(unit: Unit) {
    if (unit.action.hitEffect && !unit.action.state.targetUnit) return;

    if (unit.action.state.cooldown > 0) return --unit.action.state.cooldown;

    if (unit.action.state.cooldown === 0) {
      delete unit.action.state.cooldown;
    }

    if (unit.action.state.targetUnit) {
      const targetUnit = unit.action.state.targetUnit;

      const targetUnitDistance = getVectorDistance(unit.location, targetUnit.location);

      if (targetUnitDistance > unit.action.distance) {
        delete unit.action.state.speed;
        delete unit.action.state.targetUnit;
        return;
      }
    }

    if (unit.action.state.speed > 0) return --unit.action.state.speed;

    if (unit.action.projectileId) {
      this.shootProjectile(unit, unit.action.state.targetUnit);
    } else {
      if (unit.action.hitEffect) {
        this.context.effect.applyEffect(unit.action.hitEffect, unit.action.state.targetUnit);
      }

      if (unit.action.effect) {
        this.context.effect.applyEffect(unit.action.effect, unit);
      }
    }

    unit.action.state.speed = unit.action.speed;
    unit.action.state.cooldown = unit.action.cooldown;

    delete unit.action.state.targetUnit;
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

  private seekTarget(unit: Unit, units: Unit[]): Unit {
    let filteredUnits = UnitFilter.filterBySeekConditions(units, unit.action.seekTargetCondition, {
      team: unit.team,
    });

    return minBy(filteredUnits, enemy => getVectorDistance(unit.location, enemy.location));
  }

  private shootProjectile(unit: Unit, target: Unit) {
    const action = unit.action;
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
