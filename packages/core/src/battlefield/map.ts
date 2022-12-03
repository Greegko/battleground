import { Projectile } from "../interface";
import { Context } from "./context";
import { UnitFilter } from "./unit-filter";

export class MapContext {
  constructor(private context: Context) {}

  projectiles: Projectile[] = [];

  addProjectile(projectile: Projectile) {
    this.projectiles.push(projectile);
  }

  landProjectile(projectile: Projectile) {
    const hitUnits = UnitFilter.filterBySeekConditions(
      this.context.unit.units,
      ["enemy-team", "alive", ["in-distance", { distance: projectile.area }]],
      { team: projectile.source.team, targetLocation: projectile.targetLocation },
    );

    hitUnits.forEach(unit => this.context.effect.applyEffect(projectile.effect, unit));
  }
}
