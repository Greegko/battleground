import { flatten, mapValues, range } from "lodash-es";

import { Sprite } from "konva/lib/shapes/Sprite";

import { Mod, ModUnit } from "@mod/interface";
import { calculateAngle } from "@utils/calculate-angle";

import { Battle } from "../battle/battle";
import { BattleEventSource, BattleEventType, Projectile, UnitState } from "../battle/interface";

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

    const battleEvents = this.battle.getEventsSinceLastTime();

    battleEvents.forEach(event => {
      const unitState = event.source;
      const sprite = this.renderedObjects.get(event.source);

      switch (event.type) {
        case BattleEventType.Move:
          if (event.sourceType === BattleEventSource.Unit) {
            sprite.animation("walk");
            sprite.start();

            sprite.x(event.source.cordinate[0]);
            sprite.y(event.source.cordinate[1]);
          }
          break;
        case BattleEventType.Died:
          if (event.sourceType === BattleEventSource.Unit) {
            sprite.animation("death");
            sprite.start();
            sprite.on("frameIndexChange", function () {
              if (this.frameIndex() === 2) {
                sprite.stop();
                sprite.off("frameIndexChange");
              }
            });
          }
          break;
        case BattleEventType.Attack:
          sprite.animation("attack");
          break;
        case BattleEventType.Created:
          if (event.sourceType === BattleEventSource.Unit) {
            const unit = event.source.unit as ModUnit;

            this.renderedObjects.set(unitState, null);
            this.spriteCreationCallback(unitState, this.createUnitSpriteData(unit.sprite_id), this.objectsIdCounter++);
          }

          if (event.sourceType === BattleEventSource.Projectile) {
            this.renderedObjects.set(event.source, null);

            this.spriteCreationCallback(
              event.source,
              this.createProjectileSpriteData(event.source.sprite_id),
              this.objectsIdCounter++,
            );
          }
          break;
      }
    });
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
      duration: (1 / 60) * projectile.time,
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
