import type { EmberParams } from '../../config/ember';
import { MAX_ZONES, type FrameData } from './types';

// Readability zones (brief 7.6) and per-section intensity.
//   data-ember="calm"  long reading text, forms, case studies: the effect is reduced by 70 % (calm strength
//                      can be overridden with data-ember-calm="1") and the heat is capped so the cracks
//                      stay dark blue behind the text.
//   data-ember="soft"  display titles: no reduction, but the heat is capped at the crack colour, so the pale
//                      and ivory stages never sit under ivory text.
//   data-ember-intensity="0.6" on a section: effect strength while that section crosses the middle of the screen.
// Rects are measured in document coordinates and only re-measured when the layout changes.
interface ZoneItem {
  calm: boolean;
  reduce: number;
  left: number;
  top: number;
  width: number;
  height: number;
}

interface SectionItem {
  top: number;
  bottom: number;
  value: number;
}

export class ZoneTracker {
  private zones: ZoneItem[] = [];
  private sections: SectionItem[] = [];

  measure(params: EmberParams): void {
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;

    this.zones = [];
    for (const element of document.querySelectorAll<HTMLElement>('[data-ember]')) {
      const rect = element.getBoundingClientRect();
      if (rect.width < 2 || rect.height < 2) continue;
      const calm = element.dataset.ember === 'calm';
      const override = element.dataset.emberCalm;
      this.zones.push({
        calm,
        reduce: calm ? (override !== undefined ? Number(override) : params.zones.reduce) : 0,
        left: rect.left + scrollX,
        top: rect.top + scrollY,
        width: rect.width,
        height: rect.height,
      });
    }

    this.sections = [];
    for (const element of document.querySelectorAll<HTMLElement>('[data-ember-intensity]')) {
      if (element === document.body) continue;
      const rect = element.getBoundingClientRect();
      this.sections.push({ top: rect.top + scrollY, bottom: rect.bottom + scrollY, value: Number(element.dataset.emberIntensity) });
    }
  }

  /** Intensity of the section crossing the middle of the screen, or the page default. */
  intensityAt(scrollY: number, viewHeight: number, fallback: number): number {
    const middle = scrollY + viewHeight * 0.5;
    for (const section of this.sections) {
      if (middle >= section.top && middle < section.bottom) return section.value;
    }
    return fallback;
  }

  /** Picks the (at most 8) zones touching the viewport: calm ones first, then the largest. */
  fill(frame: FrameData, scrollX: number, scrollY: number, viewHeight: number, params: EmberParams): void {
    const margin = params.zones.fade;
    const visible = this.zones.filter((z) => z.top + z.height > scrollY - margin && z.top < scrollY + viewHeight + margin);
    visible.sort((a, b) => Number(b.calm) - Number(a.calm) || b.width * b.height - a.width * a.height);
    const count = Math.min(visible.length, MAX_ZONES);
    for (let i = 0; i < count; i++) {
      const z = visible[i];
      frame.zones[i * 4] = z.left - scrollX;
      frame.zones[i * 4 + 1] = z.top - scrollY;
      frame.zones[i * 4 + 2] = z.width;
      frame.zones[i * 4 + 3] = z.height;
      frame.zoneParams[i * 2] = z.reduce;
      frame.zoneParams[i * 2 + 1] = z.calm ? params.zones.calmCap : params.zones.softCap;
    }
    frame.zoneCount = count;
  }
}
