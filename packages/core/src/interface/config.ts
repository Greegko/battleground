export type Config = {
  mapSize: [number, number];
  containerNode: HTMLDivElement;
  speed: number | "requestFrame";
  seed?: string;
};
