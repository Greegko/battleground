import { useEffect, useRef, useState } from "react";

import { BattlefieldConfig } from "@battleground/core";
import { CastleWarsMod, TesterMod } from "@battleground/mods";
import { BattlefieldRendererConfig } from "@battleground/renderer";

import { LoopContext } from "./controls/core";
import { Debug } from "./debug";
import { Loop } from "./loop";

interface GameProperties {
  children: JSX.Element;
}

const urlParams =  new URLSearchParams(window.location.search);
const selectedMod = urlParams.get("mod");
const speed = urlParams.has('speed') ? parseInt(urlParams.get('speed')) : 'requestFrame';
const seed = urlParams.get('seed');
const tick = urlParams.get('tick');

const mod = {
  castle_wars: new CastleWarsMod(),
  tester: new TesterMod()
}[selectedMod];

export const Game = ({ children }: GameProperties) => {
  const [loop, setLoop] = useState<Loop>();
  const containerRef = useRef<HTMLDivElement>();

  useEffect(() => {
    const config: BattlefieldConfig & BattlefieldRendererConfig = {
      containerNode: containerRef.current,
      mapSize: [window.innerWidth, window.innerHeight],
      speed,
      seed
    };

    if(!seed) {
      config.seed = Math.floor(Math.random() * 1_000_000_000).toString();
      urlParams.set('seed', config.seed);
      window.history.replaceState({}, '', `${location.pathname}?${urlParams}`);
    }

    mod.init().then(() => {
      const loop = new Loop(config, mod);
      const debug = new Debug(loop);

      debug.hookGlobalKeys();

      loop.init();
      
      if(tick) {
        loop.jumpToTick(parseInt(tick));
      }

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
