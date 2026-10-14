// Media queries and capability flags shared by every module (browser only).
export const mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)');
export const mqFine = window.matchMedia('(hover: hover) and (pointer: fine)');
export const mqMobile = window.matchMedia('(max-width: 767px)');

export const reduced = (): boolean => mqReduce.matches;
export const finePointer = (): boolean => mqFine.matches;
export const isMobile = (): boolean => mqMobile.matches;

/** Data saver or reduced-data preference: the ember effect stays static. */
export const saveData = (): boolean => {
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  return connection?.saveData === true || window.matchMedia('(prefers-reduced-data: reduce)').matches;
};
