import { values } from "lodash-es";

import { ISpritesheetData, Loader, Spritesheet, Texture } from "pixi.js";

import { SpriteConfig } from "@battleground/core";

const HERO_HOURS_UNIT_ANIMATIONS: SpriteConfig["animations"] = {
  idle: [0, 4],
  move: [4, 8],
  attack: [8, 12],
  hurt: [12, 16],
  die: [16, 20],
  dead: 19,
};

const frame = (size: number) => (index: number) => ({ x: index * size, y: 0, w: size, h: size });

const frame16px = frame(16);

const atlasJsonFactory: (id: string) => ISpritesheetData = (id: string) => ({
  frames: {
    [id + "_0"]: { frame: frame16px(0) },
    [id + "_1"]: { frame: frame16px(1) },
    [id + "_2"]: { frame: frame16px(2) },
    [id + "_3"]: { frame: frame16px(3) },
    [id + "_4"]: { frame: frame16px(4) },
    [id + "_5"]: { frame: frame16px(5) },
    [id + "_6"]: { frame: frame16px(6) },
    [id + "_7"]: { frame: frame16px(7) },
    [id + "_8"]: { frame: frame16px(8) },
    [id + "_9"]: { frame: frame16px(9) },
    [id + "_10"]: { frame: frame16px(10) },
    [id + "_11"]: { frame: frame16px(11) },
    [id + "_12"]: { frame: frame16px(12) },
    [id + "_13"]: { frame: frame16px(13) },
    [id + "_14"]: { frame: frame16px(14) },
    [id + "_15"]: { frame: frame16px(15) },
    [id + "_16"]: { frame: frame16px(16) },
    [id + "_17"]: { frame: frame16px(17) },
    [id + "_18"]: { frame: frame16px(18) },
    [id + "_19"]: { frame: frame16px(19) },
  },
  animations: {
    bundled_animations: [
      id + "_0",
      id + "_1",
      id + "_2",
      id + "_3",
      id + "_4",
      id + "_5",
      id + "_6",
      id + "_7",
      id + "_8",
      id + "_9",
      id + "_10",
      id + "_11",
      id + "_12",
      id + "_13",
      id + "_14",
      id + "_15",
      id + "_16",
      id + "_17",
      id + "_18",
      id + "_19",
    ],
  },
  meta: {
    scale: "1",
  },
});

const skeleton = require("./units/bone_golem_spritesheet.png?url");
const archer = require("./units/heavy_archer_spritesheet.png?url");
const inquisitor = require("./units/inquisitor_spritesheet.png?url");

const inn = require("./buildings/inn.png?url");
const projectile = require("./projectiles/blue_projectile_sprite.png?url");

const units = { skeleton, archer, inquisitor };
const static_asset = { inn, projectile };

export class HeroHoursAssetsLoader {
  private unit_spritesheet: Record<string, Spritesheet> = {};
  private static_asset: Record<string, Texture> = {};

  async init() {
    const loader = new Loader();

    for (let k in units) loader.add(k, (units as any)[k]);
    for (let k in static_asset) loader.add(k, (static_asset as any)[k]);

    return new Promise(resolve => loader.load(resolve))
      .then(() => {
        for (let k in units)
          this.unit_spritesheet[k] = new Spritesheet(loader.resources[k].texture, atlasJsonFactory(k));
        for (let k in static_asset) this.static_asset[k] = loader.resources[k].texture;

        return Promise.all(values(this.unit_spritesheet).map(x => x.parse()));
      })
      .then(() => loader.destroy());
  }

  getAsset(assetId: string): SpriteConfig {
    if (this.unit_spritesheet[assetId]) {
      return this.getUnitAsset(assetId);
    } else if (this.static_asset[assetId]) {
      return { texture: [this.static_asset[assetId]], animations: HERO_HOURS_UNIT_ANIMATIONS };
    } else {
      throw Error("Asset not loaded!");
    }
  }

  private getUnitAsset(assetId: string): SpriteConfig {
    const texture = this.unit_spritesheet[assetId].animations["bundled_animations"];

    return {
      texture,
      animations: HERO_HOURS_UNIT_ANIMATIONS,
    };
  }
}
