export interface Unit {
  name: string;
  speed: number;
  size: number;
  hp: number;
  attack: {
    distance: number;
    dmg: number;
    recover: number;
    speed: number;
  };
}
