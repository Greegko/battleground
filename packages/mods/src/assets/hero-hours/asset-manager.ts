import { Application, Loader, Sprite, Spritesheet } from "pixi.js";

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
    Loader.shared.add(sprite_png_url);
    Loader.shared.add(spells_png_url);

    return new Promise(resolve => Loader.shared.load(resolve))
      .then(() => {
        this.spriteSheet = new Spritesheet(Loader.shared.resources[sprite_png_url].texture, sprite_json);
        return this.spriteSheet.parse();
      })
      .then(() => {
        this.spellSheet = new Spritesheet(Loader.shared.resources[spells_png_url].texture, spell_json);
        return this.spellSheet.parse();
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

  getAsset(assetId: string): string {
    const spellSheetTexture = this.spellSheet.textures[assetId + ".png"];

    if (!spellSheetTexture) throw Error(`Texture doesn't exists for ${assetId}!`);

    const sprite = new Sprite(spellSheetTexture);
    const base64 = this.assetRenderApplication.renderer.plugins.extract.base64(sprite);

    sprite.destroy();

    return base64;
  }
}
