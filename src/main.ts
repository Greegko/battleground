import { Layer } from "konva/lib/Layer";
import { Stage } from "konva/lib/Stage";
import { Sprite } from "konva/lib/shapes/Sprite";
import { Text } from "konva/lib/shapes/Text";

import { ModManager } from "@mod/mod-manager";

import { Battleground } from "./battleground/battleground";
import { Owner, ProjectileSpriteData, UnitSpriteData } from "./renderer/renderer";

const container = document.getElementById("battleground") as HTMLDivElement;

const MOD = "hero_hours";

const modManager = new ModManager();
const battleground = new Battleground();
const layer = new Layer();
const stage = new Stage({
  container,
  width: window.innerWidth,
  height: window.innerHeight,
});

modManager.loadMod(MOD).then(mod => {
  battleground.init(mod);
  battleground.start();

  const renderer = battleground.getRenderer()!;
  renderer.hookSpriteCreationCallback((owner: Owner, sprite: UnitSpriteData | ProjectileSpriteData) => {
    const spriteNode = new Sprite({
      image: sprite.sprite,
      animation: sprite.animation,
      animations: sprite.animations,
    });

    layer.add(spriteNode);

    renderer.setSpriteReference(owner, spriteNode);
  });
});

stage.add(layer);

const tick_text = new Text({ fill: "#ffffff", x: 0, y: 0 });

battleground.setTickText(tick_text);

layer.add(tick_text);

layer.draw();
