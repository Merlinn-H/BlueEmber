// Things the preloader waits for (besides fonts): the ember effect registers its shader compilation here.
const pending: Promise<unknown>[] = [];

export function registerReadiness(promise: Promise<unknown>): void {
  pending.push(promise.catch(() => undefined));
}

export const whenAllReady = (): Promise<unknown[]> => Promise.all(pending);
