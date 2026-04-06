# AI Projektový Portál — Specifikace systému

> **Verze:** 1.0 — aktuální stav implementace
> **Datum:** 2026-04-06
> **Status:** Implementováno (prototyp)

---

## Přehled systému

Centrální webový portál pro automatizaci projektového procesu od prvního kontaktu se zákazníkem až po provoz a údržbu výsledného řešení. Systém je navržen jako **human-in-the-loop** — AI vykonává práci, člověk kontroluje a schvaluje před každým dalším krokem.

### Klíčové principy

- Každý zákazník / příležitost = jeden **Projekt** nesoucí veškerý kontext přes všechny fáze
- AI má vždy k dispozici historii celého projektu, ne jen izolovaný vstup
- Každá fáze: vstup → AI zpracování → human review → schválení → další fáze
- Operátor vidí v reálném čase, co agent dělá (agent activity log)
- Každý výstup je verzovaný — lze se vrátit k předchozí verzi

### Tech stack

- **React 18** s TypeScript
- **React Router** pro navigaci
- **Zustand** pro state management
- **Tailwind CSS** pro styling
- **Lucide React** pro ikony
- **Vite** pro bundling

> **Poznámka:** Aktuální verze je frontend prototyp. Veškerá data jsou v paměti (Zustand store), bez backendu. Agent běhy jsou simulované s mock daty.

---

## Typy fází

Fáze se dělí na dva typy, které se liší chováním a vizuálním zobrazením v sidebaru:

### Jednorázové fáze

Proběhnou jednou, výstup se schválí a fáze je uzavřena. Schválený výstup lze zpětně zamítnout — v takovém případě se navazující fáze kaskádově uzamknou.

V sidebaru označeny bez dalšího štítku.

| Fáze | Název |
|---|---|
| F1 | Kontakt & Lead |
| F2 | Discovery |
| F3 | Koncept & Rozhodnutí |
| F4 | Engineering Project |
| F5 | Nabídka & Plán |
| F6 | Smlouvy |
| F7 | Projektový Setup |
| F12 | Předání & Akceptace |

### Kontinuální fáze

Opakují se průběžně během životního cyklu projektu. Nemají stav „Dokončeno" — místo toho zobrazují datum a čas posledního běhu. Lze je spustit kdykoliv znovu.

V sidebaru označeny štítkem `↻` za názvem fáze.

| Fáze | Název |
|---|---|
| F8 | Vývoj ↻ |
| F9 | Delivery & Scope Control ↻ |
| F10 | Testování ↻ |
| F11 | Dokumentace ↻ |
| F13 | Provoz & Další Rozvoj ↻ |

### Závislosti fází

Fáze se odemykají na základě závislostí:

| Fáze | Závisí na |
|---|---|
| F2 | F1 |
| F3 | F2 |
| F4 | F3 |
| F5 | F4 |
| F6 | F5 |
| F7 | F5 |
| F8, F9, F10, F11 | F7 |
| F12 | F6, F10 |
| F13 | F12 |

> F6 a F7 běží paralelně po schválení F5. F8–F11 se odemknou po schválení F7.

### Stavy fází

Každá fáze může být v jednom z těchto stavů:

| Stav | Label | Ikona v sidebaru | Barva | Popis |
|---|---|---|---|---|
| `locked` | Zamčeno | `·` | šedá | Předchozí závislosti nejsou splněny |
| `waiting` | Čeká na vstup | `○` | šedá | Odemčeno, čeká na spuštění |
| `running` | Probíhá | `◎` (pulzující) | modrá | Agent právě pracuje |
| `review` | Čeká na schválení | `◉` | žlutá | Výstup čeká na review operátora |
| `approved` | Dokončeno | `✓` | zelená | Jednorázová fáze schválena |
| `ready` | Připraveno | `↻` | zelená | Kontinuální fáze dokončena, připravena k dalšímu spuštění |
| `error` | Chyba | `✗` | červená | Agent selhal |
| `rejected` | Zamítnuto | `⊘` | červená | Fáze zamítnuta, čeká na nový vstup |

**Kontinuální fáze** po dokončení přecházejí do stavu `ready` (ne `review`) a zobrazují `↻ Naposledy spuštěno: [datum a čas]`.

---

## UI / UX — globální pravidla

### Landing page (seznam projektů)

- Přehled všech projektů v kartovém layoutu
- Každá karta zobrazuje: název projektu, klient, aktuální fázi se status badge, progress bar, datum poslední aktualizace
- **Vyhledávání** — fulltextové pole pro filtrování dle názvu projektu nebo klienta
- **Řazení** — přepínač `Datum` / `Fáze` (dle data aktualizace nebo čísla aktuální fáze)
- **Archivované projekty** — checkbox pro zobrazení/skrytí archivovaných projektů
- **Archivace** — ikona archivu na každé kartě pro archivaci/obnovení projektu
- Tlačítko **+ Nový projekt** → modal s formulářem (název projektu + klient)
- Kliknutím na kartu → detail projektu na aktuální fázi

**Prázdný stav:** Pokud neexistují žádné projekty, zobrazí se ilustrace s textem „Zatím žádné projekty" a výzva k vytvoření prvního projektu tlačítkem **+ Nový projekt**.

### Projektový detail — layout

- **Dvousloupcový layout:** sidebar (264px) vlevo | hlavní obsah vpravo
- **Breadcrumb** nad obsahem: `Projekty › [Název projektu] › F[N]. [Název fáze]`
- Kliknutí na název projektu v breadcrumbu naviguje na aktuální aktivní fázi

### Projektový detail — Sidebar

- **Progress bar** nahoře: `X z 8 klíčových fází dokončeno` (sleduje pouze jednorázové fáze)
- Seznam všech 13 fází s vizuálním stavem (ikona + barva)
- Kontinuální fáze označeny `↻` za názvem
- U dokončených kontinuálních fází se zobrazuje `↻ [datum a čas]` posledního spuštění
- **Všechny fáze jsou klikatelné** — včetně zamčených
- Aktivní fáze zvýrazněna (modré pozadí, pravý border)

### Zamčené fáze — režim náhledu

Zamčená fáze je přístupná ke čtení, ale nelze ji spustit:

- Informační banner: „Tato fáze bude dostupná po dokončení: [název předchozí fáze]" — název je odkaz na danou fázi
- Tlačítko **Spustit** je zobrazeno, ale disabled s tooltipem „Nejprve dokončete [název fáze]"
- Pokud fáze již byla v minulosti spuštěna (a pak uzamčena změnou předchozí fáze), zobrazí se poslední výstup v read-only režimu

### Každá fáze obsahuje

- **Hlavička:** název fáze (`F[N]. [Název]`), status badge, typ fáze (štítek `Jednorázová` / `Kontinuální`), krátký popis účelu
- **Indikátor upraveného promptu:** žlutý badge „Upravený prompt" vedle status badge (pokud byl výchozí systémový prompt změněn)
- **Ikony v pravém horním rohu:**
  - `</>` — otevře systémový prompt editor (slide-in panel)
  - 🕐 — otevře historii verzí (slide-in panel) — zobrazena pouze pokud existuje alespoň jedna verze, s badge počtu verzí
- **Vstupní sekci** (formulář, upload — specifická pro každou fázi)
- **Tlačítko Spustit** (disabled v zamčeném stavu)
- **Agent activity log** (živý výpis co agent dělá)
- **Výstupní sekci** (strukturovaný výsledek od AI)
- **Akční tlačítka:**
  - Ve stavu `review` (jednorázové fáze): **Schválit** / **Zamítnout & Přegenerovat**
  - Ve stavu `approved` nebo `ready`: **Exportovat** (JSON) / **Zamítnout & Přegenerovat**
  - Pokud fáze má výstup a je ve stavu `waiting` nebo `rejected`: **Schválit stávající výstup** / **Zamítnout & Přegenerovat**

### Chybové stavy agenta

Pokud agent selže, zobrazí se:

- Červený banner s textem „Agent narazil na chybu" a doporučením zkontrolovat log
- Status badge fáze se změní na `Chyba`
- Tlačítko **Zkusit znovu** — restartuje agenta se stejným vstupem
- Fáze zůstane odemčená; uživatel může upravit vstup a zkusit znovu

### Agent activity log

- Živý stream řádků: timestamp + typ (`ok` / `info` / `warn` / `error`) + zpráva
- Monospace font, tmavé pozadí (`surface-900`)
- Barevně odlišené typy: `error` červeně, `warn` žlutě, `info` modře, `ok` šedě
- Během běhu agenta zobrazuje pulzující indikátor „Zpracovávám..."
- Po úspěšném dokončení se automaticky collapsne (kliknutím rozbalit)
- V případě chyby zůstane rozbalený
- Tlačítko pro zkopírování logu do schránky

### Systémový prompt editor

- Slide-in panel zprava (480px šířka)
- Editovatelný textarea s promptem agenta
- Indikátor „Upravený" badge, pokud byl výchozí prompt změněn
- Tlačítka: **Uložit** / **Obnovit výchozí** / **Zavřít**
- Varování při zavírání s neuloženými změnami (potvrzovací modal „Zahodit změny?")
- Změny se projeví při příštím spuštění agenta
- Výchozí systémové prompty jsou předvyplněné pro všech 13 fází (v češtině)

### Historie verzí výstupu

- Dostupná přes ikonu hodinky v hlavičce fáze (s badge počtu verzí)
- Slide-in panel zprava (420px šířka)
- Hlavička: „Historie verzí" s tlačítkem zavřít
- Vertikální timeline s barevnými tečkami na spojnici:
  - Modrá = Probíhá, Žlutá = Ke kontrole, Zelená = Schváleno, Červená = Zamítnuto
- Každá verze zobrazuje:
  - Číslo verze (v1, v2, ...)
  - Typ akce: `Vygenerováno` / `Upraveno` / `Obnoveno`
  - Status badge
  - Datum a čas
  - Poznámka (feedback zamítnutí, zdroj obnovení)
- Tlačítko **Obnovit tuto verzi** — vytvoří novou verzi typu `restored` s daty vybrané verze
- Obnovení je zakázáno pokud je verze aktuální nebo má shodná data

### Zamítnutí výstupu

Dva scénáře zamítnutí:

**1. Zamítnutí ze stavu `review`:**
- Kliknutí na **Zamítnout & Přegenerovat** → modal
- Modal: „Co agent udělal špatně?" — volitelné tagy (`Chybný obsah` / `Špatný formát` / `Nepochopil zadání` / `Jiné`) + volný text
- Varování: „Fáze bude resetována. Předchozí výstup bude uložen v historii verzí."
- Potvrzením → fáze přejde do stavu `rejected`, výstup se vymaže, feedback se uloží

**2. Zamítnutí schválené fáze:**
- Kliknutí na **Zamítnout & Přegenerovat** u schválené fáze → modal s varováním
- Varování: „Pozor: tato akce ovlivní navazující fáze. Navazující fáze budou znovu uzamčeny."
- Textarea pro důvod zamítnutí
- Potvrzením → fáze se resetuje, **navazující fáze se kaskádově uzamknou** (BFS přes závislostní strom)

### Export výstupu

- Tlačítko **Exportovat** dostupné u schválených/ready fází
- Exportuje výstup fáze jako JSON soubor ke stažení
- Název souboru: `F[N]-[Název_fáze].json`

### Dokumenty a reference

- Uploadované soubory zobrazeny jako klikatelné „pills" s ikonou podle typu souboru a názvem
- Ikony podle formátu: PDF, DOCX, TXT, MD
- Kliknutím → modal s náhledem obsahu dokumentu

### Notifikace

- In-app notifikační centrum: ikona zvonku v hlavní navigaci s odznáčkem nepřečtených (červený pulzující badge)
- Dropdown panel se seznamem notifikací
- Typy notifikací s ikonami:
  - 🕐 Fáze čeká na schválení
  - ✓✓ Agent dokončil zpracování
  - ✗ Fáze byla zamítnuta
  - ⚠ Připomenutí
- Kliknutím na notifikaci → navigace na danou fázi projektu + označení jako přečtené
- Tlačítko **Označit vše jako přečtené**
- Nepřečtené notifikace mají modrý indikátor

### Navigace a breadcrumb

- **Hlavní navigace** (sticky header, 56px): Logo „AI Portál" | odkaz Projekty | ikona Notifikace
- V detailu projektu: breadcrumb `Projekty › [Název projektu] › F[N]. [Název fáze]`
- Kliknutí na „Projekty" → seznam projektů
- Kliknutí na název projektu → aktuální aktivní fáze projektu
- URL struktura: `/projects/{id}/phase/{n}` — každá fáze má vlastní URL
- Přesměrování: `/projects/{id}` → `/projects/{id}/phase/1`

---

## Globální UX pravidla — přehled prázdných stavů

| Situace | Zobrazení |
|---|---|
| Žádné projekty na landing page | Ilustrace + text „Zatím žádné projekty" + CTA tlačítko |
| Zamčená fáze (ještě nedostupná) | Informační banner + odkaz na blokující fázi + disabled tlačítko Spustit |
| Fáze bez vstupu (ještě nespuštěna) | Šedý placeholder s popisem co fáze dělá a výzvou zadat vstup |
| Chyba agenta | Červený banner, popis chyby, tlačítko Zkusit znovu |
| Zamítnutá fáze | Červený banner s feedbackem zamítnutí |
| Historie verzí je prázdná | Ikona hodinky se nezobrazuje (skrytá při 0 verzích) |

---

## Fáze 1 — Kontakt & Lead

`Jednorázová` | Závislosti: žádné

**Účel:** První prověření zákazníka před zahájením obchodního procesu.

### Vstup

- Textové pole: název firmy nebo jméno osoby
- Checkboxy pro výběr zdrojů:
  - [x] Google
  - [x] LinkedIn
  - [x] ARES
  - [ ] Insolvenční rejstřík
- Tlačítko **Spustit investigaci**

### Agent

- Provede research dle vybraných zdrojů
- V reálném čase zobrazuje postup v agent logu

### Výstup (Research Report)

Výstup je zobrazen v kartách a strukturovaných sekcích:

- **Popis činnosti** (textový odstavec)
- **Doména podnikání** (kartička)
- **Právní & finanční status** — IČO, stav v ARES (zelený/červený badge)
- **Klíčové osoby** — tagy s jménem a pozicí
- **Odhadovaný obrat** (kartička)
- **Signály & rizika** — barevné tagy: zelená (pozitivní) / oranžová (varování) / červená (riziko)

---

## Fáze 2 — Discovery / Pochopení problému

`Jednorázová` | Závislosti: F1

**Účel:** Hlubší pochopení problému zákazníka z meetingového přepisu nebo záznamu.

### Vstup

- Upload souboru (drag & drop oblast s přijímanými formáty TXT, DOCX, MD) **nebo** textarea pro vložení textu
- Přepínač mezi uploadem a textovým vstupem
- Tlačítko **Spustit analýzu**

### Agent

- Analyzuje vstupní dokument
- Identifikuje klíčové informace

### Výstup

- **Definice problému** — textový odstavec
- **Přehled požadovaných funkcionalit** — seznam tagů s popisy
- **Uživatelské role** — seznam tagů
- **Otevřené otázky** — seznam s prioritou (vysoká / střední / nízká) jako barevné badge
- **Rizika a red flags** — seznam s popisem

---

## Fáze 3 — Koncept & Rozhodnutí

`Jednorázová` | Závislosti: F2

**Účel:** Vizualizace řešení a rozhodnutí o dalším postupu.

### Vstup

- Automaticky přebírá výstup z fáze 2 (zobrazeno jako read-only přehled)
- Tlačítko **Spustit návrh konceptu**

### Výstup

- **Doporučení přístupu** — karta s doporučením (fixed-price / T&M) a odůvodněním
- **Sitemap** — stromová struktura stránek s odsazením podle úrovně
- **Seznam obrazovek a klíčových komponent** — grid karet (název + popis)
- **Otevřené otázky** k dořešení před EP — seznam
- **Prezentace** — strukturovaný outline (nadpis slidu + bullet pointy)

---

## Fáze 4 — Engineering Project (EP)

`Jednorázová` | Závislosti: F3

**Účel:** Detailní technické zadání projektu, použitelné pro nacenění i jako příloha smlouvy.

### Vstup

- Automaticky přebírá výstup z fáze 3
- Tlačítko **Spustit tvorbu EP**

### Výstup

Kompletní EP zobrazený v strukturovaných sekcích:

- **Funkční požadavky** — číslovaný seznam s popisy
- **Nefunkční požadavky** — číslovaný seznam
- **Technologický stack** — tabulka (technologie + účel)
- **Hosting & infrastruktura** — popis
- **Maintenance plán** — popis
- **Rozsah dodávky** — dvě sekce: „Součástí dodávky" (zelené checkmarky) a „Není součástí" (červené křížky)

---

## Fáze 5 — Nabídka & Plán

`Jednorázová` | Závislosti: F4

**Účel:** Převod EP do cenové nabídky a harmonogramu.

### Vstup

- Automaticky přebírá EP z fáze 4
- Pole pro hodinovou sazbu (předvyplněno 2 500 Kč/h, upravitelné)
- Tlačítko **Generovat nabídku**

### Výstup

- **Souhrnné karty** — tři vedle sebe: celkem MD, hodinová sazba, celková cena
- **Rozpad na epics** — tabulka s názvy epiců, počtem stories a MD (editovatelná v budoucnu)
- **Harmonogram** — timeline s milníky (číslo milníku, název, týden, popis)

---

## Fáze 6 — Smlouvy

`Jednorázová` | Závislosti: F5

**Účel:** Kontrola souladu smlouvy s EP a nabídkou, identifikace rizikových míst.

### Vstup

- Upload smlouvy o dílo (drag & drop oblast, PDF nebo DOCX)
- Tlačítko **Analyzovat smlouvu**

### Výstup

- **Seznam rizikových míst** — každé riziko obsahuje:
  - Název a popis rizika
  - Závažnost: `Kritické` (červená) / `Varování` (oranžová) / `Informační` (modrá)
  - Citace ze smlouvy (šedý blok s uvozovkami)

---

## Fáze 7 — Projektový Setup

`Jednorázová` | Závislosti: F5

**Účel:** Bootstrapování projektového prostředí v externích nástrojích.

### Vstup

- Automaticky přebírá rozpad z fáze 5 a EP z fáze 4
- Tlačítko **Připravit rozpad ticketů**

### Průběh (dvoustupňový)

**Krok 1 — Návrh ticketů:**
- Agent vygeneruje rozpad na epics → stories → tasky
- Výstup je tabulka se sloupci: typ (barevný badge), název, story pointy
- Hierarchické odsazení (epic → story → task)
- Operátor provede review a klikne na **Schválit rozpad**

**Krok 2 — Vytvoření prostředí:**
- Po schválení se zobrazí dvě tlačítka: **Vytvořit GitHub repozitář** a **Vytvořit Jira projekt**
- Každé lze spustit samostatně
- Po „vytvoření" se zobrazí odkaz (simulovaný)

---

## Fáze 8 — Vývoj

`Kontinuální ↻` | Závislosti: F7

**Účel:** Implementace ticketu — agent vytvoří branch, naprogramuje změny a otevře Pull Request.

### Vstup

- Textové pole: URL Jira ticketu
- Tlačítko **Spustit implementaci**

### Výstup

- **Souhrn** implementovaných změn (textový odstavec)
- **Seznam změn** — bullet list s popisy
- **Odkaz na Pull Request** (klikatelný odkaz)
- **Odkaz na Jira ticket** (klikatelný odkaz)

### Speciální chování

- Po dokončení se fáze vrátí do stavu `ready` a čeká na další ticket
- Zobrazuje `↻ Naposledy spuštěno: [datum a čas]`

---

## Fáze 9 — Delivery & Scope Control

`Kontinuální ↻` | Závislosti: F7

**Účel:** Průběžná kontrola souladu stavu projektu s plánem.

### Vstup

- Dropdown pro nastavení frekvence: `Manuálně` / `1× týdně` / `1× za 2 týdny`
- Tlačítko **Zkontrolovat nyní**

### Výstup

- **Souhrnné karty** (tři vedle sebe):
  - Dokončeno (% skutečnost)
  - Plán (% dle harmonogramu)
  - Aktuální sprint (název)
- **Progress bary** — vizuální porovnání skutečnosti vs. plánu
- **Timeline** — seznam milníků se statusem (✓ Hotovo zelená / ◎ Probíhá modrá / ○ Plánováno šedá)
- **Seznam odchylek** — každá odchylka s typem (Skluz / Scope creep / Bloker jako barevný badge) a doporučenou akcí

---

## Fáze 10 — Testování

`Kontinuální ↻` | Závislosti: F7

**Účel:** Automatické ověření funkčnosti na základě akceptačních kritérií z EP.

### Vstup

- Textové pole: URL testovacího prostředí (QA / staging)
- Tlačítko **Spustit testování**

### Výstup

- **Souhrnné karty** (tři vedle sebe): Prošlo (zelená), Selhalo (červená), Přeskočeno (šedá) — s počty
- **Tabulka výsledků** — sloupce: scénář, status (barevný badge Prošlo/Selhalo/Přeskočeno)
- **Seznam bugů** — každý bug obsahuje: název, závažnost (Kritická/Vysoká/Střední/Nízká jako badge), popis

---

## Fáze 11 — Dokumentace

`Kontinuální ↻` | Závislosti: F7

**Účel:** Vytvoření a průběžná aktualizace kompletní dokumentace projektu.

### Vstup

- Automaticky přebírá GitHub repozitář z fáze 7 a EP z fáze 4
- Tlačítko **Generovat dokumentaci**

### Výstup

- **Tři dokumenty** zobrazené jako karty:
  - Uživatelská dokumentace — ikona, počet stran, tlačítko Stáhnout
  - Administrátorská dokumentace — ikona, počet stran, tlačítko Stáhnout
  - Provozní příručka — ikona, počet stran, tlačítko Stáhnout

> **Poznámka:** Tlačítka Stáhnout jsou v prototypu simulovaná.

---

## Fáze 12 — Předání & Akceptace

`Jednorázová` | Závislosti: F6, F10

**Účel:** Formální předání projektu zákazníkovi.

### Vstup

- Automaticky přebírá stav z ostatních fází
- Tlačítko **Připravit předávací dokumenty**

### Výstup

- **Akceptační protokol** — tabulka dodaných položek se statusem (✓ Dodáno / ○ Částečně / – Odloženo)
- **Delivery summary** — textový souhrn co bylo dodáno a co odloženo
- **Prezentace pro demo** — outline s nadpisy slidů a bullet pointy
- Tlačítka **Exportovat protokol** a **Exportovat prezentaci** (simulovaná)

---

## Fáze 13 — Provoz & Další Rozvoj

`Kontinuální ↻` | Závislosti: F12

**Účel:** Monitoring běžícího systému a podklady pro plánování dalšího rozvoje.

### Vstup

- Textové pole: URL na monitoring systém
- Tlačítko **Připojit monitoring**

### Výstup

- **Health dashboard** — grid karet s metrikami:
  - Dostupnost (%), Průměrná latence (ms), Chybovost (%), Poslední incident
- **Anomálie** — seznam identifikovaných odchylek s časovým razítkem a popisem
- **Rozvoj backlog** — seznam navržených priorit s úrovní priority (Vysoká/Střední/Nízká jako barevný badge)
- Tlačítko **Aktualizovat nyní** (manuální refresh)

---

## Datový model

### Project

```typescript
{
  id: string;
  name: string;
  client: string;
  createdAt: string;
  updatedAt: string;
  archived: boolean;
  phases: Record<number, PhaseState>;
}
```

### PhaseState

```typescript
{
  phaseId: number;
  status: PhaseStatus;
  log: LogEntry[];
  output: Record<string, unknown> | null;
  versions: OutputVersion[];
  currentVersionId: string | null;
  lastRunAt: string | null;
  input: Record<string, unknown> | null;
  systemPrompt: string;
  systemPromptModified: boolean;
  rejectionFeedback: string | null;
}
```

### OutputVersion

```typescript
{
  id: string;
  createdAt: string;
  action: 'generated' | 'edited' | 'restored';
  status: 'running' | 'review' | 'approved' | 'rejected';
  data: Record<string, unknown>;
  note?: string;
}
```

### Notification

```typescript
{
  id: string;
  projectId: string;
  projectName: string;
  phaseId: number;
  phaseName: string;
  type: 'approval_pending' | 'agent_done' | 'rejected' | 'reminder';
  message: string;
  createdAt: string;
  read: boolean;
}
```

---

## Plánované vylepšení

Následující funkce jsou navrženy pro budoucí iterace:

### Diff mezi verzemi výstupu

- Diff dostupný  v historii verzí — porovnání libovolné verze s předchozí
- Přidané položky zvýrazněny zeleně s `+`, odebrané červeně s `−` (přeškrtnuté)
- Komponenta `DiffView` je již připravena v kódu, zatím neintegrovaná

### Editovatelný výstup

- Inline editace každé položky výstupu přes ikonu ✎
- Smazání položky přes ×
- Přidání vlastní položky přes **+ Přidat**
- Vizuální rozlišení: AI položky (modrý levý pruh) vs. manuální (zelený levý pruh)
- Čítač neuložených změn v hlavičce
- Tlačítko **Přegenerovat AI** — vezme manuální úpravy jako základ a nechá AI doplnit zbytek
- Možnost editace pomocí json

### Iterativní spolupráce s agentem (F4)

- Agent v F4 (Engineering Project) nepracuje autonomně, ale iterativně s operátorem
- Agent navrhuje sekce EP jednu po druhé
- Pro každou sekci se zobrazí modal: „Agent navrhl: [název]. Schválit / Upravit / Zamítnout"
- U výběru technologií agent navrhne 2–3 varianty s odůvodněním; operátor vybere
- Modaly jsou neblokující — operátor může procházet portál a vrátit se

### Vytváření Jira ticketů z výstupů

- F7: Po schválení rozpadu ticketů skutečné vytvoření Jira projektu s backlogem
- F10: Tlačítko **Vytvořit tickety** — z nalezených bugů vytvoří Jira tickety

### Push notifikace

- Nativní browser push notifikace přes Web Push API
- Systém požádá o povolení při první návštěvě
- Pokud uživatel odmítne, notifikace fungují pouze in-app
- Push při: agent dokončil, fáze čeká na schválení, nalezeny odchylky (F9)

### Automatické plánování kontinuálních fází

- Nastavení frekvence spouštění pro F9, F10, F11, F13
- Automatické spuštění dle nastaveného plánu (1× týdně, 1× za 2 týdny)

### Generování souborů ke stažení

- F4: Export EP jako DOCX nebo PDF
- F5: Export cenové nabídky jako PDF pro zákazníka
- F3: Generování prezentace (PPTX/PDF) po schválení outline
- F11: Skutečné stažení vygenerovaných dokumentů
- F12: Export akceptačního protokolu jako PDF

### Interaktivní citace v dokumentech

- AI se referencuje na konkrétní místo v dokumentu (zvýrazněná citace)
- Zvýrazněné citace jsou klikatelné → scroll na místo v uploadovaném dokumentu
- Relevantní pro F2 (transkript), F6 (smlouva)

### Responzivní layout

- **Tablet (768–1279px):** Sidebar se collapsne do horního tab baru; kontextový panel pod hlavní obsah
- **Mobilní (<768px):** Out of scope pro MVP — portál je určen pro desktop práci

### Backend a persistence

- REST API / GraphQL backend pro perzistentní úložiště
- Reálná integrace s AI agenty (LLM API)
- Autentizace a autorizace uživatelů
- Reálná integrace s GitHub API (vytváření repozitářů, branches, PR)
- Reálná integrace s Jira API (vytváření projektů, ticketů)
- Upload a zpracování souborů (PDF, DOCX parsování)

### Monitoring a automatizace

- F13: Reálné napojení na Grafana/Kibana API pro stahování metrik
- Automatická detekce anomálií s notifikacemi
- F8: Skutečná implementace kódu přes AI agenta

---
