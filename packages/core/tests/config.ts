import { Action, DmgEffect, DmgType, DotEffect, EffectType, Unit } from "../src";

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
  interval = 5,
  period = 5,
}: Partial<DotEffect> = {}) => ({
  type: EffectType.Dot,
  dmgType,
  power,
  period,
  interval,
});

export const meleeAttack = ({
  cooldown = 10,
  speed = 5,
  distance = 30,
  seekTargetCondition = ["enemy-team"],
  hitEffect = [dmgEffect()],
}: Partial<Action> = {}) =>
  ({
    cooldown,
    speed,
    distance,
    seekTargetCondition,
    hitEffect,
  } as Action);

export const rangeAttack = ({
  cooldown = 10,
  speed = 5,
  projectileId = null,
  projectileSpeed = 10,
  distance = 100,
  seekTargetCondition = ["enemy-team"],
  hitEffect = [dmgEffect()],
}: Partial<Action> = {}) =>
  ({
    cooldown,
    speed,
    distance,
    seekTargetCondition,
    hitEffect,
    projectileId,
    projectileSpeed,
  } as Action);

export const skeletonUnit = ({
  id = "skeleton",
  spriteId = null,
  location = null,
  size = 20,
  team = 1,
  maxHp = 10,
  hp = 10,
  moveSpeed = 5,
  effects = [],
  actions = [meleeAttack()],
}: Partial<Unit> = {}) =>
  ({
    id,
    spriteId,
    location,
    size,
    team,
    maxHp,
    hp,
    moveSpeed,
    effects,
    actions,
    actionsCooldowns: new Map(actions.map(action => [action, 0])),
  } as Unit);
