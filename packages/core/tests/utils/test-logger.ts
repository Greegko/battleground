import { Battlefield } from "../../src";

export interface DebugOptions {
  logTurnIterations?: number;
  logState?: {
    init?: boolean;
    turns?: number[];
  };
}

export class TestLogger {
  private turnPassed = 0;

  constructor(private battlefield: Battlefield, private config: DebugOptions) {
    if (config?.logState?.init) {
      console.log("Init state");
      console.log(battlefield.getState());
    }
  }

  tick() {
    this.turnPassed++;

    if (this.config?.logTurnIterations && this.config?.logTurnIterations % this.turnPassed) {
      console.log("Turn", this.turnPassed);
    }

    if (this.config?.logState?.turns.includes(this.turnPassed)) {
      console.log("Turn", this.turnPassed);
      console.log(this.battlefield.getState());
    }
  }
}

export const basicDebugInfos = { logTurnIterations: 1, logState: { init: true, turns: [1, 5, 10] } } as DebugOptions;
