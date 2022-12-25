import { Graphics } from "pixi.js";

import { Battlefield, SpellID, Unit, Vector } from "@battleground/core";

import { BattlefieldRenderer } from "../interfaces/battlefield-renderer";

export class SpellSelection {
  constructor(private renderer: BattlefieldRenderer, private battlefield: Battlefield) {}

  private circleGraphics = new Graphics();
  private spellId: SpellID | null;
  private position: Vector | null;

  init() {
    this.renderer.container.addChild(this.circleGraphics);
  }

  startSpellSelection(spellId: SpellID, position: Vector) {
    this.spellId = spellId;
    this.position = position;

    this.highlightUnitSelection();
    this.drawSelectionRange();
  }

  setSpellPosition(position: Vector) {
    this.position = position;

    this.highlightUnitSelection();
    this.drawSelectionRange();
  }

  stopSpellSelection(cast: boolean) {
    if (cast) {
      this.battlefield.spellsContext.castSpell(this.spellId, this.position);
    }

    this.position = null;
    this.spellId = null;

    this.clearSelectionRange();
    this.highlightUnitSelection();
  }

  private highlightUnitSelection() {
    let units: Unit[] = [];
    if (this.spellId) {
      units = this.battlefield.spellsContext.getTargetUnits(this.spellId, this.position);
    } else {
      units = [];
    }

    this.renderer.selectUnits(units);
  }

  private drawSelectionRange() {
    const spellRange = this.battlefield.spellsContext.getSpellRange(this.spellId);

    this.clearSelectionRange();
    this.circleGraphics.alpha = 0.1;
    this.circleGraphics.beginFill(0xffffff);
    this.circleGraphics.drawCircle(this.position.x, this.position.y, spellRange);
    this.circleGraphics.endFill();
  }

  private clearSelectionRange() {
    this.circleGraphics.clear();
  }
}
