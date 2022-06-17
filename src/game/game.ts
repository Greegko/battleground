import { Unit } from "../interfaces";
import { Battle } from "./battle";

export class Game {
  private battle: Battle | undefined;

  start(): void {
    const units = Array(100)
      .fill(null)
      .map(() => ({ speed: 1 } as Unit));
    this.battle = new Battle(units, { size: 1000 });

    setInterval(() => this.battle!.tick(), 10);
  }

  getBattle(): Battle | undefined {
    return this.battle;
  }
}
