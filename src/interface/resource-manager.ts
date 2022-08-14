import { UnitConfig } from "./unit";

export interface ResourceManager {
  getUnitConfig(unitId: string): UnitConfig;
}
