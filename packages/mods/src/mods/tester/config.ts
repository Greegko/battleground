import { mergeAll, mergeRight } from "ramda";

import { UnitConfig, UnitInit, UnitSetup } from "@battleground/core";

const units = require("../castle-wars/units.json") as UnitConfig[];
const buildings = require("../castle-wars/buildings.json") as UnitConfig[];

const getConfig = (id: string): UnitConfig => units.find(x => x.id === id) || buildings.find(x => x.id === id);

const unitFactory =
  (id: string) =>
  (unitConfigOverride: UnitSetup & Partial<UnitConfig>): UnitInit =>
    mergeRight(getConfig(id), unitConfigOverride);

export const createDummyUnit = (unitConfigOverride: Pick<UnitSetup, "location" | "team">): UnitInit =>
  mergeAll<any>([getConfig("skeleton"), { hp: 1000, maxHp: 1000, actions: [] }, unitConfigOverride]);
export const skeletonUnit = unitFactory("skeleton");
export const archerUnit = unitFactory("archer");
export const priestUnit = unitFactory("priest");
