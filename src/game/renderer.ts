import { Cordinate } from "@game/interface";
import { Mod, ModUnit } from "@mod/interface";

import { Battle, UnitActionType } from "./battle";

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
  private state!: RendererState;

  constructor(private battle: Battle, private mod: Mod) {}

  calculateState(): void {
    const battleState = this.battle.getState();

    this.state = {
      projectiles: battleState.projectiles.map(projectile => {
        return {
          sourceLocation: projectile.sourceLocation,
          targetLocation: projectile.targetLocation,
          sprite: this.mod.sprites[projectile.sprite_id],
        };
      }),
      units: battleState.units.map(x => {
        const unit = x.unit as ModUnit;

        const state = (() => {
          switch (true) {
            case x.currentHp === 0:
              return RendererUnitState.Dead;
            case !battleState.isRunning:
              return RendererUnitState.Idle;
            case x.action.type === UnitActionType.Attack:
              return RendererUnitState.Attack;
            default:
              return RendererUnitState.Idle;
          }
        })();

        return {
          unit,
          state,
          sprite: this.mod.sprites[unit.sprite_id],
          currentHp: x.currentHp,
          cordinate: x.cordinate,
        };
      }),
    };
  }

  getState(): RendererState {
    return this.state;
  }
}
