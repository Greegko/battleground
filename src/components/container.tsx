import { useEffect, useState } from "react";

import { Game } from "../game/game";
import { Renderer } from "../game/renderer";
import { Battlefield } from "./battlefield";

export const Container = () => {
  const [game] = useState(() => new Game());
  const [renderer, setRenderer] = useState<Renderer>();

  useEffect(() => {
    game.start();
    setRenderer(new Renderer(game.getBattle()!));
  }, [game]);

  if (!renderer) return null;

  return <Battlefield renderer={renderer} />;
};
