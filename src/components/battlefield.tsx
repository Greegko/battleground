import { useEffect, useState } from "react";
import { Layer, Stage } from "react-konva";

import { Renderer, RendererState } from "@game/renderer";

import { FPS } from "./fps";
import { Unit } from "./unit";

export interface RendererProps {
  renderer: Renderer;
}

export const Battlefield = ({ renderer }: RendererProps) => {
  const [rendereState, setRendererState] = useState<RendererState>();

  useEffect(
    function tickRenderer() {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => tickRenderer());
        renderer.calculateState();
        setRendererState(renderer.getState());
      });
    },
    [renderer],
  );

  return (
    <Stage width={window.innerWidth} height={window.innerHeight}>
      <Layer>
        <FPS />
        {rendereState && rendereState.units.map((unit, i) => <Unit key={i} unit={unit} />)}
      </Layer>
    </Stage>
  );
};
