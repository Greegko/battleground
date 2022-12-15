import * as ava from "ava";
import * as util from "util";

import { Battlefield, BattlefieldInit, BattlefieldState, Config } from "../../src";
import { PartialDeep } from "./partial-deep";
import { LoggerOptions, TestLogger } from "./test-logger";

util.inspect.defaultOptions.depth = 7;

type TestState = PartialDeep<BattlefieldState & { turn: number }>;
type ExpectedState = TestState | ((state: TestState, t: ava.ExecutionContext) => void);

interface TestConfig {
  config: Config;
  initialState: BattlefieldInit;
  turn?: number | boolean;
  runUntilFinish?: boolean;
  expectedState: ExpectedState;
  loggerConfig?: LoggerOptions;
  createPlayableLink?: boolean;
}

export function test(
  testName: string,
  { config, initialState, turn, runUntilFinish, expectedState, loggerConfig, createPlayableLink }: TestConfig,
) {
  ava.default(testName, t => {
    const battlefield = new Battlefield(config, null);
    battlefield.init(initialState);

    if (createPlayableLink) {
      const lzString = require("lz-string");
      const URL = "http://localhost:8080?mod=tester&initState=";

      const initState = encodeURIComponent(lzString.compressToBase64(JSON.stringify(initialState)));

      console.log("Playable url");
      console.log(URL + initState);
    }

    const logger = new TestLogger(battlefield, loggerConfig);

    let turnPassed = 0;
    for (let i = 0; i < turn; i++) {
      battlefield.tick();
      turnPassed++;
      logger.tick();

      if (battlefield.isFinished) break;
    }

    if (runUntilFinish) {
      while (!battlefield.isFinished) {
        battlefield.tick();
        turnPassed++;
        logger.tick();
      }
    }

    logger.testEnd();

    const gameState = battlefield.getState();
    const testExpectedState = (expectedState: ExpectedState) => {
      if (typeof expectedState === "object") {
        t.like({ turn: turnPassed, ...gameState }, expectedState);
      } else {
        expectedState({ turn: turnPassed, ...gameState }, t);
      }
    };

    if (Array.isArray(expectedState)) {
      expectedState.forEach(testExpectedState);
    } else {
      testExpectedState(expectedState);
    }
  });
}
