import type { PhaseConfig } from '../types';

export const PHASE_CONFIGS: PhaseConfig[] = [
  {
    id: 1,
    name: 'Kontakt & Lead',
    type: 'single',
    description: 'První prověření zákazníka před zahájením obchodního procesu.',
    dependencies: [],
  },
  {
    id: 2,
    name: 'Discovery',
    type: 'single',
    description: 'Hlubší pochopení problému zákazníka z meetingového přepisu nebo záznamu.',
    dependencies: [1],
  },
  {
    id: 3,
    name: 'Koncept & Rozhodnutí',
    type: 'single',
    description: 'Vizualizace řešení a rozhodnutí o dalším postupu.',
    dependencies: [2],
  },
  {
    id: 4,
    name: 'Engineering Project',
    type: 'single',
    description: 'Detailní technické zadání projektu, použitelné pro nacenění i jako příloha smlouvy.',
    dependencies: [3],
  },
  {
    id: 5,
    name: 'Nabídka & Plán',
    type: 'single',
    description: 'Převod EP do cenové nabídky a harmonogramu.',
    dependencies: [4],
  },
  {
    id: 6,
    name: 'Smlouvy',
    type: 'single',
    description: 'Kontrola souladu smlouvy s EP a nabídkou, identifikace rizikových míst.',
    dependencies: [5],
  },
  {
    id: 7,
    name: 'Projektový Setup',
    type: 'single',
    description: 'Bootstrapování projektového prostředí v externích nástrojích.',
    dependencies: [5],
  },
  {
    id: 8,
    name: 'Vývoj',
    type: 'continuous',
    description: 'Implementace ticketu — agent vytvoří branch, naprogramuje změny a otevře Pull Request.',
    dependencies: [7],
  },
  {
    id: 9,
    name: 'Delivery & Scope Control',
    type: 'continuous',
    description: 'Průběžná kontrola souladu stavu projektu s plánem.',
    dependencies: [7],
  },
  {
    id: 10,
    name: 'Testování',
    type: 'continuous',
    description: 'Automatické ověření funkčnosti na základě akceptačních kritérií z EP.',
    dependencies: [7],
  },
  {
    id: 11,
    name: 'Dokumentace',
    type: 'continuous',
    description: 'Vytvoření a průběžná aktualizace kompletní dokumentace projektu.',
    dependencies: [7],
  },
  {
    id: 12,
    name: 'Předání & Akceptace',
    type: 'single',
    description: 'Formální předání projektu zákazníkovi.',
    dependencies: [6, 10],
  },
  {
    id: 13,
    name: 'Provoz & Další Rozvoj',
    type: 'continuous',
    description: 'Monitoring běžícího systému a podklady pro plánování dalšího rozvoje.',
    dependencies: [12],
  },
];

export const getPhaseConfig = (id: number): PhaseConfig =>
  PHASE_CONFIGS.find((p) => p.id === id)!;

export const SINGLE_PHASE_IDS = PHASE_CONFIGS.filter((p) => p.type === 'single').map((p) => p.id);
export const CONTINUOUS_PHASE_IDS = PHASE_CONFIGS.filter((p) => p.type === 'continuous').map((p) => p.id);
