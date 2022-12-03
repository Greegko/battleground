import { Application, Assets, Sprite, Spritesheet } from "pixi.js";

import { AssetManager, SpriteConfig } from "@battleground/core";

// @ts-ignore
import spell_json from "./icons/spells.json";
// @ts-ignore
import spells_png_url from "./icons/spells.png?url";
// @ts-ignore
import sprite_json from "./spritesheet/sprites.json";
// @ts-ignore
import sprite_png_url from "./spritesheet/sprites.png?url";

export class HHAssetManager implements AssetManager {
  private spriteSheet: Spritesheet;
  private spellSheet: Spritesheet;
  private assetRenderApplication: Application = new Application();

  async init() {
    Assets.add("sprite", sprite_png_url);
    Assets.add("spells", spells_png_url);

    return Assets.load(["sprite", "spells"]).then(({ sprite, spells }) => {
      this.spriteSheet = new Spritesheet(sprite, sprite_json);
      this.spellSheet = new Spritesheet(spells, spell_json);
      return Promise.all([this.spriteSheet.parse(), this.spellSheet.parse()]);
    });
  }

  getSprite(assetId: string): SpriteConfig {
    const texture = this.spriteSheet.textures[assetId + ".png"] || this.spriteSheet.animations[assetId + "/" + assetId];

    if (!texture) throw Error(`Texture doesn't exists for ${assetId}!`);

    return {
      texture: Array.isArray(texture) ? texture : [texture],
      animations: {
        idle: [0, 4],
        move: [4, 8],
        attack: [8, 12],
        hurt: [12, 16],
        die: [16, 20],
        dead: 19,
      },
    };
  }

  getAsset(assetId: string): Promise<string> {
    const spellSheetTexture = this.spellSheet.textures[assetId + ".png"];

    if (!spellSheetTexture) throw Error(`Texture doesn't exists for ${assetId}!`);

    const sprite = new Sprite(spellSheetTexture);
    const base64 = (this.assetRenderApplication.renderer as any).extract.base64(sprite);

    sprite.destroy();

    return base64;
  }
}
