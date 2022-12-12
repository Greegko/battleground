import { Action, DmgEffect, DmgType, EffectType, Unit } from "../src";

export const dmgEffect = ({
  dmgType = DmgType.Phisical,
  power = 10,
  type = EffectType.Dmg,
}: Partial<DmgEffect> = {}) => ({ dmgType, power, type });

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
  } as Unit);
