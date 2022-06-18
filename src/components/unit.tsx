import { useEffect, useState } from "react";
import { Image } from "react-konva";

import { RendererUnit, RendererUnitState } from "@game/renderer";

export interface UnitProps {
  unit: RendererUnit;
}

export const Unit = ({ unit }: UnitProps) => {
  const [animationState, setAnimationState] = useState<number>(0);

  useEffect(() => {
    if (unit.state === RendererUnitState.Dead) {
      setTimeout(() => setAnimationState(16), 200);
      setTimeout(() => setAnimationState(17), 400);
      setTimeout(() => setAnimationState(18), 600);
      setTimeout(() => setAnimationState(19), 800);

      return;
    }

    const timeout = setInterval(() => setAnimationState(x => ((x + 1) % 4) + 4 * unit.state), 200);
    return () => clearTimeout(timeout);
  }, [unit.state]);

  return (
    <Image
      x={unit.cordinate[0]}
      y={unit.cordinate[1]}
      image={unit.unit.sprite}
      width={unit.unit.sprite.height}
      height={unit.unit.sprite.height}
      scale={{ x: unit.unit.size + 1, y: unit.unit.size + 1 }}
      crop={{
        x: animationState * unit.unit.sprite.height,
        y: 0,
        width: unit.unit.sprite.height,
        height: unit.unit.sprite.height,
      }}
    />
  );
};
