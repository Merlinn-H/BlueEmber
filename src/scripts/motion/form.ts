import { wait } from '../lib/gsap';

// Contact form and newsletter (brief 10.2): visible labels, errors written under the field and linked with
// aria-describedby, validation on blur then on submit, honeypot + minimum delay (no reCAPTCHA), and
// loading / success / error states announced in a live region.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE = /^[+()\d][\d\s().-]{5,}$/;
const MIN_FILL_MS = 3000;

type Control = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);

function setupForm(form: HTMLFormElement): () => void {
  const mountedAt = Date.now();
  const status = form.querySelector<HTMLElement>('[data-status]');
  const submit = form.querySelector<HTMLElement>('[type="submit"]');
  const submitLabel = submit?.querySelector('.btn__label');
  const kind = form.dataset.form ?? 'contact';

  const message = (control: Control): string => {
    const field = control.closest<HTMLElement>('[data-field]');
    const value = control.value.trim();
    const isCheckbox = control instanceof HTMLInputElement && control.type === 'checkbox';
    if (control.required && (isCheckbox ? !(control as HTMLInputElement).checked : value === '')) {
      return field?.dataset.requiredMessage ?? 'Ce champ est obligatoire.';
    }
    if (control instanceof HTMLInputElement && value) {
      if (control.type === 'email' && !EMAIL.test(value)) return field?.dataset.invalidMessage ?? 'Cette adresse e-mail semble incorrecte.';
      if (control.type === 'tel' && !PHONE.test(value)) return field?.dataset.invalidMessage ?? 'Ce numéro semble incorrect.';
    }
    return '';
  };

  const validate = (control: Control): boolean => {
    const text = message(control);
    const field = control.closest<HTMLElement>('[data-field]');
    const error = field?.querySelector<HTMLElement>('[data-error]');
    control.setAttribute('aria-invalid', text ? 'true' : 'false');
    if (error) error.textContent = text;
    else if (status && text) status.textContent = text;
    return text === '';
  };

  const controls = () => [...form.querySelectorAll<Control>('input:not(.hp):not([type="hidden"]), select, textarea')];

  const onBlur = (event: FocusEvent) => {
    const target = event.target;
    if (target instanceof HTMLInputElement || target instanceof HTMLSelectElement || target instanceof HTMLTextAreaElement) {
      // Validate when leaving a field (not while it is still empty and untouched)
      if (target.value !== '' || target.getAttribute('aria-invalid') === 'true') validate(target);
    }
  };
  const onInput = (event: Event) => {
    const target = event.target as Control;
    if (target.getAttribute?.('aria-invalid') === 'true') validate(target);
  };
  form.addEventListener('focusout', onBlur);
  form.addEventListener('input', onInput);
  form.addEventListener('change', onInput);

  const setBusy = (busy: boolean) => {
    if (!submit) return;
    submit.toggleAttribute('aria-disabled', busy);
    if (busy) submit.setAttribute('aria-disabled', 'true');
    else submit.removeAttribute('aria-disabled');
    if (submitLabel) submitLabel.textContent = busy ? 'Envoi en cours' : (form.dataset.submitLabel ?? submitLabel.textContent);
    form.setAttribute('aria-busy', String(busy));
  };
  if (submitLabel) form.dataset.submitLabel = submitLabel.textContent ?? '';

  const showSuccess = () => {
    const shell = form.closest<HTMLElement>('[data-form-shell]');
    const success = shell?.querySelector<HTMLElement>('[data-success]');
    if (success) {
      success.innerHTML = `<h2 class="t-h2">Merci.</h2><p class="t-lead measure">Votre message est bien parti. Nous vous répondons sous ${escapeHtml(form.dataset.delay ?? '')}.</p>`;
      form.hidden = true;
      success.focus();
    } else if (status) {
      status.textContent = 'Merci, votre inscription est bien enregistrée.';
      form.reset();
      for (const control of controls()) control.setAttribute('aria-invalid', 'false');
    }
  };

  const onSubmit = async (event: SubmitEvent) => {
    event.preventDefault();
    if (submit?.getAttribute('aria-disabled') === 'true') return;
    if (status) status.textContent = '';

    // Validate everything, focus the first problem
    const invalid = controls().filter((control) => !validate(control));
    if (invalid.length > 0) {
      invalid[0].focus();
      if (status && !status.textContent) status.textContent = 'Vérifiez les champs signalés.';
      return;
    }

    // Anti-spam: a filled honeypot or a too-fast submit looks like a bot. Pretend it worked.
    const honeypot = form.querySelector<HTMLInputElement>('.hp');
    if ((honeypot && honeypot.value !== '') || Date.now() - mountedAt < MIN_FILL_MS) {
      showSuccess();
      return;
    }

    setBusy(true);
    const payload: Record<string, FormDataEntryValue> = { form: kind };
    for (const [key, value] of new FormData(form)) {
      if (key !== 'website') payload[key] = value;
    }

    try {
      const endpoint = form.dataset.endpoint;
      if (!endpoint) {
        // No endpoint configured: simulate success in development only
        if (!import.meta.env.DEV) throw new Error('no endpoint');
        await wait(900);
      } else {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
      }
      setBusy(false);
      showSuccess();
    } catch {
      setBusy(false);
      if (status) status.textContent = `L'envoi a échoué. Réessayez dans un instant, ou écrivez-nous directement : ${form.dataset.email ?? ''}`.trim();
    }
  };
  form.addEventListener('submit', onSubmit);

  return () => {
    form.removeEventListener('focusout', onBlur);
    form.removeEventListener('input', onInput);
    form.removeEventListener('change', onInput);
    form.removeEventListener('submit', onSubmit);
  };
}

export default function mount(): (() => void) | void {
  const cleanups = [...document.querySelectorAll<HTMLFormElement>('form[data-form]')].map(setupForm);
  return () => cleanups.forEach((cleanup) => cleanup());
}
