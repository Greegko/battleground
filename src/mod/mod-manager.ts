import { merge } from "lodash-es";

import { Mod, ModConfigFile, ModSpriteFile, ModUnitConfigFile } from "./interface";

const MODS_PATH = "mods";

export class ModManager {
  constructor() {}

  async loadMod(name: string): Promise<Mod> {
    const modBase = MODS_PATH + "/" + name;
    const configPromise = this.loadJSON<ModConfigFile>(modBase + "/config.json");

    const spritesPromise = this.loadJSON<ModSpriteFile>(modBase + "/sprites.json")
      .then(sprites => sprites.map(sprite => ({ [sprite.id]: filenameToImage(modBase + "/" + sprite.file) })))
      .then(objects => merge({}, ...objects));

    const unitsPromise = this.loadJSON<ModUnitConfigFile[]>(modBase + "/units.json");

    const [config, units, sprites] = await Promise.all([configPromise, unitsPromise, spritesPromise]);

    return { config, units, sprites };
  }

  async loadJSON<T>(file: string): Promise<T> {
    return fetch(file).then(x => x.json());
  }

  async fetchPNG(imagePath: string): Promise<ImageBitmap> {
    return fetch(imagePath)
      .then(x => x.blob())
      .then(x => createImageBitmap(x));
  }
}

function filenameToImage(file: string): HTMLImageElement {
  const image = new Image();
  image.src = file;

  return image;
}
