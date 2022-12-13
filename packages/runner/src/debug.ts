import { Loop } from "./loop";

export class Debug {
  constructor(private loop: Loop) {}
  isRunning = true;

  hookGlobalKeys() {
    window.addEventListener("keypress", event => this.nextFrameEvent(event));
    window.addEventListener("keypress", event => this.printState(event));
    window.addEventListener("keydown", event => this.gamePauseEvent(event));
  }

  private printState(event: KeyboardEvent) {
    if (event.key !== "q") return;

    console.log(this.loop.battleField.getState());
  }

  private gamePauseEvent(event: KeyboardEvent) {
    if (event.key !== " ") return;

    if (this.isRunning) {
      this.loop.stop();
    } else {
      this.loop.start();
    }

    this.isRunning = !this.isRunning;
  }

  private nextFrameEvent(event: KeyboardEvent) {
    if (event.key !== "n") return;
    if (this.isRunning) return;

    this.loop.tick();
  }
}
