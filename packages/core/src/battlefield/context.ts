import { Config, ResourceManager } from "../interface";
import { EffectsContext } from "./effects";
import { ManuallyControlledUnit } from "./manually-controlled-unit";
import { MapContext } from "./map";
import { SpellsContext } from "./spells";
import { UnitContext } from "./unit";

export type Context = {
  config: Config;
  unit: UnitContext;
  effect: EffectsContext;
  manuallyControlledUnit: ManuallyControlledUnit;
  resourceManager: ResourceManager;
  map: MapContext;
  spells: SpellsContext;
};
