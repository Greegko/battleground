export interface Unit {
  name: string;
  speed: number;
  size: number;
  hp: number;
  attack: {
    distance: number;
    dmg: number;
    animationTime: number;
    speed: number;
    projectile: {
      sprite_id: string;
      speed: number;
    };
  };
}
