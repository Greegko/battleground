import { useContext, useEffect, useState } from "react";

import { LoopContext } from "../contexts";

interface AssetProps {
  id: string;
}

export const Asset = ({ id }: AssetProps) => {
  const loop = useContext(LoopContext);

  const [src, setSrc] = useState(undefined);

  useEffect(() => {
    loop.assetManager.getAssetAsBase64(id).then((base64) => setSrc(base64));
  }, [id]);

  if(!src) return null;

  return <img src={src} />;
};
