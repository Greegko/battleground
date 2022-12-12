import { Battlefield } from "../../src";

export interface LoggerOptions {
  logTurnIterations?: number;
  logState?: {
    init?: boolean;
    turns?: number[];
    end?: boolean;
  };
}

export class TestLogger {
  private turnPassed = 0;

  constructor(private battlefield: Battlefield, private config: LoggerOptions) {
    if (config?.logState?.init) {
      console.log("Init");
      console.log(battlefield.getState());
    }
  }

  tick() {
    this.turnPassed++;

    if (this.config?.logTurnIterations && this.config?.logTurnIterations % this.turnPassed) {
      console.log("Turn", this.turnPassed);
    }

    if (this.config?.logState?.turns?.includes(this.turnPassed)) {
      console.log("Turn", this.turnPassed);
      console.log(this.battlefield.getState());
    }

    if (this.battlefield.isFinished && this.config?.logState?.end) {
      console.log("End");
      console.log(this.battlefield.getState());
    }
  }
}

export const basicLoggerConfig = { logTurnIterations: 1, logState: { init: true, end: true } } as LoggerOptions;
