import { CalendarCheck, ClipboardList, Hammer, KeyRound, MessageSquareText, ShieldCheck, Sparkles, Wallet, type LucideIcon } from 'lucide-react';

export const painPoints = [
  { title: 'Calls that never get returned', copy: 'You reach out to three contractors and hear back from one — weeks later.' },
  { title: 'Estimates that keep growing', copy: 'A vague number up front turns into change order after change order.' },
  { title: 'A project with no finish line', copy: 'Half-done rooms, crews that disappear for days, and no clear schedule.' },
];

export const promises: { title: string; copy: string; icon: LucideIcon }[] = [
  { title: 'We answer and we show up', copy: 'Fast, straightforward communication from first call to final walkthrough.', icon: MessageSquareText },
  { title: 'Clear, written scope', copy: 'You see exactly what is included before any work begins — no guessing.', icon: ClipboardList },
  { title: 'Honest recommendations', copy: 'We tell you what your home actually needs, and what can wait.', icon: Wallet },
  { title: 'Licensed and accountable', copy: 'A registered Oregon contractor who stands behind the work.', icon: ShieldCheck },
];

export const processSteps: { title: string; copy: string; icon: LucideIcon }[] = [
  { title: 'Tell us about your project', copy: 'Answer a few quick questions online or give us a call. It takes about a minute.', icon: Sparkles },
  { title: 'Walk the space together', copy: 'We visit, listen to what you want, measure, and talk through options and budget.', icon: CalendarCheck },
  { title: 'Get a written estimate', copy: 'A clear scope and price you can review at your own pace. No pressure.', icon: ClipboardList },
  { title: 'We build — you live better', copy: 'Tidy, respectful work on a schedule you know, ending with a final walkthrough.', icon: Hammer },
];

export const faqs = [
  {
    question: 'What areas do you serve?',
    answer: 'We work throughout the Portland metro, including Portland, Beaverton, Hillsboro, Lake Oswego, Milwaukie, and Gresham. If you are nearby but not on that list, ask — we may still be able to help.',
  },
  {
    question: 'Is the estimate really free?',
    answer: 'Yes. The first conversation and on-site visit are free and come with no obligation. You will get a written scope so you can compare options with confidence.',
  },
  {
    question: 'Are you licensed and insured?',
    answer: 'Roselawn Builders is a licensed Oregon contractor, CCB #229718. You can verify our license with the Oregon Construction Contractors Board at any time.',
  },
  {
    question: 'What size projects do you take on?',
    answer: 'Everything from targeted repairs — a stretch of rotted siding, a sagging gate — to full kitchen and bathroom remodels and whole-home restoration.',
  },
  {
    question: 'How soon can you start?',
    answer: 'It depends on the season and the size of the project. Tell us your timeline in the form and we will give you a realistic start window during our first call.',
  },
  {
    question: 'Do you help with design and material choices?',
    answer: 'Yes. We walk you through layout, material, and fixture options that fit your budget, and we can coordinate with a designer if you already work with one.',
  },
];

export const guarantee = {
  icon: KeyRound,
  title: 'No-pressure estimates. Clear, written scope.',
  copy: 'Every project starts with a free, no-obligation conversation and ends with a final walkthrough together, so nothing is left to chance.',
};
