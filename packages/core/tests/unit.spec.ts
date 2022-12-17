import { DmgType } from "../src";
import {
  armorEffect,
  createDummyUnit,
  dmgEffect,
  dotEffect,
  healAction,
  meleeAttackAction,
  priestUnit,
  rangeAttackAction,
  reviveAction,
  skeletonUnit,
} from "./config";
import { test } from "./utils";

test("move", {
  initialState: {
    units: [
      skeletonUnit({ location: { x: 0, y: 0 }, team: 1, moveSpeed: 5 }),
      skeletonUnit({ location: { x: 80, y: 0 }, team: 2, moveSpeed: 5 }),
    ],
  },
  turn: 1,
  expectedState: { units: [{ location: { x: 5, y: 0 } }, { location: { x: 75, y: 0 } }] },
});

test("dmg", {
  initialState: {
    units: [
      skeletonUnit({ location: { x: 0, y: 0 }, hp: 10, team: 1 }),
      skeletonUnit({
        location: { x: 20, y: 0 },
        actions: [meleeAttackAction({ hitEffect: [dmgEffect({ power: 10 })], speed: 1, distance: 20 })],
        team: 2,
      }),
    ],
  },
  turn: 2,
  expectedState: { units: [{ hp: 0 }, { hp: 10 }] },
});

test("dmg stack attributes", {
  initialState: {
    units: [
      skeletonUnit({ location: { x: 0, y: 0 }, hp: 100, team: 1 }),
      skeletonUnit({
        location: { x: 20, y: 0 },
        actions: [
          meleeAttackAction({
            hitEffect: [dmgEffect({ power: 10 }), dmgEffect({ power: 10 })],
            speed: 1,
            distance: 20,
            cooldown: 10,
          }),
        ],
        team: 2,
      }),
    ],
  },
  turn: 2,
  expectedState: { units: [{ hp: 80 }, { hp: 10 }] },
});

test("armor", {
  initialState: {
    units: [
      skeletonUnit({ location: { x: 0, y: 0 }, hp: 100, team: 1, effects: [armorEffect({ power: 5 })] }),
      skeletonUnit({
        location: { x: 20, y: 0 },
        actions: [
          meleeAttackAction({
            hitEffect: [dmgEffect({ power: 10 })],
            speed: 1,
            distance: 20,
            cooldown: 10,
          }),
        ],
        team: 2,
      }),
    ],
  },
  turn: 2,
  expectedState: { units: [{ hp: 95 }, { hp: 10 }] },
});

test("armor stack attributes", {
  initialState: {
    units: [
      skeletonUnit({
        location: { x: 0, y: 0 },
        hp: 100,
        team: 1,
        effects: [armorEffect({ power: 5 }), armorEffect({ power: 2 })],
      }),
      skeletonUnit({
        location: { x: 20, y: 0 },
        actions: [
          meleeAttackAction({
            hitEffect: [dmgEffect({ power: 10 })],
            speed: 1,
            distance: 20,
            cooldown: 10,
          }),
        ],
        team: 2,
      }),
    ],
  },
  turn: 2,
  expectedState: { units: [{ hp: 97 }, { hp: 10 }] },
});

test("different dmg type with armors", {
  initialState: {
    units: [
      skeletonUnit({
        location: { x: 0, y: 0 },
        hp: 100,
        team: 1,
        effects: [
          armorEffect({ power: 5, dmgType: DmgType.Fire }),
          armorEffect({ power: 2, dmgType: DmgType.Physical }),
        ],
      }),
      skeletonUnit({
        location: { x: 20, y: 0 },
        actions: [
          meleeAttackAction({
            hitEffect: [dmgEffect({ power: 10, dmgType: DmgType.Fire })],
            speed: 1,
            distance: 20,
            cooldown: 10,
          }),
        ],
        team: 2,
      }),
    ],
  },
  turn: 2,
  expectedState: { units: [{ hp: 95 }, { hp: 10 }] },
});

test("dot dmg apply", {
  initialState: {
    units: [
      skeletonUnit({
        location: { x: 0, y: 0 },
        hp: 50,
        team: 1,
        actions: [meleeAttackAction({ hitEffect: [], speed: 1, distance: 20 })],
      }),
      skeletonUnit({
        location: { x: 20, y: 0 },
        actions: [
          meleeAttackAction({
            hitEffect: [dotEffect({ interval: 1, period: 3, power: 10 })],
            speed: 1,
            distance: 20,
            cooldown: 5000,
          }),
        ],
        team: 2,
      }),
    ],
  },
  turn: 5,
  expectedState: { units: [{ hp: 20 }, { hp: 10 }] },
});

test("dmg range", {
  initialState: {
    units: [
      skeletonUnit({
        location: { x: 0, y: 0 },
        hp: 10,
        team: 1,
        actions: [meleeAttackAction({ hitEffect: [dmgEffect({ power: 10 })] })],
      }),
      skeletonUnit({
        hp: 10,
        location: { x: 20, y: 0 },
        actions: [meleeAttackAction({ hitEffect: [dmgEffect({ power: [4, 6] })], speed: 1, distance: 20 })],
        team: 2,
      }),
    ],
  },
  turn: 2,
  expectedState: (state, t) => t.true(state.units[0].hp >= 4 && state.units[0].hp <= 6),
});

test("shoot projectile", {
  initialState: {
    units: [
      skeletonUnit({ location: { x: 0, y: 0 }, hp: 10, team: 1 }),
      skeletonUnit({
        location: { x: 80, y: 0 },
        actions: [rangeAttackAction({ speed: 1, distance: 80, projectileId: "test-projectile" })],
        team: 2,
      }),
    ],
  },
  turn: 2,
  expectedState: { projectiles: [{ projectileId: "test-projectile" }] },
});

test("choose target unit with action which is closer #1 part", {
  initialState: {
    units: [
      createDummyUnit({ location: { x: 0, y: 0 }, team: 1 }),

      createDummyUnit({ location: { x: 20, y: 20 }, team: 2, hp: 10, maxHp: 100 }),
      createDummyUnit({ location: { x: 20, y: 60 }, team: 2, hp: 0, maxHp: 100 }),

      priestUnit({
        location: { x: 20, y: 100 },
        team: 2,
        actions: [healAction({ cooldown: 1, speed: 1 }), reviveAction({ speed: 1 })],
      }),
    ],
  },
  turn: 2,
  expectedState: (state, t) => {
    t.is(state.units[1].hp, 10);
    t.is(state.units[2].hp, state.units[2].maxHp);
  },
});

test("choose target unit with action which is closer #2 part", {
  initialState: {
    units: [
      createDummyUnit({ location: { x: 0, y: 0 }, team: 1 }),

      createDummyUnit({ location: { x: 20, y: 20 }, team: 2, hp: 10, maxHp: 100 }),
      createDummyUnit({ location: { x: 20, y: 60 }, team: 2, hp: 0, maxHp: 100 }),

      priestUnit({
        location: { x: 20, y: 100 },
        team: 2,
        actions: [healAction({ cooldown: 1, speed: 1 }), reviveAction({ speed: 1 })],
      }),
    ],
  },
  turn: 12,
  expectedState: (state, t) => t.is(state.units[1].hp, 100),
});
