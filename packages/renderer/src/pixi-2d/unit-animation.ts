import { GlowFilter } from "@pixi/filter-glow";

import gsap from "gsap";
import { Graphics, Sprite, Text } from "pixi.js";

import { Direction, EffectType, Unit, Vector, merge, subVector } from "@battleground/core";

import { BattlefieldRenderer } from "../interfaces/battlefield-renderer";
import { AnimatedSpriteUnit } from "./AnimatedSpriteUnit";

type AnimationState = "idle" | "move" | "attack" | "dead";

type UnitStatus = "shield-break";

const SHIELD_BREAK_ICON = "icons/spells/shield_break";

interface UnitTransformedState {
  hp: number;
  location: Vector;
  facing: Direction.Left | Direction.Right | undefined;
  animation: AnimationState;
  statuses: UnitStatus[];
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
  private statusesContainerNodes = new Map<Unit, Sprite>();

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
        statuses: [],
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

    if (oldState.statuses.toString() !== newState.statuses.toString()) {
      this.renderStatuses(unit, newState.statuses);
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
        this.healthbarNodes.get(unit)?.destroy();
        this.healthbarNodes.delete(unit);

        this.statusesContainerNodes.get(unit)?.destroy();
        this.statusesContainerNodes.delete(unit);

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

      this.renderHealthBar(unit);
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

    this.renderHealthBar(unit);

    return unitNode;
  }

  private renderStatuses(unit: Unit, statuses: UnitStatus[]) {
    let container = this.statusesContainerNodes.get(unit);

    if (statuses.length === 0) {
      container?.destroy();
      return;
    }

    if (!container) {
      container = new Sprite();
      container.scale.set(0.4);
      container.pivot.set(-unit.size - unit.size / 2, unit.size);
      container.position.copyFrom(unit.location);

      this.renderer.container.addChild(container);
      this.statusesContainerNodes.set(unit, container);
    }

    container.removeChildren();

    for (let status of statuses) {
      const texture = this.renderer.assetManager.getAsset(status);

      container.addChild(new Sprite(texture));
    }
  }

  private renderHealthBar(unit: Unit) {
    let healthbarNode = this.healthbarNodes.get(unit);

    if (!healthbarNode) {
      healthbarNode = new Graphics();
      healthbarNode.pivot.set(-unit.size * 0.1, -unit.size - 6);
      healthbarNode.position.copyFrom(unit.location);

      this.healthbarNodes.set(unit, healthbarNode);
      this.renderer.container.addChild(healthbarNode);
    }

    const percentage = unit.hp / unit.maxHp;

    const color = percentage > 0.6 ? 0x008000 : percentage > 0.3 ? 0xffff00 : 0xff0000;

    healthbarNode.clear();
    healthbarNode.beginFill(color);
    healthbarNode.drawRect(0, 0, unit.size * 0.8 * percentage, 5);
    healthbarNode.endFill();
  }

  private moveUnit(unit: Unit) {
    const unitNode = this.unitNodes.get(unit);

    const oldState = this.unitState.get(unit);
    const newState = this.transformUnitToState(unit);

    const diff = subVector(newState.location, oldState.location);

    unitNode.x += diff.x;
    unitNode.y += diff.y;

    const healthbarNode = this.healthbarNodes.get(unit);
    if (healthbarNode) {
      healthbarNode.position.copyFrom(unit.location);
    }

    const statusesContainerNode = this.statusesContainerNodes.get(unit);
    if (statusesContainerNode) {
      statusesContainerNode.position.copyFrom(unit.location);
    }
  }

  private transformUnitToState(unit: Unit): UnitTransformedState {
    const animation = (() => {
      if (unit.hp === 0) return "dead";
      if (
        unit.activeAction &&
        unit.activeAction.speed > 0 &&
        unit.actionsCooldowns.get(unit.activeAction.action) === 0 &&
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

    const statuses = (() => {
      const shieldBreakEffect = unit.effects.find(x => x.type === EffectType.Armor && (x as any).power < 0);

      return [shieldBreakEffect && SHIELD_BREAK_ICON].filter(x => x) as UnitStatus[];
    })();

    return {
      hp: unit.hp,
      location: unit.location,
      facing,
      animation,
      statuses,
    };
  }

  private setUnitFacingDirection(unit: Unit, direction: Direction.Left | Direction.Right) {
    const node = this.unitNodes.get(unit);

    node.width *= -1;
    node.x += direction === Direction.Left ? node.width : -node.width;
  }
}
