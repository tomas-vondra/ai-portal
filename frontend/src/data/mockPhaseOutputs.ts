import type { LogEntry } from '../types';

export const mockLogs: Record<number, LogEntry[]> = {
  1: [
    { timestamp: '2026-03-10T09:00:01', type: 'info', message: 'Spouštím investigaci pro: TechNova s.r.o.' },
    { timestamp: '2026-03-10T09:00:03', type: 'ok', message: 'Prohledávám Google...' },
    { timestamp: '2026-03-10T09:00:06', type: 'ok', message: 'Nalezeno 12 relevantních výsledků' },
    { timestamp: '2026-03-10T09:00:08', type: 'ok', message: 'Prohledávám LinkedIn...' },
    { timestamp: '2026-03-10T09:00:11', type: 'ok', message: 'Nalezen firemní profil, 45 zaměstnanců' },
    { timestamp: '2026-03-10T09:00:13', type: 'ok', message: 'Dotazuji ARES...' },
    { timestamp: '2026-03-10T09:00:15', type: 'ok', message: 'IČO: 12345678, záznam nalezen' },
    { timestamp: '2026-03-10T09:00:17', type: 'info', message: 'Insolvenční rejstřík — přeskočeno (nevybráno)' },
    { timestamp: '2026-03-10T09:00:19', type: 'ok', message: 'Sestavuji research report...' },
    { timestamp: '2026-03-10T09:00:22', type: 'ok', message: 'Research dokončen.' },
  ],
  2: [
    { timestamp: '2026-03-11T10:00:01', type: 'info', message: 'Analyzuji vstupní dokument (3 240 slov)...' },
    { timestamp: '2026-03-11T10:00:04', type: 'ok', message: 'Identifikuji klíčové problémy...' },
    { timestamp: '2026-03-11T10:00:08', type: 'ok', message: 'Extrahuji požadované funkcionality...' },
    { timestamp: '2026-03-11T10:00:12', type: 'ok', message: 'Mapuji uživatelské role...' },
    { timestamp: '2026-03-11T10:00:15', type: 'warn', message: 'Některé požadavky jsou nejednoznačné — přidávám do otevřených otázek' },
    { timestamp: '2026-03-11T10:00:18', type: 'ok', message: 'Analýza dokončena.' },
  ],
  3: [
    { timestamp: '2026-03-12T14:00:01', type: 'info', message: 'Načítám výstup z Discovery fáze...' },
    { timestamp: '2026-03-12T14:00:03', type: 'ok', message: 'Navrhuji sitemap...' },
    { timestamp: '2026-03-12T14:00:07', type: 'ok', message: 'Sestavuji seznam obrazovek...' },
    { timestamp: '2026-03-12T14:00:10', type: 'ok', message: 'Připravuji podklady pro prezentaci...' },
    { timestamp: '2026-03-12T14:00:14', type: 'ok', message: 'Koncept dokončen.' },
  ],
};

export const mockOutputs: Record<number, Record<string, unknown>> = {
  1: {
    companyName: 'TechNova s.r.o.',
    description: 'Softwarová společnost specializující se na vývoj podnikových informačních systémů a digitální transformaci.',
    domain: 'Enterprise Software, Digitální transformace',
    legalStatus: 'Aktivní subjekt v OR, bez záznamu v insolvenčním rejstříku',
    ico: '12345678',
    keyPeople: [
      { name: 'Jan Novák', position: 'CEO' },
      { name: 'Petra Svobodová', position: 'CTO' },
      { name: 'Martin Dvořák', position: 'Head of Sales' },
    ],
    estimatedRevenue: '45–60 mil. Kč ročně',
    signals: [
      { text: 'Stabilní růst tržeb 3 roky po sobě', severity: 'green' },
      { text: 'Aktivní nábor vývojářů (15 pozic)', severity: 'green' },
      { text: 'Nedávná změna jednatele (02/2026)', severity: 'orange' },
      { text: 'Negativní recenze na Glassdoor (3.2/5)', severity: 'orange' },
    ],
  },
  2: {
    problemDefinition: 'Klient potřebuje modernizovat interní systém pro správu objednávek, který je postavený na zastaralé technologii (PHP 5.6, jQuery). Systém je pomalý, nespolehlivý a neumožňuje integraci s novými partnery.',
    functionalities: [
      { text: 'Online správa objednávek s real-time statusy', citation: 'Řádek 45–48' },
      { text: 'Integrace s dopravci (PPL, Zásilkovna, DPD)', citation: 'Řádek 67' },
      { text: 'Automatické generování faktur', citation: 'Řádek 89–92' },
      { text: 'Dashboard s KPI a reporty', citation: 'Řádek 120–125' },
      { text: 'Mobilní přístup pro skladníky', citation: 'Řádek 134' },
    ],
    userRoles: [
      { text: 'Administrátor', citation: 'Řádek 20' },
      { text: 'Operátor objednávek', citation: 'Řádek 23' },
      { text: 'Skladník', citation: 'Řádek 25' },
      { text: 'Manažer', citation: 'Řádek 28' },
    ],
    openQuestions: [
      { text: 'Jaký je očekávaný počet souběžných uživatelů?', priority: 'high' },
      { text: 'Existuje API dokumentace k současným dopravcům?', priority: 'high' },
      { text: 'Je potřeba migrace dat ze starého systému?', priority: 'medium' },
      { text: 'Má klient preferenci ohledně hostingu (cloud vs. on-premise)?', priority: 'low' },
    ],
    risks: [
      'Zastaralý kód — riziko skrytých závislostí při migraci',
      'Nedokumentované business procesy — nutné doplnit workshopem',
    ],
  },
  3: {
    approach: {
      recommended: 'Fixed-price',
      reasoning: 'Jasně definovaný rozsah z Discovery fáze, stabilní požadavky, nízké riziko scope creepu. Fixed-price poskytne klientovi jistotu nákladů.',
    },
    sitemap: [
      { level: 0, name: 'Dashboard' },
      { level: 0, name: 'Objednávky' },
      { level: 1, name: 'Seznam objednávek' },
      { level: 1, name: 'Detail objednávky' },
      { level: 1, name: 'Nová objednávka' },
      { level: 0, name: 'Sklad' },
      { level: 1, name: 'Přehled zásob' },
      { level: 1, name: 'Příjem zboží' },
      { level: 0, name: 'Fakturace' },
      { level: 1, name: 'Seznam faktur' },
      { level: 1, name: 'Generování faktury' },
      { level: 0, name: 'Reporty & KPI' },
      { level: 0, name: 'Nastavení' },
      { level: 1, name: 'Uživatelé & role' },
      { level: 1, name: 'Integrace' },
    ],
    screens: [
      'Dashboard s KPI widgety',
      'Seznam objednávek s filtry a řazením',
      'Detail objednávky s timeline',
      'Formulář nové objednávky',
      'Přehled skladu s vyhledáváním',
      'Seznam a detail faktur',
      'Reportovací dashboard',
      'Správa uživatelů a rolí',
      'Nastavení integrací (dopravci, platební brány)',
    ],
    openQuestions: [
      'Finální rozhodnutí o mobilní aplikaci vs. responzivní web pro skladníky',
      'Volba platební brány pro online platby',
    ],
    presentation: [
      { slide: 'Úvod a cíle projektu', bullets: ['Modernizace objednávkového systému', 'Klíčové přínosy pro tým'] },
      { slide: 'Navrhované řešení', bullets: ['Architektura systému', 'Technologický stack', 'Klíčové obrazovky'] },
      { slide: 'Sitemap a user flows', bullets: ['Přehled struktury aplikace', 'Hlavní uživatelské scénáře'] },
      { slide: 'Další kroky', bullets: ['Harmonogram', 'Engineering Project', 'Podmínky spolupráce'] },
    ],
  },
  4: {
    functionalRequirements: [
      'Správa objednávek — CRUD operace, filtrování, řazení, hromadné akce',
      'Real-time tracking statusů objednávek přes WebSocket',
      'Integrace dopravců — PPL, Zásilkovna, DPD přes REST API',
      'Automatické generování faktur z objednávek (PDF export)',
      'Dashboard s KPI: obrat, počet objednávek, průměrná doba zpracování',
      'Role-based access control (RBAC) — admin, operátor, skladník, manažer',
    ],
    nonFunctionalRequirements: [
      'Odezva API < 200ms pro 95. percentil',
      'Dostupnost 99.5% (SLA)',
      'Podpora 100 souběžných uživatelů',
      'GDPR compliance — šifrování osobních údajů',
    ],
    techStack: 'Next.js 14 (React), PostgreSQL, Prisma ORM, Tailwind CSS, Vercel',
    hosting: 'Vercel (frontend) + Supabase (database + auth)',
    maintenance: 'SLA servisní smlouva — 8h response time pro kritické bugy, měsíční update window',
    scope: {
      included: ['Webová aplikace', 'REST API', 'Integrace 3 dopravců', 'Administrace', 'Dokumentace'],
      excluded: ['Mobilní nativní aplikace', 'Migrace dat ze starého systému', 'SEO optimalizace'],
    },
  },
  5: {
    totalMD: 62,
    hourlyRate: 2500,
    totalPrice: '1 240 000 Kč',
    epics: [
      {
        name: 'Objednávkový modul',
        stories: [
          { name: 'Seznam objednávek s filtry', md: 5 },
          { name: 'Detail objednávky', md: 4 },
          { name: 'Vytvoření objednávky', md: 6 },
          { name: 'Real-time status tracking', md: 5 },
        ],
      },
      {
        name: 'Integrace dopravců',
        stories: [
          { name: 'PPL API integrace', md: 4 },
          { name: 'Zásilkovna API integrace', md: 4 },
          { name: 'DPD API integrace', md: 3 },
        ],
      },
      {
        name: 'Fakturace',
        stories: [
          { name: 'Generování faktur', md: 5 },
          { name: 'PDF export', md: 3 },
          { name: 'Seznam a filtr faktur', md: 3 },
        ],
      },
      {
        name: 'Dashboard & Reporty',
        stories: [
          { name: 'KPI dashboard', md: 5 },
          { name: 'Export reportů', md: 3 },
        ],
      },
      {
        name: 'Správa uživatelů',
        stories: [
          { name: 'RBAC systém', md: 4 },
          { name: 'Správa uživatelů UI', md: 3 },
        ],
      },
      {
        name: 'Infrastruktura',
        stories: [
          { name: 'CI/CD pipeline', md: 2 },
          { name: 'Monitoring & logging', md: 3 },
        ],
      },
    ],
    milestones: [
      { name: 'M1 — Základní objednávky', week: 3, description: 'CRUD objednávek, seznam, detail' },
      { name: 'M2 — Integrace dopravců', week: 6, description: 'Všichni 3 dopravci napojeni' },
      { name: 'M3 — Fakturace & reporty', week: 9, description: 'Generování faktur, dashboard' },
      { name: 'M4 — UAT & Go-live', week: 12, description: 'Uživatelské testování, nasazení' },
    ],
  },
  6: {
    risks: [
      {
        id: 'r1',
        title: 'Nespecifikované penále za zpoždění',
        description: 'Smlouva obsahuje penále 0.5% z ceny za každý den prodlení, ale nedefinuje podmínky pro pozastavení lhůty (např. čekání na součinnost klienta).',
        severity: 'critical' as const,
        citation: '§ 8, odst. 3 — "Dodavatel uhradí smluvní pokutu ve výši 0,5 % z celkové ceny díla za každý započatý den prodlení."',
      },
      {
        id: 'r2',
        title: 'Nejasná definice akceptačních kritérií',
        description: 'Smlouva odkazuje na "akceptační kritéria dle přílohy č. 2", ale příloha obsahuje pouze obecné formulace bez měřitelných podmínek.',
        severity: 'warning' as const,
        citation: '§ 5, odst. 1 — "Dílo bude považováno za dokončené po splnění akceptačních kritérií uvedených v příloze č. 2."',
      },
      {
        id: 'r3',
        title: 'Rozsah údržby nad rámec nabídky',
        description: 'Smlouva definuje 12měsíční záruční období s povinností opravit "veškeré vady", což může zahrnovat i změnové požadavky.',
        severity: 'warning' as const,
        citation: '§ 12, odst. 2 — "V záruční době se dodavatel zavazuje bezúplatně odstranit veškeré vady díla."',
      },
      {
        id: 'r4',
        title: 'IP práva k open-source komponentám',
        description: 'Smlouva požaduje převod "veškerých práv k dílu", ale řešení využívá open-source knihovny s vlastními licencemi.',
        severity: 'info' as const,
        citation: '§ 15, odst. 1 — "Objednatel nabývá veškerá majetková práva k dílu okamžikem zaplacení ceny."',
      },
    ],
  },
  7: {
    tickets: [
      { id: 't1', type: 'epic', name: 'Objednávkový modul', points: 20 },
      { id: 't2', type: 'story', name: 'Seznam objednávek s filtry', points: 5, parentId: 't1' },
      { id: 't3', type: 'task', name: 'Implementovat stránkování', points: 2, parentId: 't2' },
      { id: 't4', type: 'task', name: 'Implementovat filtry', points: 3, parentId: 't2' },
      { id: 't5', type: 'story', name: 'Detail objednávky', points: 4, parentId: 't1' },
      { id: 't6', type: 'story', name: 'Vytvoření objednávky', points: 6, parentId: 't1' },
      { id: 't7', type: 'epic', name: 'Integrace dopravců', points: 11 },
      { id: 't8', type: 'story', name: 'PPL API integrace', points: 4, parentId: 't7' },
      { id: 't9', type: 'story', name: 'Zásilkovna API integrace', points: 4, parentId: 't7' },
      { id: 't10', type: 'story', name: 'DPD API integrace', points: 3, parentId: 't7' },
    ],
    githubUrl: null,
    jiraUrl: null,
    step: 1,
  },
  8: {
    summary: 'Implementována stránka seznamu objednávek s filtry a řazením. Přidána komponenta OrderTable s podporou inline editace statusu.',
    prUrl: 'https://github.com/example/project/pull/42',
    jiraTicket: 'PROJ-123',
    changes: [
      'Vytvořena komponenta OrderTable s React Table',
      'Přidány filtry: status, datum, zákazník',
      'Implementováno stránkování (20 položek/strana)',
      'Přidány unit testy (92% coverage)',
    ],
  },
  9: {
    completionPercent: 35,
    plannedPercent: 42,
    currentSprint: 'Sprint 4',
    deviations: [
      { type: 'delay', description: 'Integrace PPL — skluz 3 dny kvůli chybějící API dokumentaci', action: 'Eskalovat na klienta pro zajištění přístupů' },
      { type: 'scope', description: 'Přidán požadavek na export do CSV (mimo původní rozsah)', action: 'Zalogovat jako change request, odhadnout dopad' },
    ],
    timeline: [
      { milestone: 'M1 — Základní objednávky', planned: 'Týden 3', actual: 'Týden 3', status: 'done' },
      { milestone: 'M2 — Integrace dopravců', planned: 'Týden 6', actual: 'Týden 7 (odhad)', status: 'delayed' },
      { milestone: 'M3 — Fakturace & reporty', planned: 'Týden 9', actual: '—', status: 'pending' },
      { milestone: 'M4 — UAT & Go-live', planned: 'Týden 12', actual: '—', status: 'pending' },
    ],
  },
  10: {
    results: [
      { id: 'tc1', scenario: 'Přihlášení administrátora', status: 'passed' },
      { id: 'tc2', scenario: 'Vytvoření nové objednávky', status: 'passed' },
      { id: 'tc3', scenario: 'Filtrování objednávek dle statusu', status: 'passed' },
      { id: 'tc4', scenario: 'Export objednávky do PDF', status: 'failed', description: 'PDF se generuje bez loga firmy', severity: 'medium' },
      { id: 'tc5', scenario: 'Integrace PPL — odeslání zásilky', status: 'failed', description: 'Timeout při volání PPL API (> 30s)', severity: 'high' },
      { id: 'tc6', scenario: 'Mobilní zobrazení skladníka', status: 'skipped', description: 'Mobilní verze zatím neimplementována' },
      { id: 'tc7', scenario: 'Role-based přístup — skladník nemá přístup k fakturám', status: 'passed' },
    ],
    bugs: [
      { id: 'b1', description: 'PDF export bez loga firmy', severity: 'medium', scenario: 'Export objednávky do PDF' },
      { id: 'b2', description: 'PPL API timeout > 30s', severity: 'high', scenario: 'Integrace PPL — odeslání zásilky' },
    ],
  },
  11: {
    documents: [
      { name: 'Uživatelská dokumentace', type: 'user', pages: 24, format: 'DOCX' },
      { name: 'Administrátorská dokumentace', type: 'admin', pages: 18, format: 'DOCX' },
      { name: 'Provozní příručka', type: 'ops', pages: 12, format: 'MD' },
    ],
    warning: 'Kvalita generované dokumentace závisí na míře komentování zdrojového kódu.',
  },
  12: {
    protocol: {
      projectName: 'Objednávkový systém TechNova',
      deliveredDate: '2026-06-15',
      items: [
        { name: 'Webová aplikace', status: 'delivered' },
        { name: 'REST API', status: 'delivered' },
        { name: 'Integrace dopravců (3)', status: 'delivered' },
        { name: 'Dokumentace', status: 'delivered' },
        { name: 'Mobilní aplikace', status: 'excluded', reason: 'Mimo rozsah dle EP' },
      ],
    },
    summary: 'Projekt byl dodán v plném rozsahu dle EP. Mobilní aplikace byla vyloučena z rozsahu ve fázi 4. Všechny akceptační testy prošly (5/5 kritických scénářů).',
    presentation: [
      { slide: 'Shrnutí projektu', bullets: ['Dodáno v termínu', 'Splněny všechny KPI'] },
      { slide: 'Co bylo dodáno', bullets: ['Přehled modulů', 'Klíčové funkce'] },
      { slide: 'Další doporučení', bullets: ['Mobilní aplikace', 'Rozšíření reportingu'] },
    ],
  },
  13: {
    health: {
      uptime: '99.7%',
      avgLatency: '142ms',
      errorRate: '0.3%',
      lastIncident: '2026-06-20 — krátkodobý výpadek DB (5 min)',
    },
    anomalies: [
      { timestamp: '2026-06-18T14:30:00', description: 'Zvýšená latence API (> 500ms) po dobu 15 minut', severity: 'warning' },
      { timestamp: '2026-06-20T03:12:00', description: 'Výpadek databázového spojení (5 minut)', severity: 'critical' },
    ],
    backlog: [
      { priority: 'high', description: 'Optimalizace DB dotazů pro report modul (latence > 2s)' },
      { priority: 'medium', description: 'Implementace cache vrstvy pro frequently accessed data' },
      { priority: 'low', description: 'Upgrade Next.js na verzi 15' },
    ],
  },
};

export const defaultSystemPrompts: Record<number, string> = {
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
