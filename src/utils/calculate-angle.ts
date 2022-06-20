import { Cordinate } from "../interface";

export const calculateAngle = (a: Cordinate, b: Cordinate) => Math.atan2(b[1] - a[1], b[0] - a[0]);
