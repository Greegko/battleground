import { BattlefieldInit } from "../battlefield/battlefield";
import { AssetManager } from "./asset-manager";
import { Config } from "./config";
import { ResourceManager } from "./resource-manager";

export interface Scenario {
  resourceManager: ResourceManager;
  assetManager: AssetManager;
  init(): Promise<any>;
  battlefieldInit(config: Config): BattlefieldInit;
}
