import { Config } from "@battleground/core";
import { CastleWarsMod } from "@battleground/mods";

import { Debug } from "./debug";
import { Loop } from "./loop";

const div = document.getElementById("battleground") as HTMLDivElement;

const config: Config = {
  containerNode: div,
  mapSize: [window.innerWidth, window.innerHeight],
};

const mod = new CastleWarsMod();

mod.init().then(() => {
  const loop = new Loop(config, mod);
  const debug = new Debug(loop);

  debug.hookGlobalKeys();

  loop.init();
  loop.start();
});
