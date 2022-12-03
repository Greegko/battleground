import { createRoot } from "react-dom/client";

import { SpellBook } from "./controls/spellbook";
import { Game } from "./game";

const reactContainer = document.getElementById("playground") as HTMLDivElement;

const root = createRoot(reactContainer);

root.render(
  <div>
    <Game>
      <SpellBook />
    </Game>
  </div>,
);
