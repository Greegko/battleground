import { useEffect, useState } from "react";
import { Image } from "react-konva";

import { Cordinate } from "@game/interface";
import { RendererProjectile } from "@game/renderer";
import { calculateAngle } from "@utils/calculate-angle";
import { calculateDistance } from "@utils/calculate-distance";
import { transformCordinate } from "@utils/transform-cordinate";

export interface ProjectProps {
  projectile: RendererProjectile;
}

export const Projectile = ({ projectile }: ProjectProps) => {
  const [cordinate, setCordinate] = useState<Cordinate>();
  const [angle] = useState(
    () => (calculateAngle(projectile.sourceLocation, projectile.targetLocation) * 180) / Math.PI,
  );

  useEffect(() => {
    let lastCordinate = projectile.sourceLocation;

    setCordinate(lastCordinate);

    const interval = setInterval(() => {
      lastCordinate = transformCordinate(lastCordinate, projectile.targetLocation, 100);

      setCordinate(lastCordinate);

      if (calculateDistance(lastCordinate, projectile.targetLocation) < 50) {
        clearInterval(interval);
      }
    }, 10);

    return () => clearInterval(interval);
  }, []);

  if (!cordinate) return null;

  return (
    <Image
      x={cordinate[0]}
      y={cordinate[1]}
      rotation={angle}
      image={projectile.sprite}
      scale={{ x: 2, y: 2 }}
      width={projectile.sprite.height}
      height={projectile.sprite.height}
    />
  );
};
