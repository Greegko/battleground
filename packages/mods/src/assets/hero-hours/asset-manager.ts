import { Application, Assets, Sprite, Spritesheet } from "pixi.js";

import { AssetManager, SpriteConfig } from "@battleground/renderer";

// @ts-ignore
import sprite_json from "./assets.json";
// @ts-ignore
import sprite_png_url from "./assets.png?url";

export class HHAssetManager implements AssetManager {
  private spriteSheet: Spritesheet;
  private assetRenderApplication: Application = new Application();

  async init() {
    return Assets.load(sprite_png_url).then(spriteTexture => {
      this.spriteSheet = new Spritesheet(spriteTexture, sprite_json);
      return this.spriteSheet.parse();
    });
  }

  getSprite(assetId: string): SpriteConfig {
    const texture = this.spriteSheet.textures[assetId + ".png"] || this.spriteSheet.animations[assetId];

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
    const spellSheetTexture = this.spriteSheet.textures[assetId + ".png"];

    if (!spellSheetTexture) throw Error(`Texture doesn't exists for ${assetId}!`);

    const sprite = new Sprite(spellSheetTexture);
    const base64 = (this.assetRenderApplication.renderer as any).extract.base64(sprite);

    sprite.destroy();

    return base64;
  }
}
