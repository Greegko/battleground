import { Unit } from "@game/interface";

export interface ModUnitConfigFile extends Unit {
  sprite_id: string;
}

export interface ModConfigFile {
  spriteDefinition: {
    frame: {
      idle: [number, number];
      walk: [number, number];
      attack: [number, number];
      hurt: [number, number];
      death: [number, number];
    };
  };
}

export type ModSpriteFile = { file: string; id: string }[];

export interface ModUnit extends ModUnitConfigFile {}

export interface Mod {
  config: ModConfigFile;
  units: ModUnit[];
  sprites: Record<string, ImageBitmap>;
}
