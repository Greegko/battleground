import { head, sortBy } from "lodash-es";

import { calculateDistance } from "@utils/calculate-distance";

import { Cordinate } from "../interface";
import { UnitState } from "./interface";

export function closestUnit(unit: UnitState, units: UnitState[]): UnitState | undefined {
  return head(sortBy(units, x => calculateDistance(unit.cordinate, x.cordinate)));
}

export function getUnitsInDistance(location: Cordinate, area: number, units: UnitState[]): UnitState[] {
  return units.filter(unit => calculateDistance(unit.cordinate, location) <= area);
}
