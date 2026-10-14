/**
 * A requestAnimationFrame loop that stops itself: `tick` returns false when nothing moves any more,
 * and `start()` wakes it up again. Idle means no frame is scheduled at all.
 */
export interface Loop {
  start(): void;
  stop(): void;
  readonly running: boolean;
}

export function createLoop(tick: (dt: number, now: number) => boolean | void): Loop {
  let id = 0;
  let last = 0;

  const frame = (now: number) => {
    const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000));
    last = now;
    id = tick(dt, now) === false ? 0 : requestAnimationFrame(frame);
  };

  return {
    start() {
      if (id) return;
      last = performance.now();
      id = requestAnimationFrame(frame);
    },
    stop() {
      cancelAnimationFrame(id);
      id = 0;
    },
    get running() {
      return id !== 0;
    },
  };
}
