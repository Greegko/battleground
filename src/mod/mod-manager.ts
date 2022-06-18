import { Mod, ModConfigFile, ModSpriteFile, ModUnitConfigFile } from "./interface";

const MODS_PATH = "mods";

export class ModManager {
  constructor() {}

  async loadMod(name: string): Promise<Mod> {
    const modBase = MODS_PATH + "/" + name;
    const configPromise = this.loadJSON<ModConfigFile>(modBase + "/config.json");

    const spritesPromise = this.loadJSON<ModSpriteFile>(modBase + "/sprites.json")
      .then(sprites =>
        Promise.all(
          sprites.map(sprite =>
            this.fetchPNG(modBase + "/" + sprite.file).then(imageBitmap => ({ id: sprite.id, sprite: imageBitmap })),
          ),
        ),
      )
      .then(sprites =>
        sprites.reduce((acc, { id, sprite }) => ((acc[id] = sprite), acc), {} as Record<string, ImageBitmap>),
      );

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
