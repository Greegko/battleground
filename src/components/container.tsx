import { useEffect, useState } from "react";

import { Game } from "@game/game";
import { Renderer } from "@game/renderer";
import { ModManager } from "@mod/mod-manager";

import { Battlefield } from "./battlefield";

const MOD = "hero_hours";

export const Container = () => {
  const [modManager] = useState(() => new ModManager());
  const [game] = useState(() => new Game());
  const [renderer, setRenderer] = useState<Renderer>();

  useEffect(() => {
    modManager.loadMod(MOD).then(mod => {
      game.setMod(mod);
      game.start();

      setRenderer(new Renderer(game.getBattle()!, mod));
    });
  }, [modManager, game]);

  if (!renderer) return null;

  return <Battlefield renderer={renderer} />;
};
