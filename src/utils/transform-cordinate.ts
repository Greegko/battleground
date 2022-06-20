import { Cordinate } from "../interface";
import { calculateAngle } from "./calculate-angle";

export function transformCordinate(cordinate: Cordinate, targetCordinate: Cordinate, distance: number): Cordinate {
  const rot = calculateAngle(cordinate, targetCordinate);

  const deltaX = Math.cos(rot) * distance;
  const deltaY = Math.sin(rot) * distance;

  return [cordinate[0] + deltaX, cordinate[1] + deltaY];
}
