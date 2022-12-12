import { random } from "./random";

export function sample<T>(array: T[]): T {
  var length = array.length;
  return array[random(0, length - 1)];
}
