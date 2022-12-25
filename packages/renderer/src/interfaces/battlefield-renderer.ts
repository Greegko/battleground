import { Container } from "pixi.js";

import { BattlefieldConfig, Unit } from "@battleground/core";

import { AssetManager } from "./asset-manager";
import { BattlefieldRendererConfig } from "./config";
import { SceneState } from "./scene-state";

export interface BattlefieldRenderer {
  init(config: BattlefieldRendererConfig & BattlefieldConfig, assetManager: AssetManager): void;

  get container(): Container;
  get assetManager(): AssetManager;

  selectUnits(units: Unit[]): void;
  renderScene(data: SceneState): void;
  updateTickerText(): void;
}
