import { BattlefieldInit } from "../battlefield";
import { AssetManager } from "./asset-manager";
import { Config } from "./config";
import { ResourceManager } from "./resource-manager";

export interface Mod {
  resourceManager: ResourceManager;
  assetManager: AssetManager;
  init(): Promise<any>;
  battlefieldInit(config: Config): BattlefieldInit;
}
