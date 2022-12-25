import { BattlefieldConfig, BattlefieldInit, ResourceManager } from "@battleground/core";
import { AssetManager } from "@battleground/renderer";

export interface Mod {
  resourceManager: ResourceManager;
  assetManager: AssetManager;
  init(): Promise<any>;
  battlefieldInit(config: BattlefieldConfig): BattlefieldInit;
}
