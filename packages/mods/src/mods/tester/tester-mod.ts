import { BattlefieldConfig, BattlefieldInit } from "@battleground/core";
import { AssetManager } from "@battleground/renderer";

import { HHAssetManager } from "../../assets/hero-hours/asset-manager";
import { Mod } from "../../interface";
import { ResourceManager } from "../castle-wars/resource-manager";
import { testerConfig } from "./tester-config";

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
    const queryParams = new URLSearchParams(window.location.search);

    const automaticStart = queryParams.get("initState") || queryParams.get("initSource");

    if (automaticStart) {
      return this.assetManager.init();
    } else {
      return this.assetManager.init().then(() => TesterModPromise);
    }
  }

  battlefieldInit(config: BattlefieldConfig): BattlefieldInit {
    const queryParams = new URLSearchParams(window.location.search);
    const source = queryParams.get("initSource");

    if (source === "config-file") {
      return testerConfig;
    } else if (queryParams.get("initState")) {
      return JSON.parse(decompressFromBase64(decodeURIComponent(queryParams.get("initState")))) as BattlefieldInit;
    } else {
      return battlefieldInitState;
    }
  }
}
