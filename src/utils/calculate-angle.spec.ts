import test from "ava";

import { calculateAngle } from "./calculate-angle";

test("calculate angle", t => {
  const angle = calculateAngle([0, 0], [1, 0]);
  const angle2 = calculateAngle([0, 0], [0, 1]);

  t.is(angle, 0);
  t.is(angle2, 1.5707963267948966);
  t.is((angle2 * 180) / Math.PI, 90);

  console.log("X", Math.cos(angle2));
  console.log("Y", Math.sin(angle2));
});
