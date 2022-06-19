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
  const [cordinate, setCordinate] = useState<Cordinate | null>(projectile.sourceLocation);
  const [angle] = useState(
    () => (calculateAngle(projectile.sourceLocation, projectile.targetLocation) * 180) / Math.PI,
  );

  useEffect(() => {
    if (cordinate === null) return;

    if (calculateDistance(cordinate, projectile.targetLocation) < 50) setCordinate(null);

    setCordinate(transformCordinate(cordinate, projectile.targetLocation, 100));
  });

  console.log("Rendered Projectile");

  if (cordinate === null) return null;

  return (
    <Image
      perfectDrawEnabled={false}
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
