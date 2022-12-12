import { skeletonUnit } from "./config";
import { test } from "./utils";

test("smoke test", {
  config: { mapSize: [100, 100], containerNode: null },
  initialState: {
    units: [skeletonUnit({ location: { x: 0, y: 0 }, team: 1 }), skeletonUnit({ location: { x: 80, y: 80 }, team: 2 })],
  },
  runUntilFinish: true,
  expectedState: { turn: 14 },
});
