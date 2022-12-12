import { find, propEq } from "ramda";

import { ResourceManager as IResourceManager, UnitConfig } from "@battleground/core";

const units = require("./units.json") as UnitConfig[];
const buildings = require("./buildings.json") as UnitConfig[];

export class ResourceManager implements IResourceManager {
  getUnitConfig(unitId: string): UnitConfig {
    return find(propEq("id", unitId), units) || find(propEq("id", unitId), buildings);
  }
}
