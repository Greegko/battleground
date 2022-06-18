import { useEffect, useState } from "react";
import { Image } from "react-konva";

import { RendererUnit } from "@game/renderer";

export interface UnitProps {
  unit: RendererUnit;
}

const UNIT_STATE = 0;

export const Unit = ({ unit }: UnitProps) => {
  const [animationState, setAnimationState] = useState<number>(0);

  useEffect(() => {
    const timeout = setInterval(() => setAnimationState(x => ((x + 1) % 4) + 4 * UNIT_STATE), 200);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <Image
      x={unit.cordinate[0]}
      y={unit.cordinate[1]}
      image={unit.sprite}
      width={unit.sprite.height}
      height={unit.sprite.height}
      scale={{ x: 2, y: 2 }}
      crop={{ x: animationState * unit.sprite.height, y: 0, width: unit.sprite.height, height: unit.sprite.height }}
    />
  );
};
