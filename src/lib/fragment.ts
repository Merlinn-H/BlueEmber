import { emberMobileFragment, emberPages, type EmberPageKey, type FragmentSpec } from '../config/ember';

/** Intrinsic CSS width of the fragment element; other sizes are reached with scale(). */
export const FRAGMENT_BASE_VW = 30;
/** height / width of fragment-flamme.svg (600 x 800). The final WebP keeps the same framing. */
export const FRAGMENT_RATIO = 4 / 3;

/** CSS values (container units of the fixed stage, so scrollbars are excluded). */
function place(spec: FragmentSpec) {
  const w = `(${spec.size} * 1cqw)`;
  const h = `(${spec.size} * 1cqw * ${FRAGMENT_RATIO})`;
  const x =
    spec.x === 'left'
      ? `calc(${w} * ${-spec.cutX})`
      : spec.x === 'right'
        ? `calc(100cqw - ${w} * ${1 - spec.cutX})`
        : `calc((100cqw - ${w}) / 2)`;
  const y =
    spec.y === 'top'
      ? `calc(${h} * ${-spec.cutY})`
      : spec.y === 'middle'
        ? `calc((100cqh - ${h}) / 2)`
        : `calc(100cqh - ${h} * ${1 - spec.cutY})`;
  return { x, y, scale: String(Math.round((spec.size / FRAGMENT_BASE_VW) * 1000) / 1000) };
}

/**
 * Inline style for <body>: custom properties the persistent fragment reads.
 * Desktop (-d) and mobile (-m) variants; the CSS picks one with a media query.
 */
export function fragmentStyle(page: EmberPageKey): string {
  const spec = emberPages[page].fragment;
  const desktop = place(spec);
  const mobile = place({
    x: spec.x === 'right' ? 'right' : 'left',
    y: 'bottom',
    size: emberMobileFragment.size,
    cutX: emberMobileFragment.cutX,
    cutY: emberMobileFragment.cutY,
  });
  // Text columns start to the right of a left-hand fragment (tablet and up): its visible width, less the
  // page margin, plus a small gap. Right-hand fragments need nothing: text is left-aligned.
  const inset =
    spec.x === 'left'
      ? `calc(${(spec.size * (1 - spec.cutX)).toFixed(2)}vw - var(--gutter) + var(--space-3))`
      : '0px';
  return [
    `--fx-d:${desktop.x}`,
    `--fy-d:${desktop.y}`,
    `--fs-d:${desktop.scale}`,
    `--fx-m:${mobile.x}`,
    `--fy-m:${mobile.y}`,
    `--fs-m:${mobile.scale}`,
    `--fragment-inset:${inset}`,
  ].join(';');
}
