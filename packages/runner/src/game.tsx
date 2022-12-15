import { useEffect, useRef, useState } from "react";

import { Config } from "@battleground/core";
import { CastleWarsMod, TesterMod } from "@battleground/mods";

import { LoopContext } from "./controls/core";
import { Debug } from "./debug";
import { Loop } from "./loop";

interface GameProperties {
  children: JSX.Element;
}

const selectedMod = new URLSearchParams(window.location.search).get("mod");

const mod = {
  castle_wars: new CastleWarsMod(),
  tester: new TesterMod()
}[selectedMod];

export const Game = ({ children }: GameProperties) => {
  const [loop, setLoop] = useState<Loop>();
  const containerRef = useRef<HTMLDivElement>();

  useEffect(() => {
    const config: Config = {
      containerNode: containerRef.current,
      mapSize: [window.innerWidth, window.innerHeight],
    };

    mod.init().then(() => {
      const loop = new Loop(config, mod);
      const debug = new Debug(loop);

      debug.hookGlobalKeys();

      loop.init();
      loop.start();

      setLoop(loop);
    });
  }, []);

  return (
    <>
      <div ref={containerRef}></div>

      {loop && <LoopContext.Provider value={loop}>{children}</LoopContext.Provider>}
    </>
  );
};
