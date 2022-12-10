import { GlowFilter } from "@pixi/filter-glow";
import { merge } from "lodash-es";

import gsap from "gsap";
import { Graphics, Text } from "pixi.js";

import { Direction, Unit } from "../interface";
import { Vector } from "../utils/vector";
import { subVector } from "../utils/vector";
import { AnimatedSpriteUnit } from "./AnimatedSpriteUnit";
import { BattlefieldRenderer } from "./battlefield-renderer";

type AnimationState = "idle" | "move" | "attack" | "dead";

interface UnitTransformedState {
  hp: number;
  location: Vector;
  facing: Direction.Left | Direction.Right | undefined;
  animation: AnimationState;
}

interface UnitRenderState {
  selected: boolean;
}

type UnitState = UnitTransformedState & UnitRenderState;

export class UnitAnimation {
  constructor(private renderer: BattlefieldRenderer) {}

  private unitState = new Map<Unit, UnitState>();

  private unitNodes = new Map<Unit, AnimatedSpriteUnit>();
  private healthbarNodes = new Map<Unit, Graphics>();

  drawUnitAnimation(unit: Unit) {
    let node = this.unitNodes.get(unit);

    if (!node) {
      node = this.createUnitNode(unit);

      this.unitState.set(unit, {
        facing: Direction.Right,
        animation: "idle",
        hp: unit.hp,
        location: unit.location,
        selected: false,
      });
    }

    const oldState = this.unitState.get(unit);
    const newState = this.transformUnitToState(unit);

    if (newState.facing && oldState.facing !== newState.facing) {
      this.setUnitFacingDirection(unit, newState.facing);
    }

    if (newState.location.x !== oldState.location.x || newState.location.y !== oldState.location.y) {
      this.moveUnit(unit);
    }

    if (newState.animation !== oldState.animation) {
      if (oldState.animation === "dead") {
        node.setState("idle");
      }

      if (newState.animation === "idle") {
        node.setState("idle");
      }

      if (newState.animation === "move") {
        node.setState("move");
      }

      if (newState.animation === "attack") {
        node.setState("attack");
      }

      if (newState.animation === "dead") {
        const healthbarNode = this.healthbarNodes.get(unit);
        healthbarNode.destroy();
        this.healthbarNodes.delete(unit);

        node.setState("die");

        node.onLoop = () => {
          node.setState("dead");
          delete node.onLoop;
        };
      }
    }

    if (oldState.hp !== newState.hp && newState.hp > 0) {
      if (unit.maxHp > newState.hp) {
        this.createNumberTextAnimation(unit.location, oldState.hp - newState.hp, "red");
      }

      if (oldState.hp < newState.hp) {
        this.createNumberTextAnimation(unit.location, Math.abs(oldState.hp - newState.hp), "green");
      }

      if (oldState.animation === "dead" && newState.animation !== "dead") {
        this.createHealthBar(unit);
      }

      this.createHealthBar(unit);
    }

    this.unitState.set(unit, merge(oldState, newState));
  }

  clearAllUnitsSelection() {
    [...this.unitState.entries()].forEach(([unit]) => this.unselectUnit(unit));
  }

  selectUnit(unit: Unit) {
    const node = this.unitNodes.get(unit);
    const oldState = this.unitState.get(unit);

    node.filters = [new GlowFilter()];

    this.unitState.set(unit, merge(oldState, { selected: true }));
  }

  unselectUnit(unit: Unit) {
    const node = this.unitNodes.get(unit);
    const oldState = this.unitState.get(unit);
    node.filters = [];

    this.unitState.set(unit, merge(oldState, { selected: false }));
  }

  private createNumberTextAnimation(location: Vector, val: number, color: string) {
    const text = new Text(val, { fontSize: 14, fill: color });
    text.x = location.x + 12;
    text.y = location.y;

    gsap.to(text, {
      x: text.x + 5,
      y: text.y - 20,
      duration: 1,
      onComplete: () => text.destroy(),
    });

    this.renderer.container.addChild(text);
  }

  private createUnitNode(unit: Unit) {
    const unitSprite = this.renderer.assetManager.getSprite(unit.spriteId);

    const unitNode = new AnimatedSpriteUnit(unitSprite.texture, unitSprite.animations, "idle");

    unitNode.animationSpeed = 0.075;

    unitNode.position.copyFrom(unit.location);

    const baseRatio = unit.size / unitNode.height;
    unitNode.scale.x = baseRatio;
    unitNode.scale.y = baseRatio;

    this.unitNodes.set(unit, unitNode);

    this.renderer.container.addChild(unitNode);

    this.createHealthBar(unit);

    return unitNode;
  }

  private createHealthBar(unit: Unit) {
    if (this.healthbarNodes.has(unit)) {
      const prevNode = this.healthbarNodes.get(unit);
      prevNode.destroy();
    }

    const percentage = unit.hp / unit.maxHp;

    const color = percentage > 0.6 ? 0x008000 : percentage > 0.3 ? 0xffff00 : 0xff0000;

    const healthbarNode = new Graphics();
    healthbarNode.beginFill(color);
    healthbarNode.drawRect(0, 0, unit.size * 0.8 * percentage, 5);
    healthbarNode.endFill();

    healthbarNode.x = unit.location.x + unit.size * 0.1;
    healthbarNode.y = unit.location.y + unit.size + 6;

    this.healthbarNodes.set(unit, healthbarNode);

    this.renderer.container.addChild(healthbarNode);
  }

  private moveUnit(unit: Unit) {
    const unitNode = this.unitNodes.get(unit);
    const healthbarNode = this.healthbarNodes.get(unit);

    const oldState = this.unitState.get(unit);
    const newState = this.transformUnitToState(unit);

    const diff = subVector(newState.location, oldState.location);

    unitNode.x += diff.x;
    unitNode.y += diff.y;

    healthbarNode.x = unit.location.x + unit.size * 0.1;
    healthbarNode.y = unit.location.y + unit.size + 6;
  }

  private transformUnitToState(unit: Unit): UnitTransformedState {
    const animation = (() => {
      if (unit.hp === 0) return "dead";
      if (
        unit.activeAction &&
        unit.activeAction.speed > 0 &&
        !unit.activeAction.action.state.cooldown &&
        unit.activeAction.action.animation
      )
        return unit.activeAction.action.animation;

      if (unit.moveDirection) return "move";

      return "idle";
    })();

    const facing = (() => {
      if (unit.activeAction?.targetUnit) {
        return subVector(unit.location, unit.activeAction.targetUnit.location).x > 0 ? Direction.Left : Direction.Right;
      }

      if (unit.moveDirection) {
        return unit.moveDirection.x < 0 ? Direction.Left : Direction.Right;
      }

      return undefined;
    })();

    return {
      hp: unit.hp,
      location: unit.location,
      facing,
      animation,
    };
  }

  private setUnitFacingDirection(unit: Unit, direction: Direction.Left | Direction.Right) {
    const node = this.unitNodes.get(unit);

    node.width *= -1;
    node.x += direction === Direction.Left ? node.width : -node.width;
  }
}
