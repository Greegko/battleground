import { Config } from "@battleground/core";
import { CastleWarsMod } from "@battleground/mods";

import { Debug } from "./debug";
import { Loop } from "./loop";

const div = document.getElementById("battleground") as HTMLDivElement;

const config: Config = {
  containerNode: div,
  mapSize: [window.innerWidth, window.innerHeight],
};

const selectedMod = new URLSearchParams(window.location.search).get("mod");

const mod = {
  castle_wars: new CastleWarsMod(),
}[selectedMod];

mod.init().then(() => {
  const loop = new Loop(config, mod);
  const debug = new Debug(loop);

  debug.hookGlobalKeys();

  loop.init();
  loop.start();
});
