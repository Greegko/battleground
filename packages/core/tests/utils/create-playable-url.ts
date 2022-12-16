import { BattlefieldInit } from "../../src/battlefield";

export function createPlayableUrl(initialState: BattlefieldInit, seed: string): string {
  const lzString = require("lz-string");
  const baseUrl = "http://localhost:8080?mod=tester";

  const initStateUrlFragment =
    "&initState=" + encodeURIComponent(lzString.compressToBase64(JSON.stringify(initialState)));

  const seedUrlFragment = seed ? "&seed=" + seed : "";

  return baseUrl + seedUrlFragment + initStateUrlFragment;
}
