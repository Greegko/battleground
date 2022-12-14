import { dmgEffect, meleeAttack, rangeAttack, skeletonUnit } from "./config";
import { test } from "./utils";

test("move", {
  config: { mapSize: [100, 20], containerNode: null },
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
  config: { mapSize: [40, 20], containerNode: null },
  initialState: {
    units: [
      skeletonUnit({ location: { x: 0, y: 0 }, hp: 10, team: 1 }),
      skeletonUnit({
        location: { x: 20, y: 0 },
        actions: [meleeAttack({ effect: [dmgEffect({ power: 10 })], speed: 1, distance: 20 })],
        team: 2,
      }),
    ],
  },
  turn: 2,
  expectedState: { units: [{ hp: 0 }, { hp: 10 }] },
});

test("dmg range", {
  config: { mapSize: [40, 40], containerNode: null },
  initialState: {
    units: [
      skeletonUnit({
        location: { x: 0, y: 0 },
        hp: 10,
        team: 1,
        actions: [meleeAttack({ hitEffect: [dmgEffect({ power: 10 })] })],
      }),
      skeletonUnit({
        hp: 10,
        location: { x: 20, y: 0 },
        actions: [meleeAttack({ hitEffect: [dmgEffect({ power: [4, 6] })], speed: 1, distance: 20 })],
        team: 2,
      }),
    ],
  },
  turn: 2,
  expectedState: (state, t) => t.true(state.units[0].hp >= 4 && state.units[0].hp <= 6),
});

test("shoot projectile", {
  config: { mapSize: [100, 20], containerNode: null },
  initialState: {
    units: [
      skeletonUnit({ location: { x: 0, y: 0 }, hp: 10, team: 1 }),
      skeletonUnit({
        location: { x: 80, y: 0 },
        actions: [rangeAttack({ speed: 1, distance: 80, projectileId: "test-projectile" })],
        team: 2,
      }),
    ],
  },
  turn: 2,
  expectedState: { projectiles: [{ projectileId: "test-projectile" }] },
});
