import { useEffect, useState } from "react";

import { Game } from "@game/game";
import { ModManager } from "@mod/mod-manager";

import { Battlefield } from "./battlefield";

const MOD = "hero_hours";

export const Container = () => {
  const [modManager] = useState(new ModManager());
  const [game, setGame] = useState<Game>();

  useEffect(() => {
    modManager.loadMod(MOD).then(mod => {
      const game = new Game();
      game.init(mod);
      game.start();

      setGame(game);
    });
  }, []);

  if (!game) return null;

  return <Battlefield renderer={game.getRenderer()!} />;
};
