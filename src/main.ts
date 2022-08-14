import { Debug } from "./debug";
import { Config } from "./interface";
import { Loop } from "./loop";
import { CastleWarsScenario } from "./scenarios/castle-wars";

// import { GroupFightScenario } from "./scenarios/group-fight";

const div = document.getElementById("battleground") as HTMLDivElement;

const config: Config = {
  containerNode: div,
  mapSize: [window.innerWidth, window.innerHeight],
};

// const scenario = new GroupFightScenario();
const scenario = new CastleWarsScenario();

scenario.init().then(() => {
  const loop = new Loop(config, scenario);
  const debug = new Debug(loop);

  debug.hookGlobalKeys();

  loop.init();
  loop.start();
});
