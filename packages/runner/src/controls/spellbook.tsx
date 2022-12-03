import { useCallback, useContext, useState } from "react";

import { Asset, LoopContext } from "./core";

import "./spellbook.scss";

export const SpellBook = () => {
  const [open, setOpen] = useState<boolean>(false);

  const loop = useContext(LoopContext);

  const startSpellCasting = useCallback((spellId: string) => {
    loop.spellSelection.startSpellSelection(spellId, { x: 0, y: 0 });

    const trackMouseMoveFn = (mouseEvent: MouseEvent) => {
      loop.spellSelection.setSpellPosition({ x: mouseEvent.clientX, y: mouseEvent.clientY });
    };

    const trackMouseRelease = (mouseEvent: MouseEvent) => {
      loop.spellSelection.stopSpellSelection(true);

      window.removeEventListener("mousemove", trackMouseMoveFn);
      window.removeEventListener("mouseup", trackMouseRelease);
      window.removeEventListener("keyup", trackKeyboardRelease);
    };

    const trackKeyboardRelease = (keyboardEvent: KeyboardEvent) => {
      if (keyboardEvent.key !== "Escape") return;

      loop.spellSelection.stopSpellSelection(false);

      window.removeEventListener("mousemove", trackMouseMoveFn);
      window.removeEventListener("mouseup", trackMouseRelease);
      window.removeEventListener("keyup", trackKeyboardRelease);
    };

    window.addEventListener("mousemove", trackMouseMoveFn);
    window.addEventListener("mouseup", trackMouseRelease);
    window.addEventListener("keyup", trackKeyboardRelease);
  }, []);

  return (
    <span className="spellbook">
      {open && (
        <>
          <div className="spell" onClick={() => startSpellCasting("fireball")}>
            <Asset id="fireball" />
          </div>
          <div className="spell" onClick={() => startSpellCasting("heal")}>
            <Asset id="hearth" />
          </div>
          <div className="spell inactive">
            <Asset id="shield_break" />
          </div>
          <div className="spell inactive">
            <Asset id="lightning" />
          </div>
          <div className="spell inactive">
            <Asset id="arrows" />
          </div>
          <div className="spell inactive">
            <Asset id="ice_berg" />
          </div>
        </>
      )}

      <div className="book" onClick={() => setOpen(!open)}>
        <Asset id="spell_book" />
      </div>
    </span>
  );
};