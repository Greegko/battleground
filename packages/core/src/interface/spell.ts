import { Effect, SeekCondition } from "./unit";

export interface Spell {
  seekConditions: SeekCondition[];
  effects: Effect[];
}

export type SpellID = string;
