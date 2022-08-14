import { without } from "lodash-es";

import * as PIXI from "pixi.js";
import { Application, Container } from "pixi.js";

import { AssetManager, Config, Projectile, Unit } from "../interface";
import { ProjectileAnimation } from "./projectile-animation";
import { UnitAnimation } from "./unit-animation";

export interface SceneState {
  units: Unit[];
  projectiles: Projectile[];
}

export class BattlefieldRenderer {
  application: Application;
  container: Container = new Container();

  projectileAnimation: ProjectileAnimation;
  unitAnimation: UnitAnimation;

  constructor(config: Config, public assetManager: AssetManager) {
    this.application = new Application({
      width: config.mapSize[0],
      height: config.mapSize[1],
    });

    this.registerPixiInspector();

    config.containerNode.appendChild(this.application.view);

    this.projectileAnimation = new ProjectileAnimation(this);
    this.unitAnimation = new UnitAnimation(this);

    this.application.stage.addChild(this.container);
  }

  private lastState: SceneState = { units: [], projectiles: [] };

  renderScene(data: SceneState) {
    this.application.ticker.update(0);

    data.units.forEach(unit => this.unitAnimation.drawUnitAnimation(unit));
    data.projectiles.forEach(projectile => this.projectileAnimation.drawProjectileAnimation(projectile));

    const removedProjectiles = without(this.lastState.projectiles, ...data.projectiles);
    removedProjectiles.forEach(projectile => this.projectileAnimation.removeProjectile(projectile));

    this.lastState = {
      units: [...data.units],
      projectiles: [...data.projectiles],
    };
  }

  private registerPixiInspector() {
    (window as any).__PIXI_INSPECTOR_GLOBAL_HOOK__ &&
      (window as any).__PIXI_INSPECTOR_GLOBAL_HOOK__.register({ PIXI: PIXI });
  }
}
