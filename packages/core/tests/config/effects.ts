import { DmgEffect, DmgType, DotEffect, EffectType } from "../../src";

export const dmgEffect = ({ dmgType = DmgType.Physical, power = 10 }: Partial<DmgEffect> = {}) => ({
  type: EffectType.Dmg,
  dmgType,
  power,
});

export const armorEffect = ({ dmgType = DmgType.Physical, power = 10 }: Partial<DmgEffect> = {}) => ({
  type: EffectType.Armor,
  dmgType,
  power,
});

export const dotEffect = ({
  dmgType = DmgType.Physical,
  power = 10,
  interval = 1,
  period = 5,
}: Partial<DotEffect> = {}) => ({
  type: EffectType.Dot,
  dmgType,
  power,
  period,
  interval,
});
