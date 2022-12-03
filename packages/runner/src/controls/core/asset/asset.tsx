import { useContext } from "react";

import { LoopContext } from "../contexts";

interface AssetProps {
  id: string;
}

export const Asset = ({ id }: AssetProps) => {
  const loop = useContext(LoopContext);

  return <img src={loop.assetManager.getAsset(id)} />;
};
