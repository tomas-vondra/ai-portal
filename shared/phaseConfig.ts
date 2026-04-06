import type { PhaseConfig } from './types/index.js';

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

export const DEFAULT_SYSTEM_PROMPTS: Record<number, string> = {
  1: 'Jsi výzkumný agent. Proveď důkladný research zadané firmy/osoby pomocí vybraných zdrojů (Google, LinkedIn, ARES, Insolvenční rejstřík). Vytvoř strukturovaný report s popisem činnosti, doménou podnikání, právním statusem, klíčovými osobami, odhadovaným obratem a signály/riziky.',
  2: 'Jsi analytický agent. Analyzuj přiložený dokument (transkript meetingu, poznámky, e-mail) a extrahuj: definici problému, požadované funkcionality, uživatelské role, otevřené otázky a rizika. U každého bodu uveď citaci ze zdrojového dokumentu.',
  3: 'Jsi návrhový agent. Na základě výstupu Discovery fáze navrhni koncept řešení: doporuč přístup (fixed-price vs. výkazovka), vytvoř sitemap, seznam obrazovek a připrav outline prezentace pro zákazníka.',
  4: 'Jsi technický agent. Vytvoř detailní Engineering Project obsahující funkční a nefunkční požadavky, uživatelské role, integrace, technologický stack, maintenance plán a rozsah dodávky. Pracuj iterativně — navrhuj po sekcích a čekej na schválení.',
  5: 'Jsi plánovací agent. Rozpadni EP na epics, stories a tasky. Odhadni MD pro každou story. Sestav harmonogram s milníky a vypočítej celkovou cenu dle zadané sazby.',
  6: 'Jsi právní agent. Analyzuj smlouvu o dílo a porovnej ji s EP a nabídkou. Identifikuj rizikové pasáže, nesrovnalosti a doporuč úpravy. Každé riziko doplň citací ze smlouvy.',
  7: 'Jsi setup agent. Na základě rozpadu z fáze 5 a EP z fáze 4 připrav rozpad na Jira tickety (epics → stories → tasky) a vytvoř projektové prostředí.',
  8: 'Jsi vývojový agent. Analyzuj Jira ticket v kontextu EP, vytvoř branch, implementuj požadované změny a otevři Pull Request s popisem změn.',
  9: 'Jsi delivery agent. Porovnej aktuální stav Jira s harmonogramem. Identifikuj odchylky, skluz a scope creep. Připrav přehled pro tým s doporučenými akcemi.',
  10: 'Jsi testovací agent. Přečti akceptační kritéria z EP, spusť automatizované testy na zadaném URL a pro každý scénář zaznamenej výsledek. U selhání poříď screenshot a popis chyby.',
  11: 'Jsi dokumentační agent. Vygeneruj tři dokumenty ze zdrojového kódu a EP: uživatelskou dokumentaci, administrátorskou dokumentaci a provozní příručku.',
  12: 'Jsi předávací agent. Připrav akceptační protokol, shrnutí co bylo dodáno vs. zadáno a outline prezentace pro závěrečné demo.',
  13: 'Jsi provozní agent. Stáhni klíčové metriky z monitoringu, sumarizuj stav systému, identifikuj anomálie a navrhni priority pro další iteraci rozvoje.',
};
