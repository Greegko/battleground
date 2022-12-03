import { Sprite } from "pixi.js";

import { Projectile } from "../interface";
import { multVector, normVector, subVector } from "../utils/vector";
import { AnimatedSpriteUnit } from "./AnimatedSpriteUnit";
import { BattlefieldRenderer } from "./battlefield-renderer";

export class ProjectileAnimation {
  constructor(private renderer: BattlefieldRenderer) {}

  private projectileNodes = new Map<Projectile, Sprite>();

  removeProjectile(projectile: Projectile) {
    let node = this.projectileNodes.get(projectile);

    node.destroy();

    this.projectileNodes.delete(projectile);
  }

  drawProjectileAnimation(projectile: Projectile) {
    let node = this.projectileNodes.get(projectile);

    if (!node) {
      node = this.createProjectileNode(projectile);
    }

    const d = multVector(normVector(subVector(projectile.targetLocation, projectile.sourceLocation)), projectile.speed);

    node.x += d.x;
    node.y += d.y;
  }

  private createProjectileNode(projectile: Projectile): Sprite {
    const projectileConfig = this.renderer.assetManager.getSprite(projectile.projectileId);
    const projectileNode = new AnimatedSpriteUnit(projectileConfig.texture, projectileConfig.animations, "idle");

    projectileNode.position.copyFrom(projectile.sourceLocation);
    projectileNode.anchor.set(0.5, 0);

    this.projectileNodes.set(projectile, projectileNode);

    this.renderer.container.addChild(projectileNode);

    return projectileNode;
  }
}
