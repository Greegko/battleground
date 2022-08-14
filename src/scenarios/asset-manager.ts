import { Loader, Spritesheet } from "pixi.js";

import { AssetManager, SpriteConfig } from "../interface";
// @ts-ignore
import sprite_json from "./spritesheet/sprites.json";
// @ts-ignore
import sprite_png_url from "./spritesheet/sprites.png?url";

export class HHAssetManager implements AssetManager {
  private spriteSheet: Spritesheet;

  async init() {
    Loader.shared.add(sprite_png_url);

    return new Promise(resolve => Loader.shared.load(resolve)).then(() => {
      this.spriteSheet = new Spritesheet(Loader.shared.resources[sprite_png_url].texture, sprite_json);
      return this.spriteSheet.parse();
    });
  }

  getAsset(assetId: string): SpriteConfig {
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
}
