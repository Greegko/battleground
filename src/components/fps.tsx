import { Text } from "react-konva";

let lastCalledTime = Date.now();

export const FPS = () => {
  const delta = (Date.now() - lastCalledTime) / 1000;
  lastCalledTime = Date.now();

  return <Text text={"FPS: " + Math.floor(1 / delta)} />;
};
