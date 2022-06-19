import { Sprite } from "konva/lib/shapes/Sprite";
import { flatten, mapValues, range } from "lodash-es";

import { Mod, ModUnit } from "@mod/interface";
import { calculateAngle } from "@utils/calculate-angle";

import { Battle, Projectile, UnitState } from "./battle";

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

export type RenderedSpriteCallback = (owner: Owner, sprite: UnitSpriteData | ProjectileSpriteData, id: number) => void;
export type RenderedDestroyCallback = (owner: Owner) => void;

export class Renderer {
  private objectsIdCounter = 0;
  private renderedObjects = new Map<Owner, Sprite | null>();

  constructor(private battle: Battle, private mod: Mod) {}

  private spriteCreationCallback: RenderedSpriteCallback = null!;
  private spriteDestroyCallback: RenderedDestroyCallback = null!;

  hookSpriteCreationCallback(fn: RenderedSpriteCallback): void {
    this.spriteCreationCallback = fn;
  }

  hookSpriteDestroyCallback(fn: RenderedDestroyCallback): void {
    this.spriteDestroyCallback = fn;
  }

  setSpriteReference(owner: Owner, sprite: Sprite): void {
    this.renderedObjects.set(owner, sprite);
  }

  tick(): void {
    if (!this.spriteCreationCallback) return;

    const battleState = this.battle.getState();

    battleState.units.forEach(unitState => {
      const unit = unitState.unit as ModUnit;

      if (!this.renderedObjects.has(unitState)) {
        this.renderedObjects.set(unitState, null);
        this.spriteCreationCallback(unitState, this.createUnitSpriteData(unit.sprite_id), this.objectsIdCounter++);
      }

      const sprite = this.renderedObjects.get(unitState);
      if (sprite) {
        sprite.x(unitState.cordinate[0]);
        sprite.y(unitState.cordinate[1]);
        sprite.scale({ x: unitState.unit.size + 1, y: unitState.unit.size + 1 });
        sprite.animation("walk");
        sprite.frameRate(5);
        sprite.start();
      }
    });

    battleState.projectiles.forEach(projectile => {
      if (!this.renderedObjects.has(projectile)) {
        this.renderedObjects.set(projectile, null);

        this.spriteCreationCallback(
          projectile,
          this.createProjectileSpriteData(projectile.sprite_id),
          this.objectsIdCounter++,
        );
      }

      const sprite = this.renderedObjects.get(projectile);
      if (sprite) {
        sprite.x(projectile.sourceLocation[0]);
        sprite.y(projectile.sourceLocation[1]);
        sprite.scale({ x: 2, y: 2 });
        sprite.rotate((calculateAngle(projectile.sourceLocation, projectile.targetLocation) * 180) / Math.PI);

        sprite.to({
          x: projectile.targetLocation[0],
          y: projectile.targetLocation[1],
          duration: 1,
        });
      }
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
