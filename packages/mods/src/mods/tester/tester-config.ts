import { BattlefieldInit } from "@battleground/core";

import { skeletonUnit } from "./config";

export const testerConfig: BattlefieldInit = {
  units: [
    skeletonUnit({ location: { x: 10, y: 10 }, team: 1 }),

    skeletonUnit({ location: { x: 1000, y: 500 }, team: 2 }),
  ],
};
