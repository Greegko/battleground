import { Unit } from "@game/interface";

export interface ModUnitConfig extends Unit {
  file: string;
}

export interface ModConfig {
  spriteDefinition: {
    frame: {
      idle: [number, number];
      walk: [number, number];
      attack: [number, number];
      hurt: [number, number];
      death: [number, number];
      corpse: [number, number];
    };
  };
}

export interface ModUnit extends ModUnitConfig {
  sprite: ImageBitmap;
}

export interface Mod {
  config: ModConfig;
  units: ModUnit[];
}
