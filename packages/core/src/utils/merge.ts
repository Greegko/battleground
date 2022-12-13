import { mergeDeepWith } from "ramda";

function mergeWithUndefined<A, B>(a: A, b: B): A | B {
  return b === undefined ? a : b;
}

export const merge = <S, T>(a: S, b: T): S & T => mergeDeepWith(mergeWithUndefined, a, b);
