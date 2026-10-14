import { demo } from '../lib/demo';

// Questions of the Services FAQ. The topics come from the brief; the answers are placeholders (shown as lorem ipsum
// while the demo mode is on, see lib/demo.ts). The same list feeds the accordion and the FAQPage JSON-LD.
const questions = [
  { question: 'Quels sont vos délais ?', answer: '[À FOURNIR : réponse sur les délais, 2 à 3 phrases]' },
  { question: 'Quel budget faut-il prévoir ?', answer: '[À FOURNIR : réponse sur le budget, 2 à 3 phrases]' },
  { question: 'Comment se déroule un projet ?', answer: '[À FOURNIR : réponse sur le déroulé d\'un projet, 2 à 3 phrases]' },
  { question: 'Où intervenez-vous ?', answer: '[À FOURNIR : réponse sur la zone géographique, 2 à 3 phrases]' },
  { question: 'À qui appartiennent les contenus ?', answer: '[À FOURNIR : réponse sur la propriété des contenus, 2 à 3 phrases]' },
  { question: 'Quel suivi après la livraison ?', answer: '[À FOURNIR : réponse sur le suivi après livraison, 2 à 3 phrases]' },
] as const;

export const faq = questions.map((item, index) => ({ question: item.question, answer: demo(item.answer, `faq.${index}`) }));
