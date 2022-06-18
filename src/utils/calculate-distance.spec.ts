import test from "ava";

import { calculateDistance } from "./calculate-distance";

test("calculate distance", t => {
  const distance = calculateDistance([0, 0], [0, 1]);
  const distance2 = calculateDistance([1, 0], [0, 0]);

  t.is(distance, 1);
  t.is(distance2, 1);
});
