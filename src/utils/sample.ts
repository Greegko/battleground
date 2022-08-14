import { randomInt } from "./random-int";

export function sample<T>(array: T[]): T {
  var length = array.length;
  return array[randomInt(0, length - 1)];
}
