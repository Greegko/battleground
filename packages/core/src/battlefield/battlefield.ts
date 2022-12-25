import { without } from "ramda";

import { BattlefieldConfig, Projectile, ResourceManager, Unit, UnitInit } from "../interface";
import { Random } from "../utils";
import { Vector } from "../utils/vector";
import { Context } from "./context";
import { EffectsContext } from "./effects";
import { ManuallyControlledUnit } from "./manually-controlled-unit";
import { MapContext } from "./map";
import { SpellsContext } from "./spells";
import { UnitContext } from "./unit";

export interface BattlefieldState {
  tick: number;
  units: Unit[];
  projectiles: Projectile[];
}

export interface BattlefieldInit {
  units: UnitInit[];
}

export interface UnitSelection {
  point: Vector;
  range: number;
}

export class Battlefield {
  private context: Context;

  private ticker: number = 0;

  constructor(config: BattlefieldConfig, resourceManager: ResourceManager) {
    this.context = {} as Context;

    Object.assign(this.context, {
      config,
      unit: new UnitContext(this.context),
      map: new MapContext(this.context),
      manuallyControlledUnit: new ManuallyControlledUnit(),
      effect: new EffectsContext(this.context),
      spells: new SpellsContext(this.context),
      resourceManager,
      random: new Random(config.seed),
    } as Context);
  }

  init(init: BattlefieldInit) {
    init.units.forEach(unit => this.context.unit.addUnit(unit));
  }

  tick() {
    this.ticker += 1;
    const controlledUnit = this.context.manuallyControlledUnit.controlledUnit;

    if (controlledUnit) {
      this.context.unit.moveUnit(controlledUnit);
    }

    const aliveUnits = this.context.unit.units.filter(x => x.hp > 0);

    for (let unit of aliveUnits) {
      if (unit === controlledUnit) continue;

      unit.moveDirection = undefined;

      // this.context.unit.wander(unit);
      this.context.unit.triggerActionState(unit);
      this.context.unit.seekAndMoveToTarget(unit, this.context.unit.units);
      this.context.unit.lockActionWithTarget(unit, this.context.unit.units);
      this.context.unit.executeAction(unit);
      this.context.unit.separation(unit, aliveUnits);
      this.context.unit.screenBoundaries(unit);
      this.context.unit.moveUnit(unit);
      this.context.unit.triggerDotEffects(unit);
    }

    for (let projectile of this.context.map.projectiles) {
      projectile.timeState -= 1;

      if (projectile.timeState < 0) {
        this.context.map.landProjectile(projectile);
        this.context.map.projectiles = without([projectile], this.context.map.projectiles);
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
      tick: this.ticker,
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
