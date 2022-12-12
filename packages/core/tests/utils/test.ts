import * as ava from "ava";
import * as util from "util";

import { Battlefield, BattlefieldInit, BattlefieldState, Config } from "../../src";
import { PartialDeep } from "./partial-deep";
import { DebugOptions, TestLogger } from "./test-logger";

util.inspect.defaultOptions.depth = 5;

type TestState = PartialDeep<BattlefieldState & { turn: number }>;
type ExpectedState = TestState | ((state: TestState) => void);

interface TestConfig {
  config: Config;
  initialState: BattlefieldInit;
  turn?: number | boolean;
  runUntilFinish?: boolean;
  expectedState: ExpectedState;
  debug?: DebugOptions;
}

export function test(
  testName: string,
  { config, initialState, turn, runUntilFinish, expectedState, debug }: TestConfig,
) {
  ava.default(testName, t => {
    const battlefield = new Battlefield(config, null);
    battlefield.init(initialState);

    const logger = new TestLogger(battlefield, debug);

    let turnPassed = 0;
    for (let i = 0; i < turn; i++) {
      battlefield.tick();
      turnPassed++;
      logger.tick();
    }

    if (runUntilFinish) {
      while (!battlefield.isFinished) {
        battlefield.tick();
        turnPassed++;
        logger.tick();
      }
    }
    const gameState = battlefield.getState();
    const testExpectedState = (expectedState: ExpectedState) => {
      if (typeof expectedState === "object") {
        t.like({ turn: turnPassed, ...gameState }, expectedState);
      } else {
        expectedState({ turn: turnPassed, ...gameState });
      }
    };

    if (Array.isArray(expectedState)) {
      expectedState.forEach(testExpectedState);
    } else {
      testExpectedState(expectedState);
    }
  });
}
