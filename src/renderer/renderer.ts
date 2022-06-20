import { flatten, intersection, mapValues, range, without } from "lodash-es";

import { Sprite } from "konva/lib/shapes/Sprite";

import { Mod, ModUnit } from "@mod/interface";
import { calculateAngle } from "@utils/calculate-angle";

import { Battle } from "../battle/battle";
import { BattleState, Projectile, UnitState } from "../battle/interface";

export type Owner = Projectile | UnitState;

type UnitSpriteAnimationState = "idle" | "attack" | "walk" | "hurt" | "death";
type ProjectileSpriteAnimationState = "idle";

export interface AnimationSpriteData<AnimationStates extends string> {
  sprite: HTMLImageElement;
  animation: AnimationStates;
  animations: Record<AnimationStates, number[]>;
}

export type UnitSpriteData = AnimationSpriteData<UnitSpriteAnimationState>;
export type ProjectileSpriteData = AnimationSpriteData<ProjectileSpriteAnimationState>;

export type RenderedSpriteCallback = (
  owner: Owner,
  spriteData: UnitSpriteData | ProjectileSpriteData,
  id: number,
) => void;

export class Renderer {
  private objectsIdCounter = 0;
  private renderedObjects = new Map<Owner, Sprite | null>();

  private prevBattleState: BattleState = { units: [], projectiles: [] } as any as BattleState;

  constructor(private battle: Battle, private mod: Mod) {}

  private spriteCreationCallback: RenderedSpriteCallback = null!;

  hookSpriteCreationCallback(fn: RenderedSpriteCallback): void {
    this.spriteCreationCallback = fn;
  }

  setSpriteReference(owner: Owner, sprite: Sprite): void {
    this.renderedObjects.set(owner, sprite);

    if ("unit" in owner) {
      this.setUnitDefaultValues(owner, sprite);
    }

    if ("area" in owner) {
      this.setProjectileDefaultValues(owner, sprite);
    }
  }

  tick(): void {
    if (!this.spriteCreationCallback) return;

    const battleState = this.battle.getState();

    const updatedUnits = getExistingItems(this.prevBattleState.units, battleState.units);
    updatedUnits.forEach(unitState => {
      const sprite = this.renderedObjects.get(unitState);
      if (sprite) {
        sprite.x(unitState.cordinate[0]);
        sprite.y(unitState.cordinate[1]);

        if (unitState.currentHp === 0) {
          sprite.animation("death");
          sprite.on("frameIndexChange", function () {
            if (this.frameIndex() === 2) {
              sprite.stop();
              sprite.off("frameIndexChange");
            }
          });
        }
      }
    });

    const addedUnits = getAddedItems(this.prevBattleState.units, battleState.units);
    addedUnits.forEach(unitState => {
      const unit = unitState.unit as ModUnit;

      this.renderedObjects.set(unitState, null);
      this.spriteCreationCallback(unitState, this.createUnitSpriteData(unit.sprite_id), this.objectsIdCounter++);
    });

    const addedProjectiles = getAddedItems(this.prevBattleState.projectiles, battleState.projectiles);
    addedProjectiles.forEach(projectile => {
      this.renderedObjects.set(projectile, null);

      this.spriteCreationCallback(
        projectile,
        this.createProjectileSpriteData(projectile.sprite_id),
        this.objectsIdCounter++,
      );
    });

    this.prevBattleState = { ...battleState };
  }

  private setUnitDefaultValues(unitState: UnitState, sprite: Sprite) {
    sprite.x(unitState.cordinate[0]);
    sprite.y(unitState.cordinate[1]);
    sprite.scale({ x: unitState.unit.size + 1, y: unitState.unit.size + 1 });
    sprite.animation("idle");
    sprite.frameRate(5);
    sprite.start();
  }

  private setProjectileDefaultValues(projectile: Projectile, sprite: Sprite) {
    sprite.x(projectile.sourceLocation[0]);
    sprite.y(projectile.sourceLocation[1]);
    sprite.scale({ x: 2, y: 2 });
    sprite.rotate((calculateAngle(projectile.sourceLocation, projectile.targetLocation) * 180) / Math.PI);

    sprite.to({
      x: projectile.targetLocation[0],
      y: projectile.targetLocation[1],
      duration: 1,
      onFinish: () => sprite.destroy(),
    });
  }

  private createUnitSpriteData(spriteId: string): UnitSpriteData {
    const sprite = this.mod.sprites[spriteId];

    const animations = mapValues(this.mod.config.spriteDefinition.frame, ([minFrame, maxFrame]) =>
      flatten(range(minFrame, maxFrame + 1, 1).map(x => [x * sprite.height, 0, sprite.height, sprite.height])),
    );

    return {
      sprite,
      animation: "idle",
      animations,
    };
  }

  private createProjectileSpriteData(spriteId: string): ProjectileSpriteData {
    const sprite = this.mod.sprites[spriteId];

    return {
      sprite,
      animation: "idle",
      animations: { idle: [0, 0, sprite.height, sprite.height] },
    };
  }
}

function getAddedItems<T>(originaObj: T[], newObj: T[]): T[] {
  return without(newObj, ...originaObj);
}

function getExistingItems<T>(originaObj: T[], newObj: T[]): T[] {
  return intersection(originaObj, newObj);
}
