import { drop, isEmpty, prepend, take } from "ramda";

export const chunk = function chunkFn<T>(list: T[], n: number): T[][] {
  return isEmpty(list) ? [] : prepend(take(n, list), chunkFn(drop(n, list), n));
};
