import { Action, EffectType } from "../../src";
import { dmgEffect } from "./effects";

export const meleeAttackAction = ({
  cooldown = 10,
  speed = 5,
  distance = 30,
  seekTargetCondition = ["enemy-team", "alive"],
  hitEffect = [dmgEffect()],
}: Partial<Action> = {}) =>
  ({
    cooldown,
    speed,
    distance,
    seekTargetCondition,
    hitEffect,
  } as Action);

export const rangeAttackAction = ({
  cooldown = 10,
  speed = 5,
  projectileId = "sprites/projectiles/projectile",
  projectileSpeed = 2,
  distance = 100,
  seekTargetCondition = ["enemy-team", "alive"],
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

export const healAction = ({
  seekTargetCondition = ["alive", "same-team", "damaged"],
  distance = 100,
  cooldown = 150,
  speed = 50,
  hitEffect = [{ type: EffectType.Heal, power: 20 }],
}: Partial<Action> = {}) =>
  ({
    cooldown,
    speed,
    distance,
    seekTargetCondition,
    hitEffect,
  } as Action);

export const reviveAction = ({
  seekTargetCondition = ["dead", "same-team"],
  distance = 100,
  cooldown = 500,
  speed = 50,
  hitEffect = [{ type: EffectType.Review }],
}: Partial<Action> = {}) =>
  ({
    cooldown,
    speed,
    distance,
    seekTargetCondition,
    hitEffect,
  } as Action);
