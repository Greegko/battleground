import { Battlefield } from "../../src";

export interface LoggerOptions {
  logTurnIterations?: number;
  logState?: {
    init?: boolean;
    turns?: number[];
    end?: boolean;
    testEnd?: boolean;
  };
}

export class TestLogger {
  constructor(private battlefield: Battlefield, private config: LoggerOptions) {
    if (config?.logState?.init) {
      console.log("Init");
      console.log(battlefield.getState());
    }
  }

  tick() {
    const state = this.battlefield.getState();

    if (this.config?.logTurnIterations && this.config?.logTurnIterations % state.tick) {
      console.log("Turn", state.tick);
    }

    if (this.config?.logState?.turns?.includes(state.tick)) {
      console.log("Turn", state.tick);
      console.log(state);
    }

    if (this.battlefield.isFinished && this.config?.logState?.end) {
      console.log("End");
      console.log(state);
    }
  }

  testEnd() {
    const state = this.battlefield.getState();
    if (this.config?.logState?.testEnd) {
      console.log("Test End - Turn", state.tick);
      console.log(state);
    }
  }
}

export const basicLoggerConfig = { logTurnIterations: 1, logState: { init: true, end: true } } as LoggerOptions;
