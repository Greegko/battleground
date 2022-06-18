import test from "ava";

import { calculateDisntance } from "./calculate-distance";

test("calculate distance", t => {
  const distance = calculateDisntance([0, 0], [0, 1]);
  const distance2 = calculateDisntance([1, 0], [0, 0]);

  t.is(distance, 1);
  t.is(distance2, 1);
});
