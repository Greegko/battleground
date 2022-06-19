import { useEffect, useState } from "react";
import { Image, Text } from "react-konva";

import { Owner, Renderer } from "@game/renderer";

interface RendererObjectsProp {
  renderer: Renderer;
}

interface RenderedSprite {
  id: number;
  owner: Owner;
  sprite: ImageBitmap;
}

export const RendererObjects = ({ renderer }: RendererObjectsProp) => {
  const [renderedObjects, setRenderedObjects] = useState<RenderedSprite[]>([]);

  useEffect(() => {
    renderer.hookSpriteCreationCallback((owner: Owner, sprite: ImageBitmap, id: number) => {
      setRenderedObjects(objects => [...objects, { owner, sprite, id }]);
    });

    renderer.hookSpriteDestroyCallback((owner: Owner) => {
      setRenderedObjects(objects => objects.filter(x => x.owner !== owner));
    });
  }, [renderer]);

  return (
    <>
      <Text text={renderer.getRendererObjectsList().length.toString()} />
      {renderedObjects.map(x => (
        <Image
          key={x.id}
          ref={image => renderer.setImageReference(x.owner, image!)}
          image={x.sprite}
          width={x.sprite.height}
          height={x.sprite.height}
          crop={{ x: 0, y: 0, width: x.sprite.height, height: x.sprite.height }}
        />
      ))}
    </>
  );
};
