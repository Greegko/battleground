import { Mod, ModConfig, ModUnit, ModUnitConfig } from "./interface";

const MODS_PATH = "mods";

export class ModManager {
  constructor() {}

  async loadMod(name: string): Promise<Mod> {
    const modBase = MODS_PATH + "/" + name;
    const configPromise = this.loadJSON<ModConfig>(modBase + "/config.json");
    const unitsPromise = this.loadJSON<ModUnitConfig[]>(modBase + "/units.json").then(unitsConfig => {
      return Promise.all(
        unitsConfig.map(unit =>
          this.fetchPNG(modBase + "/" + unit.file).then(image => ({ ...unit, sprite: image } as ModUnit)),
        ),
      );
    });

    const [config, units] = await Promise.all([configPromise, unitsPromise]);

    return { config, units };
  }

  async loadJSON<T>(file: string): Promise<T> {
    return fetch(file).then(x => x.json());
  }

  async fetchPNG(imagePath: string): Promise<string> {
    return fetch(imagePath)
      .then(x => x.blob())
      .then(URL.createObjectURL);
  }
}
