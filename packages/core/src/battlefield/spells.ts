import { DmgType, EffectType, Unit } from "../interface";
import { Spell, SpellID } from "../interface/spell";
import { Vector } from "../utils/vector";
import { Context } from "./context";
import { UnitFilter } from "./unit-filter";

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
    shieldBreak: {
      seekConditions: ["enemy-team", "alive", ["in-distance", { distance: 100 }]],
      addEffects: [{ type: EffectType.Armor, dmgType: DmgType.Physical, power: -10 }],
    },
    lightning: {
      seekConditions: ["enemy-team", "alive", ["in-distance", { distance: 20 }], "closest-unit"],
      effects: [{ type: EffectType.Dmg, dmgType: DmgType.Pure, power: 1000 }],
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

    if (spell.effects) {
      targets.forEach(targetUnit => this.context.effect.applyEffect(spell.effects, targetUnit));
    }

    if (spell.addEffects) {
      targets.forEach(targetUnit => (targetUnit.effects = [...targetUnit.effects, ...spell.addEffects]));
    }
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
