import { minBy, random } from "lodash-es";

import { Projectile, Unit } from "../interface";
import {
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

    if (target === unit.actionState.targetUnit) return;

    if (!target) {
      unit.actionState.speed = undefined;
      unit.actionState.targetUnit = undefined;

      return;
    }

    const distance = getVectorDistance(unit.location, target.location);

    if (distance <= unit.action.distance) {
      unit.actionState.speed = unit.action.speed;
      unit.actionState.targetUnit = target;
      unit.moveDirection = undefined;
    } else {
      unit.actionState.speed = undefined;
      unit.actionState.targetUnit = undefined;
    }
  }

  action(unit: Unit) {
    if (unit.action.hitEffect && !unit.actionState.targetUnit) return;

    if (unit.actionState.cooldown > 0) return --unit.actionState.cooldown;

    if (unit.actionState.cooldown === 0) {
      delete unit.actionState.cooldown;
    }

    if (unit.actionState.targetUnit) {
      const targetUnit = unit.actionState.targetUnit;

      const targetUnitDistance = getVectorDistance(unit.location, targetUnit.location);

      if (targetUnitDistance > unit.action.distance) {
        delete unit.actionState.speed;
        delete unit.actionState.targetUnit;
        return;
      }
    }

    if (unit.actionState.speed > 0) return --unit.actionState.speed;

    if (unit.action.projectileId) {
      this.shootProjectile(unit, unit.actionState.targetUnit);
    } else {
      if (unit.action.hitEffect) {
        this.context.effect.applyEffect(unit.action.hitEffect, unit.actionState.targetUnit);
      }

      if (unit.action.effect) {
        this.context.effect.applyEffect(unit.action.effect, unit);
      }
    }

    unit.actionState.speed = unit.action.speed;
    unit.actionState.cooldown = unit.action.cooldown;

    delete unit.actionState.targetUnit;
  }

  separation(unit: Unit, units: Unit[]) {
    if (!unit.moveSpeed) return;

    const otherUnitsInDistance = this.inTouchWithOthers(unit, units, 0);
    let sumSubVector = otherUnitsInDistance.reduce(
      (acc, curr) => addVector(acc, normVector(subVector(unit.location, curr.location))),
      { x: 0, y: 0 },
    );

    if (otherUnitsInDistance.length > 0) {
      const direction = divVector(sumSubVector, otherUnitsInDistance.length);
      unit.moveDirection = isZeroVector(direction) ? createRandomVector() : direction;
    }
  }

  private seekTarget(unit: Unit, units: Unit[]): Unit {
    let sourceUnits = units;

    if (unit.action.seekTargetCondition.includes("enemy-team")) {
      sourceUnits = sourceUnits.filter(x => x.team !== unit.team);
    }

    if (unit.action.seekTargetCondition.includes("same-team")) {
      sourceUnits = sourceUnits.filter(x => x.team === unit.team);
    }

    if (unit.action.seekTargetCondition.includes("alive")) {
      sourceUnits = sourceUnits.filter(x => x.hp > 0);
    }

    if (unit.action.seekTargetCondition.includes("dead")) {
      sourceUnits = sourceUnits.filter(x => x.hp <= 0);
    }

    if (unit.action.seekTargetCondition.includes("damaged")) {
      sourceUnits = sourceUnits.filter(x => x.hp < x.maxHp);
    }

    return minBy(sourceUnits, enemy => getVectorDistance(unit.location, enemy.location));
  }

  private shootProjectile(unit: Unit, target: Unit) {
    const action = unit.action;
    const time = Math.ceil(getVectorDistance(unit.location, target.location) / action.projectileSpeed);

    const projectile: Projectile = {
      area: 1,
      effect: action.hitEffect,
      projectileId: action.projectileId,
      source: unit,
      sourceLocation: addVector(unit.location, { x: unit.size / 2, y: unit.size / 2 }),
      speed: action.projectileSpeed,
      targetLocation: addVector(target.location, { x: target.size / 2, y: target.size / 2 }),
      time,
      timeState: time,
    };

    this.context.map.addProjectile(projectile);
  }

  private inTouchWithOthers(unit: Unit, targets: Unit[], threshold: number): Unit[] {
    return targets.filter(
      target =>
        target !== unit &&
        getVectorDistance(unit.location, target.location) - Math.max(target.size, unit.size) < threshold,
    );
  }
}
