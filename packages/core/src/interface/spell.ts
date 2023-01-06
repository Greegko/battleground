import { Effect, SeekCondition } from "./unit";

export interface Spell {
  seekConditions: SeekCondition[];
  effects?: Effect[];
  addEffects?: Effect[];
}

export type SpellID = string;
