import { Texture } from "pixi.js";

export interface SpriteConfig {
  texture: Texture[];
  animations: Record<string, number | [number, number]>;
}

export interface AssetManager {
  init(): Promise<any>;
  getSprite(assetId: string): SpriteConfig;
  getAsset(assetId: string): Texture;
  getAssetAsBase64(assetId: string): Promise<string>;
}
