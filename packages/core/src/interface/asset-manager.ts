import { Texture } from "pixi.js";

export interface SpriteConfig {
  texture: Texture[];
  animations: Record<string, number | [number, number]>;
}

export interface AssetManager {
  init(): Promise<any>;
  getAsset(assetId: string): SpriteConfig;
}
