import { head, values } from "lodash-es";

import * as mods from "../mods";
import { Debug } from "./debug";
import { Config, Mod } from "./interface";
import { Loop } from "./loop";

const div = document.getElementById("battleground") as HTMLDivElement;

const config: Config = {
  containerNode: div,
  mapSize: [window.innerWidth, window.innerHeight],
};

const modClass = head(values(mods));
const mod: Mod = new modClass();

mod.init().then(() => {
  const loop = new Loop(config, mod);
  const debug = new Debug(loop);

  debug.hookGlobalKeys();

  loop.init();
  loop.start();
});
