import { useEffect, useState } from "react";
import { Image } from "react-konva";

import { Cordinate } from "@game/interface";
import { RendererProjectile } from "@game/renderer";

export interface ProjectProps {
  projectile: RendererProjectile;
}

export const Projectile = ({ projectile }: ProjectProps) => {
  const [cordinate, setCordinate] = useState<Cordinate>();

  useEffect(() => {
    setCordinate(projectile.sourceLocation);

    const interval = setInterval(() => setCordinate(cordinate), 100);

    return () => clearInterval(interval);
  }, []);

  return (
    cordinate && (
      <Image
        x={cordinate[0]}
        y={cordinate[1]}
        image={projectile.sprite}
        width={projectile.sprite.height}
        height={projectile.sprite.height}
      />
    )
  );
};
