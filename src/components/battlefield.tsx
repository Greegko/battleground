import { Layer, Stage } from "react-konva";

import { Renderer } from "@game/renderer";

import { RendererObjects } from "./renderer-objects";

export interface RendererProps {
  renderer: Renderer;
}

export const Battlefield = ({ renderer }: RendererProps) => {
  return (
    <Stage width={window.innerWidth} height={window.innerHeight}>
      <Layer listening={false}>
        <RendererObjects renderer={renderer} />
      </Layer>
    </Stage>
  );
};
