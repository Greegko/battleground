import { AssetManager } from "./asset-manager";
import { Config } from "./config";
import { ResourceManager } from "./resource-manager";
import { Unit } from "./unit";

export interface ModInitState {
  units: Unit[];
}

export interface Mod {
  resourceManager: ResourceManager;
  assetManager: AssetManager;
  init(): Promise<any>;
  getInitState(config: Config): ModInitState;
}
