import { AnimatedSprite, FrameObject, Texture } from "pixi.js";

type State = string;
type States = Record<State, number | [number, number]>;

export class AnimatedSpriteUnit extends AnimatedSprite {
  private states: States;
  private state: State;

  constructor(textures: Texture[] | FrameObject[], states: States, state: State, autoUpdate = true) {
    super(textures, autoUpdate);
    this.states = states;
    this.state = state;
  }

  override set currentFrame(newValue: number) {
    super.currentFrame = newValue;
  }

  override get currentFrame(): number {
    if (this.states === undefined) return 0;

    const state = this.states[this.state];

    const [start, end] = typeof state === "number" ? [state, state + 1] : state;

    const length = end - start;

    const originalCurrentFrame = super.currentFrame;

    let currentFrame = originalCurrentFrame % length;

    return start + currentFrame;
  }

  setState(id: State) {
    this.state = id;

    const state = this.states[id];

    if (typeof state === "number") {
      this.gotoAndStop(state);
    } else {
      this.gotoAndPlay(state[0]);
    }
  }
}
