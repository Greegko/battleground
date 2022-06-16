import { Cordinate } from "src/interfaces";

export const calculateDisntance = (a: Cordinate, b: Cordinate) =>
  Math.sqrt(Math.pow(b[0] - a[0], 2) + Math.pow(b[1] - a[1], 2));
