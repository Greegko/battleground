import { DmgType, Effect, EffectType, SeekCondition, Unit } from "../interface";
import { Vector } from "../utils/vector";
import { Context } from "./context";
import { UnitFilter } from "./unit-filter";

export interface Spell {
  seekConditions: SeekCondition[];
  effects: Effect[];
}

export type SpellID = string;

export class SpellsContext {
  constructor(private context: Context) {}

  private spells: Record<SpellID, Spell> = {
    heal: {
      seekConditions: ["same-team", "alive", "damaged", ["in-distance", { distance: 200 }]],
      effects: [{ type: EffectType.Heal, power: 100 }],
    },
    fireball: {
      seekConditions: ["enemy-team", "alive", ["in-distance", { distance: 100 }]],
      effects: [{ type: EffectType.Dmg, dmgType: DmgType.Pure, power: 100 }],
    },
  };

  getTargetUnits(spellId: SpellID, targetLocation: Vector): Unit[] {
    const spell = this.spells[spellId];
    const spellContext = this.getSpellContext();

    return UnitFilter.filterBySeekConditions(this.context.unit.units, spell.seekConditions, {
      targetLocation,
      ...spellContext,
    });
  }

  castSpell(spellId: SpellID, targetLocation: Vector): void {
    const spell = this.spells[spellId];
    const spellContext = this.getSpellContext();

    const targets = UnitFilter.filterBySeekConditions(this.context.unit.units, spell.seekConditions, {
      targetLocation,
      ...spellContext,
    });

    targets.forEach(targetUnit => this.context.effect.applyEffect(spell.effects, targetUnit));
  }

  getSpellRange(spellId: SpellID): number {
    const distanceCondition = this.spells[spellId].seekConditions.find(
      seekCondition => seekCondition[0] === "in-distance",
    );

    return (distanceCondition[1] as { distance: number }).distance;
  }

  private getSpellContext(): object {
    return {
      team: 1,
    };
  }
}
