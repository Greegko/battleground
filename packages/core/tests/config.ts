import { Action, DmgType, EffectType, Unit, Vector } from "../src";

export const meleeAttack = () =>
  ({
    cooldown: 10,
    speed: 5,
    distance: 30,
    seekTargetCondition: ["enemy-team"],
    hitEffect: [{ dmgType: DmgType.Phisical, power: 10, type: EffectType.Dmg }],
  } as Action);

export const skeletonUnit = ({ location, team }: { location: Vector; team: number }) =>
  ({
    id: "skeleton",
    spriteId: null,
    location,
    size: 20,
    team,
    maxHp: 10,
    hp: 10,
    moveSpeed: 5,
    effects: [],
    actions: [meleeAttack()],
  } as Unit);
