import { pull } from "lodash-es";

import { Config, Projectile, ResourceManager, Unit } from "../interface";
import { Vector } from "../utils/vector";
import { Context } from "./context";
import { EffectsContext } from "./effects";
import { ManuallyControlledUnit } from "./manually-controlled-unit";
import { MapContext } from "./map";
import { SpellsContext } from "./spells";
import { UnitContext } from "./unit";

interface BattlefieldState {
  units: Unit[];
  projectiles: Projectile[];
}

export interface BattlefieldInit {
  units: Unit[];
}

export interface UnitSelection {
  point: Vector;
  range: number;
}

export class Battlefield {
  private context: Context;

  constructor(config: Config, resourceManager: ResourceManager) {
    this.context = {} as Context;

    Object.assign(this.context, {
      config,
      unit: new UnitContext(this.context),
      map: new MapContext(this.context),
      manuallyControlledUnit: new ManuallyControlledUnit(),
      effect: new EffectsContext(this.context),
      spells: new SpellsContext(this.context),
      resourceManager,
    } as Context);
  }

  init(init: BattlefieldInit) {
    init.units.forEach(unit => this.context.unit.addUnit(unit));
  }

  tick() {
    const controlledUnit = this.context.manuallyControlledUnit.controlledUnit;

    if (controlledUnit) {
      this.context.unit.moveUnit(controlledUnit);
    }

    const actionableUnits = this.context.unit.units.filter(x => x.hp > 0);

    for (let unit of actionableUnits) {
      if (unit === controlledUnit) continue;

      unit.moveDirection = undefined;

      // this.context.unit.wander(unit);
      this.context.unit.seekAndMoveToTarget(unit, this.context.unit.units);
      this.context.unit.lockTarget(unit, this.context.unit.units);
      this.context.unit.action(unit);
      this.context.unit.separation(unit, actionableUnits);
      this.context.unit.screenBoundaries(unit);
      this.context.unit.moveUnit(unit);
    }

    for (let projectile of this.context.map.projectiles) {
      projectile.timeState -= 1;

      if (projectile.timeState < 0) {
        this.context.map.landProjectile(projectile);
        pull(this.context.map.projectiles, projectile);
      }
    }
  }

  selectUnit(unit: Unit) {
    this.context.manuallyControlledUnit.setControlledUnit(unit);
  }

  controlManuallyControlledUnit(moveDirection: Vector) {
    this.context.manuallyControlledUnit.setMoveDirection(moveDirection);
  }

  getState(): BattlefieldState {
    return {
      units: this.context.unit.units,
      projectiles: this.context.map.projectiles,
    };
  }

  get isFinished(): boolean {
    const actionableUnits = this.context.unit.units.filter(x => x.hp > 0);

    return actionableUnits.every((x, _index, array) => x.team === array[0].team);
  }

  get spellsContext(): SpellsContext {
    return this.context.spells;
  }
}
