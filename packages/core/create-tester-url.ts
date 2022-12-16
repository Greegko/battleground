import { Vector } from "./src";
import { dmgEffect, meleeAttack, skeletonUnit } from "./tests/config";
import { createPlayableUrl } from "./tests/utils/create-playable-url";

const randomTestUnit = ({ location, team }: { location: Vector; team: number }) =>
  skeletonUnit({
    location,
    hp: 1000,
    team,
    actions: [meleeAttack({ hitEffect: [dmgEffect({ power: [1, 100] })], cooldown: 1, speed: 1 })],
  });

const url = createPlayableUrl(
  {
    units: [
      randomTestUnit({ location: { x: 0, y: 0 }, team: 1 }),
      randomTestUnit({ location: { x: 20, y: 0 }, team: 1 }),
      randomTestUnit({ location: { x: 40, y: 0 }, team: 1 }),
      randomTestUnit({ location: { x: 60, y: 0 }, team: 1 }),
      randomTestUnit({ location: { x: 80, y: 0 }, team: 1 }),
      randomTestUnit({ location: { x: 100, y: 0 }, team: 1 }),
      randomTestUnit({ location: { x: 120, y: 0 }, team: 1 }),
      randomTestUnit({ location: { x: 140, y: 0 }, team: 1 }),
      randomTestUnit({ location: { x: 160, y: 0 }, team: 1 }),
      randomTestUnit({ location: { x: 180, y: 0 }, team: 1 }),
      randomTestUnit({ location: { x: 200, y: 0 }, team: 1 }),

      randomTestUnit({ location: { x: 0, y: 200 }, team: 2 }),
      randomTestUnit({ location: { x: 20, y: 200 }, team: 2 }),
      randomTestUnit({ location: { x: 40, y: 200 }, team: 2 }),
      randomTestUnit({ location: { x: 60, y: 200 }, team: 2 }),
      randomTestUnit({ location: { x: 80, y: 200 }, team: 2 }),
      randomTestUnit({ location: { x: 100, y: 200 }, team: 2 }),
      randomTestUnit({ location: { x: 120, y: 200 }, team: 2 }),
      randomTestUnit({ location: { x: 140, y: 200 }, team: 2 }),
      randomTestUnit({ location: { x: 160, y: 200 }, team: 2 }),
      randomTestUnit({ location: { x: 180, y: 200 }, team: 2 }),
      randomTestUnit({ location: { x: 200, y: 200 }, team: 2 }),
    ],
  },
  "random-seed",
);

require("child_process").execFile("open", [url]);
