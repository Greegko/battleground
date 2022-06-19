import { useEffect, useState } from "react";
import { Sprite } from "react-konva";

import { Owner, ProjectileSpriteData, Renderer, UnitSpriteData } from "@game/renderer";

interface RendererObjectsProp {
  renderer: Renderer;
}

interface RenderedSprite {
  id: number;
  owner: Owner;
  sprite: UnitSpriteData | ProjectileSpriteData;
}

export const RendererObjects = ({ renderer }: RendererObjectsProp) => {
  const [renderedObjects, setRenderedObjects] = useState<RenderedSprite[]>([]);

  useEffect(() => {
    renderer.hookSpriteCreationCallback((owner: Owner, sprite: UnitSpriteData | ProjectileSpriteData, id: number) => {
      setRenderedObjects(objects => [...objects, { owner, sprite, id }]);
    });

    renderer.hookSpriteDestroyCallback((owner: Owner) => {
      setRenderedObjects(objects => objects.filter(x => x.owner !== owner));
    });
  }, [renderer]);

  return (
    <>
      {renderedObjects.map(x => (
        <Sprite
          key={x.id}
          ref={image => renderer.setSpriteReference(x.owner, image!)}
          image={x.sprite.sprite}
          animation={x.sprite.animation}
          animations={x.sprite.animations}
          width={x.sprite.sprite.height}
          height={x.sprite.sprite.height}
          crop={{ x: 0, y: 0, width: x.sprite.sprite.height, height: x.sprite.sprite.height }}
        />
      ))}
    </>
  );
};
