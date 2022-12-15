import * as ava from "ava";
import { max } from "ramda";
import * as util from "util";

import { Battlefield, BattlefieldInit, BattlefieldState, Config } from "../../src";
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
  expectedState: ExpectedState;
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
      containerNode: null,
      speed: null,
      seed: seed || Math.random().toString(),
    } as Config;
    const battlefield = new Battlefield(config, null);
    battlefield.init(initialState);

    if (createPlayableLink) {
      const lzString = require("lz-string");
      const baseUrl = "http://localhost:8080?mod=tester";

      const initStateUrlFragment =
        "&initState=" + encodeURIComponent(lzString.compressToBase64(JSON.stringify(initialState)));

      const seedUrlFragment = seed ? "?seed=" + seed : "";

      console.log("Playable url");
      console.log(baseUrl + initStateUrlFragment + seedUrlFragment);
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
