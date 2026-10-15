import GUI from 'lil-gui';
import type { EmberTier } from './types';
import type { EmberApi } from './index';

// Live tuning panel, loaded only with ?debug in the URL. Edits the running parameters directly: copy the
// values you like back into emberDefaults in src/config/ember.ts ("Copier les valeurs").
export function mountDebug(api: EmberApi): void {
  // Appended to <html>, outside <body>, so it survives page transitions
  const container = document.createElement('div');
  container.id = 'ember-debug';
  container.style.cssText = 'position:fixed;top:8px;right:8px;z-index:100000;max-height:calc(100vh - 16px);overflow:auto;';
  document.documentElement.append(container);

  const style = document.createElement('style');
  style.textContent = 'html.ember-debug-zones [data-ember]{outline:1px dashed rgba(240,90,28,.8);outline-offset:-1px}html.ember-debug-zones [data-ember="calm"]{outline-color:rgba(157,179,198,.9)}';
  document.head.append(style);

  const p = api.params;
  const gui = new GUI({ title: 'Braise (debug)', container });

  const info = { tier: api.tier as EmberTier, fps: '', scale: '' };
  const status = gui.addFolder('Etat');
  const tierControl = status.add(info, 'tier', ['webgl', 'canvas2d', 'static']).name('niveau');
  tierControl.onChange((value: EmberTier) => void api.setTier(value));
  status.add(info, 'fps').name('fps (actif)').disable().listen();
  status.add(info, 'scale').name('resolution').disable().listen();
  status.add(api, 'autoQuality').name('baisse auto de qualite');
  status.add({ burst: () => api.burst() }, 'burst').name('souffle (clic)');
  status.add({ clear: () => api.clear() }, 'clear').name('vider la trainee');
  status.add({ zones: false }, 'zones').name('voir les zones').onChange((on: boolean) => document.documentElement.classList.toggle('ember-debug-zones', on));

  const brush = gui.addFolder('Pinceau');
  brush.add(p.brush, 'radiusMin', 30, 300, 1).name('rayon repos (px)');
  brush.add(p.brush, 'radiusMax', 60, 400, 1).name('rayon vitesse (px)');
  brush.add(p.brush, 'edgeNoise', 0, 1, 0.01).name('grain de la suie (bord)');
  brush.add(p.speed, 'reference', 400, 4000, 10).name('vitesse de reference');
  brush.add(p.speed, 'minIntensity', 0, 1, 0.01).name('intensite mini');
  brush.add(p.trail, 'tau', 0.1, 1.5, 0.01).name('decroissance tau (s)');

  const look = gui.addFolder('Matiere');
  look.add(p.look, 'crackScale', 60, 400, 1).name('taille des morceaux');
  look.add(p.look, 'crackWidth', 0.02, 0.2, 0.001).name('largeur fissures');
  look.add(p.look, 'ashScale', 80, 600, 1).name('taille des taches');
  look.add(p.look, 'wood', 0, 1, 0.01).name('part de bois');
  look.add(p.look, 'relief', 0, 2, 0.01).name('relief (lumiere)');
  look.add(p.look, 'cool', 0, 1, 0.01).name('teinte bleue');
  look.add(p.look, 'heat', 0, 12, 0.1).name('chaleur (px)');
  look.add(p.look, 'flicker', 0, 0.5, 0.01).name('scintillement');
  look.add(p.look, 'halo', 0, 2, 0.01).name('lueur du curseur');
  look.add(p.look, 'core', 0, 1, 0.01).name('coeur ambre');
  look.add(p.look, 'crust', 0, 1, 0.01).name('opacite des morceaux');
  look.add(p.look, 'glow', 0, 1.5, 0.01).name('intensite braise');

  const sparks = gui.addFolder('Etincelles');
  sparks.add(p.sparks, 'max', 0, 512, 1).name('maximum');
  sparks.add(p.sparks, 'perFrame', 0, 4, 0.05).name('par frame (vitesse max)');
  sparks.add(p.sparks, 'riseMin', 0, 300, 1).name('montee mini (px)');
  sparks.add(p.sparks, 'riseMax', 0, 400, 1).name('montee maxi (px)');
  sparks.add(p.sparks, 'lifeMin', 0.2, 4, 0.05).name('vie mini (s)');
  sparks.add(p.sparks, 'lifeMax', 0.2, 5, 0.05).name('vie maxi (s)');
  sparks.add(p.sparks, 'hotShare', 0, 1, 0.01).name('part ambre');

  const burst = gui.addFolder('Souffle');
  burst.add(p.burst, 'radius', 80, 600, 1).name('rayon (px)');
  burst.add(p.burst, 'duration', 0.2, 2, 0.05).name('duree (s)');
  burst.add(p.burst, 'sparks', 0, 60, 1).name('etincelles');

  const zones = gui.addFolder('Lisibilite');
  zones.add(p.zones, 'reduce', 0, 1, 0.01).name('reduction zones calmes');
  zones.add(p.zones, 'fade', 0, 120, 1).name('fondu des bords (px)');
  zones.add(p.zones, 'calmCap', 0, 1.4, 0.01).name('plafond chaleur (texte)');
  zones.add(p.zones, 'softCap', 0, 1.4, 0.01).name('plafond chaleur (titres)');

  // The rim light only exists with the fragment (fragmentEnabled in src/config/ember.ts)
  if (document.querySelector('[data-fragment]')) {
    const rim = gui.addFolder('Fragment');
    rim.add(p.rim, 'opacity', 0, 1, 0.01).name('liseré (opacite)');
    rim.add(p.rim, 'width', 2, 30, 1).name('liseré (px)');
  }

  const render = gui.addFolder('Rendu');
  render.add(p.render, 'scale', 0.2, 1, 0.01).name('resolution').onChange((value: number) => api.setScale(value));
  render.add(p.render, 'idleMs', 500, 8000, 100).name('arret apres (ms)');
  render.add(p.render, 'fpsFloor', 20, 60, 1).name('seuil fps');

  gui.add(
    {
      copy: () => void navigator.clipboard?.writeText(JSON.stringify(p, null, 2)),
    },
    'copy',
  ).name('Copier les valeurs (JSON)');

  window.setInterval(() => {
    info.tier = api.tier;
    info.fps = api.fps.toFixed(0);
    info.scale = `${api.scale.toFixed(2)}x`;
    tierControl.updateDisplay();
  }, 500);
}
