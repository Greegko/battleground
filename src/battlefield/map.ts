import { Projectile } from "../interface";
import { getVectorDistance } from "../utils/vector";
import { Context } from "./context";

export class MapContext {
  constructor(private context: Context) {}

  projectiles: Projectile[] = [];

  addProjectile(projectile: Projectile) {
    this.projectiles.push(projectile);
  }

  landProjectile(projectile: Projectile) {
    const hitUnits = this.context.unit.units
      .filter(unit => projectile.source.team !== unit.team)
      .filter(unit => unit.hp > 0)
      .filter(unit => getVectorDistance(projectile.targetLocation, unit.location) <= unit.size + projectile.area);

    hitUnits.forEach(unit => this.context.effect.applyEffect(projectile.effect, unit));
  }
}
