import { CastleWarsMod } from "../mods/castle-wars/castle-wars-mod";
import { Debug } from "./debug";
import { Config } from "./interface";
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
