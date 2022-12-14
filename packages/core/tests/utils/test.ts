import * as ava from "ava";
import { max } from "ramda";
import * as util from "util";

import { Battlefield, BattlefieldConfig, BattlefieldInit, BattlefieldState } from "../../src";
import { createPlayableUrl } from "./create-playable-url";
import { PartialDeep } from "./partial-deep";
import { LoggerOptions, TestLogger } from "./test-logger";

util.inspect.defaultOptions.depth = 7;

type TestState = PartialDeep<BattlefieldState & { turn: number }>;
type ExpectedState = TestState | ((state: TestState, t: ava.ExecutionContext) => void);

interface TestConfig {
  seed?: string;
  initialState: BattlefieldInit;
  turn?: number | boolean;
  runUntilFinish?: boolean;
  expectedState: ExpectedState | ExpectedState[];
  loggerConfig?: LoggerOptions;
  createPlayableLink?: boolean;
}

function getMapSize(initialState: BattlefieldInit): [number, number] {
  const xs = initialState.units.map(x => x.location.x + x.size + 5);
  const ys = initialState.units.map(x => x.location.y + x.size + 5);
  const maxX = xs.reduce(max, 0);
  const maxY = ys.reduce(max, 0);

  return [maxX, maxY];
}

export function test(
  testName: string,
  { initialState, turn, runUntilFinish, expectedState, loggerConfig, createPlayableLink, seed }: TestConfig,
) {
  ava.default(testName, t => {
    const config = {
      mapSize: getMapSize(initialState),
      speed: null,
      seed: seed || Math.random().toString(),
    } as BattlefieldConfig;
    const battlefield = new Battlefield(config, null);
    battlefield.init(initialState);

    if (createPlayableLink) {
      console.log("Playable url");
      console.log(createPlayableUrl(initialState, seed));
    }

    const logger = new TestLogger(battlefield, loggerConfig);

    for (let i = 0; i < turn; i++) {
      battlefield.tick();
      logger.tick();

      if (battlefield.isFinished) break;
    }

    if (runUntilFinish) {
      while (!battlefield.isFinished) {
        battlefield.tick();
        logger.tick();
      }
    }

    logger.testEnd();

    const gameState = battlefield.getState();
    const testExpectedState = (expectedState: ExpectedState) => {
      if (typeof expectedState === "object") {
        t.like(gameState, expectedState);
      } else {
        expectedState(gameState, t);
      }
    };

    if (Array.isArray(expectedState)) {
      expectedState.forEach(testExpectedState);
    } else {
      testExpectedState(expectedState);
    }
  });
}
