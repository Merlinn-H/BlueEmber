import { reduced } from '../lib/env';

// Videos: hover preview on project cards (when a video is provided), and background videos that only
// play while visible. Under prefers-reduced-motion nothing autoplays: the poster is shown.
export default function mount(): (() => void) | void {
  const cleanups: Array<() => void> = [];

  for (const video of document.querySelectorAll<HTMLVideoElement>('[data-hover-video]')) {
    const link = video.closest('a');
    if (!link || reduced()) continue;
    const enter = () => {
      void video.play().then(() => video.classList.add('is-playing'), () => undefined);
    };
    const leave = () => {
      video.pause();
      video.classList.remove('is-playing');
      video.currentTime = 0;
    };
    link.addEventListener('pointerenter', enter);
    link.addEventListener('pointerleave', leave);
    cleanups.push(() => {
      link.removeEventListener('pointerenter', enter);
      link.removeEventListener('pointerleave', leave);
    });
  }

  const background = [...document.querySelectorAll<HTMLVideoElement>('video[data-video]')];
  if (background.length > 0) {
    if (reduced()) {
      for (const video of background) {
        video.removeAttribute('autoplay');
        video.pause();
      }
    } else {
      const observer = new IntersectionObserver((entries) => {
        for (const entry of entries) {
          const video = entry.target as HTMLVideoElement;
          if (entry.isIntersecting) void video.play().catch(() => undefined);
          else video.pause();
        }
      });
      for (const video of background) observer.observe(video);
      cleanups.push(() => observer.disconnect());
    }
  }

  return () => cleanups.forEach((cleanup) => cleanup());
}
