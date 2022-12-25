import { Projectile, Unit } from "@battleground/core";

export interface SceneState {
  tick: number;
  units: Unit[];
  projectiles: Projectile[];
}
