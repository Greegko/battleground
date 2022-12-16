import { Vector } from "./src";
import { dmgEffect, meleeAttack, skeletonUnit } from "./tests/config";
import { createPlayableUrl } from "./tests/utils/create-playable-url";

const randomTestUnit = ({ location, team }: { location: Vector; team: number }) =>
  skeletonUnit({
    location,
    hp: 1000,
    maxHp: 1000,
    team,
    actions: [meleeAttack({ hitEffect: [dmgEffect({ power: [1, 100] })], cooldown: 1, speed: 1 })],
  });

const url = createPlayableUrl(
  {
    units: [
      randomTestUnit({ location: { x: 0, y: 0 }, team: 1 }),

      randomTestUnit({ location: { x: 1000, y: 1000 }, team: 2 }),
    ],
  },
  "random-seed",
);

require("child_process").execFile("open", [url]);
