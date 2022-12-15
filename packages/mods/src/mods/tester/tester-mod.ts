import { AssetManager, BattlefieldInit, Config, Mod } from "@battleground/core";

import { HHAssetManager } from "../../assets/hero-hours/asset-manager";
import { ResourceManager } from "../castle-wars/resource-manager";

const { decompressFromBase64 } = require("lz-string");

let resolvePromise: () => void = null;

const TesterModPromise = new Promise<void>(resolver => (resolvePromise = resolver));

let battlefieldInitState: BattlefieldInit = null;
(window as any).battlefieldStart = (initState: BattlefieldInit) => (
  (battlefieldInitState = initState), resolvePromise()
);

export class TesterMod implements Mod {
  assetManager: AssetManager = new HHAssetManager();
  resourceManager: ResourceManager;

  init() {
    const initStateFromUrl = new URLSearchParams(window.location.search).get("initState");

    if (initStateFromUrl) {
      return this.assetManager.init();
    } else {
      return this.assetManager.init().then(() => TesterModPromise);
    }
  }

  battlefieldInit(config: Config): BattlefieldInit {
    const initStateFromUrl = decodeURIComponent(new URLSearchParams(window.location.search).get("initState"));

    if (initStateFromUrl) {
      return JSON.parse(decompressFromBase64(decodeURIComponent(initStateFromUrl))) as BattlefieldInit;
    } else {
      return battlefieldInitState;
    }
  }
}
