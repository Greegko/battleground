import { Image } from "konva/lib/shapes/Image";

import { Mod, ModUnit } from "@mod/interface";

import { Battle, Projectile, UnitState } from "./battle";

export type Owner = Projectile | UnitState;

export interface SpriteData {
  id: number;
  owner: any;
  sprite: ImageBitmap;
}

export type RenderedSpriteCallback = (owner: Owner, sprite: ImageBitmap, id: number) => void;
export type RenderedDestroyCallback = (owner: Owner) => void;

export class Renderer {
  private objectsIdCounter = 0;
  private renderedObjects = new Map<Owner, Image | null>();

  constructor(private battle: Battle, private mod: Mod) {}

  private spriteCreationCallback: RenderedSpriteCallback = null!;
  private spriteDestroyCallback: RenderedDestroyCallback = null!;

  hookSpriteCreationCallback(fn: RenderedSpriteCallback): void {
    this.spriteCreationCallback = fn;
  }

  hookSpriteDestroyCallback(fn: RenderedDestroyCallback): void {
    this.spriteDestroyCallback = fn;
  }

  setImageReference(owner: Owner, image: Image): void {
    if (!this.renderedObjects.has(owner)) {
      throw new Error("Owner does not exist");
    }

    this.renderedObjects.set(owner, image);
  }

  tick(): void {
    if (!this.spriteCreationCallback) return;

    const battleState = this.battle.getState();

    battleState.units.forEach(unitState => {
      const unit = unitState.unit as ModUnit;

      if (!this.renderedObjects.has(unitState)) {
        this.renderedObjects.set(unitState, null);
        this.spriteCreationCallback(unitState, this.mod.sprites[unit.sprite_id], this.objectsIdCounter++);
      }

      const image = this.renderedObjects.get(unitState);
      if (image) {
        image.setAttr("x", unitState.cordinate[0]);
        image.setAttr("y", unitState.cordinate[1]);
        image.setAttr("scale", { x: 2, y: 2 });
      }
    });
  }

  getRendererObjectsList(): SpriteData[] {
    const entries = [...this.renderedObjects.entries()].map(
      ([owner], i) =>
        ({ owner, sprite: this.mod.sprites[((owner as UnitState).unit as ModUnit).sprite_id], id: i } as SpriteData),
    );

    this.objectsIdCounter = entries.length;

    return entries;
  }
}
