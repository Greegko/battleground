import { BattlefieldInit } from "@battleground/core";

import { archerUnit, createDummyUnit, priestUnit } from "./configs/unit";

export const testerConfig: BattlefieldInit = {
  units: [
    createDummyUnit({ location: { x: 300, y: 300 }, team: 1 }),

    // skeletonWarriorUnit({ location: { x: 500, y: 200 }, team: 2 }),
    archerUnit({ location: { x: 500, y: 220 }, team: 2, moveSpeed: 0, hp: 10, maxHp: 100 }),

    archerUnit({ location: { x: 500, y: 260 }, team: 2, moveSpeed: 0, hp: 0, maxHp: 100 }),

    priestUnit({ location: { x: 500, y: 360 }, team: 2 }),
  ],
};
