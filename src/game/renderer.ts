import { Cordinate } from "@game/interface";
import { Mod, ModUnit } from "@mod/interface";

import { Battle, BattleState, UnitActionType, UnitState } from "./battle";

export enum RendererUnitState {
  Idle,
  Move,
  Attack,
  Dead,
}

export interface RendererUnit {
  cordinate: Cordinate;
  currentHp: number;
  state: RendererUnitState;
  unit: ModUnit;
  sprite: ImageBitmap;
}

export interface RendererProjectile {
  sourceLocation: Cordinate;
  targetLocation: Cordinate;
  sprite: ImageBitmap;
}

export interface RendererState {
  units: RendererUnit[];
  projectiles: RendererProjectile[];
}

export class Renderer {
  constructor(private battle: Battle, private mod: Mod) {}

  calculateState(): RendererState {
    const battleState = this.battle.getState();

    return {
      projectiles: this.calculateProjectiles(battleState),
      units: this.calculateUnitsState(battleState),
    };
  }

  private calculateProjectiles(battleState: BattleState): RendererProjectile[] {
    if (!battleState.isRunning) return [];

    return battleState.projectiles.map(projectile => {
      return {
        sourceLocation: projectile.sourceLocation,
        targetLocation: projectile.targetLocation,
        sprite: this.mod.sprites[projectile.sprite_id],
      };
    });
  }

  private calculateUnitsState(battleState: BattleState): RendererUnit[] {
    if (!battleState.isRunning) return [];

    return battleState.units.map(x => this.calculateUnitState(x));
  }

  private calculateUnitState(unitState: UnitState): RendererUnit {
    const unit = unitState.unit as ModUnit;

    const state = (() => {
      switch (true) {
        case unitState.currentHp === 0:
          return RendererUnitState.Dead;
        case unitState.action.type === UnitActionType.Attack:
          return RendererUnitState.Attack;
        default:
          return RendererUnitState.Idle;
      }
    })();

    return {
      unit,
      state,
      sprite: this.mod.sprites[unit.sprite_id],
      currentHp: unitState.currentHp,
      cordinate: unitState.cordinate,
    };
  }
}
