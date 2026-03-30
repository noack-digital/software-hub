# Software Hub - Kompletter Redesign-Plan

**Datum:** 2026-01-22
**Status:** 🔴 **In Planung**
**Priorität:** KRITISCH

---

## Executive Summary

Die PHP-Version unterscheidet sich **fundamental** von der Next.js Original-Version. Es sind nicht nur CSS-Anpassungen nötig, sondern **strukturelle HTML/JavaScript-Änderungen**.

### Hauptprobleme identifiziert:

1. ❌ **Filter-System:** Dropdowns statt Button-basiert
2. ❌ **Page Header:** Großer Titel "Software-Katalog" (soll weg)
3. ❌ **Card Layout:** Komplett andere Struktur
4. ❌ **Badge Position:** Andere Platzierung
5. ✅ **Header:** Grundstruktur OK (aber Feintuning nötig)

---

## 🎯 Screenshot-Vergleich Analyse

### Original Next.js (Screenshot 1)
```
┌─────────────────────────────────────┐
│ Header: [📦 Software Hub] [DE/EN] [User] │
├─────────────────────────────────────┤
│      [Suche...]                      │
│                                      │
│  [Lehrende] [Webkonferenzen] [Studierende] [Mitarbeitende]  │← Zielgruppen als Buttons
│                                      │
│  [Audio] [Datenanalyse...] [E-Learning] [Office] [Programmierung] [Webkonferenzen]  │← Kategorien als Buttons
│                                      │
├─────────────────────────────────────┤
│  ┌─────┐  ┌─────┐  ┌─────┐         │
│  │ 🎨  │  │ 🔒  │  │ 📹  │         │← Software Cards
│  │Adobe│  │Crypt│  │Camta│         │
│  │Badge│  │Badge│  │Badge│         │
│  └─────┘  └─────┘  └─────┘         │
└─────────────────────────────────────┘
```

### PHP Version (Screenshot 2)
```
┌─────────────────────────────────────┐
│ Header: [📦 Software Hub] [DE/EN] [Admin] │
├─────────────────────────────────────┤
│    Software-Katalog                  │← PROBLEM: Großer Titel
│    Entdecken Sie unsere Sammlung    │← PROBLEM: Untertitel
│                                      │
│  [Suche...] [▼ Alle Kategorien] [▼ Alle Zielgruppen] │← PROBLEM: Dropdowns
│                                      │
├─────────────────────────────────────┤
│  ┌─────┐  ┌─────┐  ┌─────┐         │
│  │ 🎵  │  │ 🎥  │  │ 📊  │         │← Cards anders
│  │Auda.│  │Camta│  │SPSS │         │
│  │Badge│  │Badge│  │Badge│         │
│  └─────┘  └─────┘  └─────┘         │
└─────────────────────────────────────┘
```

---

## 📋 Detaillierte Unterschiede

### 1. Filter-System (🔴 KRITISCH)

| Aspekt | Original Next.js | PHP Version | Aufwand |
|--------|------------------|-------------|---------|
| **Zielgruppen** | Button-Reihe, `rounded-full` | Dropdown Select | **HOCH** |
| **Kategorien** | Button-Reihe, `rounded-full` | Dropdown Select | **HOCH** |
| **Layout** | Zentriert, mehrzeilig, wrap | Horizontal in einer Bar | **MITTEL** |
| **Interaktion** | Toggle-Buttons (primary/outline) | Standard Select | **HOCH** |
| **Komponente** | React `<TargetGroupFilter>`, `<CategoryFilter>` | Vanilla JS + Select | **HOCH** |

**Implementierung:**
- Neue PHP Components: `filter-buttons.php`
- JavaScript: Button-Click Handler für Filter
- CSS: `rounded-full` Buttons, hover states
- API: Gleich, nur UI-Änderung

---

### 2. Page Header (🟡 MITTEL)

| Aspekt | Original Next.js | PHP Version | Aufwand |
|--------|------------------|-------------|---------|
| **Titel** | KEIN großer Titel | `<h1>Software-Katalog</h1>` | **NIEDRIG** |
| **Untertitel** | KEIN Untertitel | `<p>Entdecken Sie...</p>` | **NIEDRIG** |
| **Spacing** | Kompakt nach Header | Großer Abstand | **NIEDRIG** |

**Implementierung:**
- Entfernen: `.page-header`, `.page-title`, `.page-subtitle` aus HTML
- CSS: Anpassung der Abstände
- Layout: Filter direkt nach Header

---

### 3. Search Input (🟢 OK, aber Feintuning)

| Aspekt | Original Next.js | PHP Version | Aufwand |
|--------|------------------|-------------|---------|
| **Position** | Über Filtern, zentriert | In Filter-Bar links | **NIEDRIG** |
| **Breite** | `max-w-md` (ca. 28rem) | Variable | **NIEDRIG** |
| **Style** | Zentriert, solo | Teil der Filter-Bar | **NIEDRIG** |

**Implementierung:**
- HTML: Search Input vor Filtern, zentriert
- CSS: `max-w-md`, zentriert mit `mx-auto`

---

### 4. Card Layout (🔴 KRITISCH)

| Aspekt | Original Next.js | PHP Version | Aufwand |
|--------|------------------|-------------|---------|
| **Logo** | Klein (h-6 w-6), inline | Größer (48px), prominenter | **MITTEL** |
| **Titel-Zeile** | Logo + Name + ExternalLink + Type Icons | Anderes Layout | **MITTEL** |
| **Badges (Privacy)** | `absolute top-2 right-2` | Vermutlich anders | **MITTEL** |
| **Badges (Kategorie)** | Unten, `Badge` Component | Anders platziert | **MITTEL** |
| **Footer** | 1 Button zentriert ("Details") | 2 Buttons ("Website" + "Details") | **HOCH** |

**Original Card Struktur:**
```jsx
<Card>
  {/* Absolute Badges top-right */}
  <div className="absolute top-2 right-2">
    <Badge>DSGVO</Badge>
    <Badge>Verfügbar</Badge>
  </div>

  <CardContent className="p-6">
    {/* Titel-Zeile */}
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center gap-2">
        <img className="h-6 w-6" />  {/* Klein! */}
        <h3>Name</h3>
        <a><ExternalLink /></a>
        {types.map(type => <Icon />)}
      </div>
    </div>

    {/* Beschreibung */}
    <p className="text-sm text-gray-600 mb-4">...</p>

    {/* Kategorie-Badges */}
    <div className="flex flex-wrap gap-2 mb-4">
      <Badge>Kategorie</Badge>
    </div>
  </CardContent>

  <CardFooter className="p-6 pt-0 flex justify-center">
    <Button>Details anzeigen</Button>  {/* NUR 1 Button! */}
  </CardFooter>
</Card>
```

**Implementierung:**
- HTML: Komplette Card-Struktur umbauen
- JavaScript: Card-Rendering anpassen
- CSS: Badge-Positionierung, Logo-Größe
- Entfernen: "Website besuchen" Button

---

### 5. Badge System (🟡 MITTEL)

| Aspekt | Original Next.js | PHP Version | Aufwand |
|--------|------------------|-------------|---------|
| **Position** | `absolute top-2 right-2` | Vermutlich inline | **MITTEL** |
| **Privacy Badge** | Weißer Hintergrund mit Dot | Anders gestyled | **MITTEL** |
| **Verfügbar Badge** | Dynamische Farbe aus Settings | Grüner Badge | **NIEDRIG** |
| **Layout** | Vertikal gestapelt | Anders | **MITTEL** |

**Implementierung:**
- CSS: `absolute`, `top-2`, `right-2`
- HTML: Badge-Container vor CardContent
- Styling: Weiße Badges mit Schatten

---

### 6. Header (🟢 FAST OK)

| Aspekt | Original Next.js | PHP Version | Aufwand |
|--------|------------------|-------------|---------|
| **Grundstruktur** | ✓ Ähnlich | ✓ Ähnlich | **NIEDRIG** |
| **Sticky** | ✓ Ja | ✓ Ja | **KEINE** |
| **User Nav** | UserNav Component | "Admin" Link | **NIEDRIG** |
| **Backdrop Blur** | ✓ Ja (`backdrop-blur-lg`) | ? | **NIEDRIG** |

**Implementierung:**
- CSS: Backdrop-blur hinzufügen
- HTML: "Admin" Button behalten (OK)

---

## 🚀 Implementierungs-Plan

### Phase 1: Filter-System (Höchste Priorität) 🔴
**Geschätzte Zeit:** 4-6 Stunden

#### Schritt 1.1: Filter-Buttons HTML erstellen
```php
<!-- In index.php nach Search Input -->
<div class="filter-section">
    <!-- Zielgruppen Filter -->
    <div class="filter-buttons" id="targetGroupFilters">
        <button class="filter-btn active" data-group="">
            <span data-t="targetGroups.all">Alle Zielgruppen</span>
        </button>
        <!-- Dynamisch befüllt via JavaScript -->
    </div>

    <!-- Kategorien Filter -->
    <div class="filter-buttons" id="categoryFilters">
        <button class="filter-btn active" data-category="">
            <span data-t="categories.all">Alle</span>
        </button>
        <!-- Dynamisch befüllt via JavaScript -->
    </div>
</div>
```

#### Schritt 1.2: CSS für Filter-Buttons
```css
/* In style.css */
.filter-section {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 2rem;
}

.filter-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    justify-content: center;
    padding: 1rem 0;
}

.filter-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.5rem 1rem;
    border-radius: 9999px; /* rounded-full */
    font-size: 0.875rem;
    font-weight: 500;
    border: 1px solid var(--color-gray-300);
    background: white;
    color: var(--color-gray-700);
    cursor: pointer;
    transition: var(--transition);
}

.filter-btn:hover {
    background: var(--color-gray-50);
    border-color: var(--color-gray-400);
}

.filter-btn.active {
    background: var(--color-primary);
    color: white;
    border-color: var(--color-primary);
}

.filter-btn.active:hover {
    background: var(--color-primary-dark);
}
```

#### Schritt 1.3: JavaScript für Filter-Logik
```javascript
// In app.js
async function loadFilters() {
    // Zielgruppen laden
    const targetGroups = await fetchAPI('/api/target-groups.php');
    const targetGroupContainer = document.getElementById('targetGroupFilters');

    targetGroups.forEach(group => {
        const btn = document.createElement('button');
        btn.className = 'filter-btn';
        btn.dataset.group = group.id;
        btn.textContent = currentLang === 'en' && group.name_en ? group.name_en : group.name;
        btn.addEventListener('click', () => toggleFilter('targetGroup', group.id));
        targetGroupContainer.appendChild(btn);
    });

    // Kategorien laden
    const categories = await fetchAPI('/api/categories.php');
    const categoryContainer = document.getElementById('categoryFilters');

    categories.forEach(cat => {
        const btn = document.createElement('button');
        btn.className = 'filter-btn';
        btn.dataset.category = cat.id;
        btn.textContent = currentLang === 'en' && cat.name_en ? cat.name_en : cat.name;
        btn.addEventListener('click', () => toggleFilter('category', cat.id));
        categoryContainer.appendChild(btn);
    });
}

function toggleFilter(type, id) {
    const buttons = document.querySelectorAll(
        type === 'category' ? '[data-category]' : '[data-group]'
    );

    buttons.forEach(btn => {
        const btnId = btn.dataset[type === 'category' ? 'category' : 'group'];
        if (btnId === id || (id === '' && btnId === '')) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // Filter anwenden
    if (type === 'category') {
        currentFilters.category = id;
    } else {
        currentFilters.targetGroup = id;
    }

    loadSoftware();
}
```

#### Schritt 1.4: Alte Dropdowns entfernen
```diff
- <select id="categoryFilter" class="form-select">...</select>
- <select id="targetGroupFilter" class="form-select">...</select>
```

**Testkriterien:**
- [ ] Filter werden als Buttons angezeigt
- [ ] Active State funktioniert (Toggle)
- [ ] Mehrsprachigkeit funktioniert
- [ ] Responsive (wrap bei kleinen Screens)

---

### Phase 2: Page Header entfernen 🟡
**Geschätzte Zeit:** 1 Stunde

#### Schritt 2.1: HTML anpassen
```diff
<!-- In index.php -->
- <div class="page-header">
-     <h1 class="page-title" data-t="software.title">Software-Katalog</h1>
-     <p class="page-subtitle" data-t="software.subtitle">Entdecken Sie unsere Software-Sammlung</p>
- </div>
```

#### Schritt 2.2: CSS anpassen
```css
/* Spacing nach Header direkt zur Suche */
.main {
    padding-top: 2rem; /* statt 3rem */
}

/* Search Input zentrieren */
.search-wrapper {
    max-width: 28rem;
    margin: 0 auto 2rem;
}
```

**Testkriterien:**
- [ ] Kein großer Titel mehr
- [ ] Kompakte Ansicht wie Original
- [ ] Suche ist zentriert

---

### Phase 3: Search Input Layout 🟢
**Geschätzte Zeit:** 30 Minuten

#### Schritt 3.1: HTML umstrukturieren
```html
<!-- Search Input VOR Filter-Section, zentriert -->
<div class="search-container">
    <div class="search-wrapper">
        <svg class="search-icon">...</svg>
        <input type="text" id="searchInput" class="form-input search-input">
    </div>
</div>

<div class="filter-section">
    <!-- Filter Buttons hier -->
</div>
```

#### Schritt 3.2: CSS
```css
.search-container {
    display: flex;
    justify-content: center;
    margin-bottom: 1rem;
}

.search-wrapper {
    max-width: 28rem; /* 448px */
    width: 100%;
}
```

---

### Phase 4: Card Layout umbauen 🔴
**Geschätzte Zeit:** 6-8 Stunden

#### Schritt 4.1: Logo verkleinern
```diff
// In renderSoftwareCard() JavaScript
- <img src="${software.logo}" class="software-logo" />  /* 48px */
+ <img src="${software.logo}" class="h-6 w-6 object-contain" />  /* 24px */
```

```css
.h-6 { height: 1.5rem; }  /* 24px */
.w-6 { width: 1.5rem; }
```

#### Schritt 4.2: Card Struktur neu
```javascript
function renderSoftwareCard(software) {
    return `
        <div class="card software-card">
            <!-- Privacy & Verfügbar Badges absolute -->
            <div class="card-badges-absolute">
                ${software.dataPrivacyStatus ? renderPrivacyBadge(software) : ''}
                ${software.available && settings.showBadges ? renderAvailableBadge() : ''}
            </div>

            <div class="card-body">
                <!-- Titel-Zeile: Logo + Name + ExternalLink + Type Icons -->
                <div class="card-title-row">
                    <div class="flex items-center gap-2 flex-1">
                        ${software.logo ? `<img src="${software.logo}" class="h-6 w-6 object-contain" />` : ''}
                        <h3 class="font-semibold">${software.name}</h3>
                        <a href="${software.url}" target="_blank" class="text-primary hover:text-primary/80">
                            <svg class="h-4 w-4"><!-- ExternalLink Icon --></svg>
                        </a>
                        ${software.types.map(type => renderTypeIcon(type)).join('')}
                    </div>
                </div>

                <!-- Beschreibung -->
                <p class="text-sm text-gray-600 mb-4">${software.shortDescription}</p>

                <!-- Kategorie Badges -->
                <div class="flex flex-wrap gap-2 mb-4">
                    ${software.categories.map(cat => `<span class="badge badge-secondary">${cat.name}</span>`).join('')}
                </div>
            </div>

            <div class="card-footer">
                <!-- NUR 1 Button: Details -->
                <button class="btn btn-primary w-auto px-8" onclick="showDetails('${software.id}')">
                    Details anzeigen
                </button>
            </div>
        </div>
    `;
}
```

#### Schritt 4.3: CSS für neue Struktur
```css
/* Card Badges Absolute */
.card-badges-absolute {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    z-index: 10;
}

/* Privacy Badge */
.privacy-badge {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: rgba(255, 255, 255, 0.9);
    padding: 0.25rem 0.5rem;
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 500;
    box-shadow: var(--shadow);
}

.privacy-dot {
    width: 0.625rem;
    height: 0.625rem;
    border-radius: 50%;
}

.privacy-dot.dsgvo { background: #22c55e; }
.privacy-dot.eu { background: #eab308; }
.privacy-dot.non-eu { background: #ef4444; }

/* Titel-Zeile */
.card-title-row {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 1rem;
}

.card-title-row h3 {
    font-size: 1rem;
    font-weight: 600;
}

/* Icon utilities */
.h-4 { height: 1rem; }
.w-4 { width: 1rem; }
.h-6 { height: 1.5rem; }
.w-6 { width: 1.5rem; }
```

#### Schritt 4.4: "Website besuchen" Button entfernen
```diff
// Der ExternalLink Icon in der Titel-Zeile ersetzt den separaten Button
- <a href="${software.url}" class="btn btn-secondary">Website besuchen</a>
```

**Testkriterien:**
- [ ] Logo ist klein (24px)
- [ ] Titel-Zeile: Logo + Name + ExternalLink + Icons
- [ ] Badges sind top-right absolute
- [ ] Nur 1 Button im Footer
- [ ] Card sieht wie Original aus

---

### Phase 5: Badge-System anpassen 🟡
**Geschätzte Zeit:** 2-3 Stunden

#### Schritt 5.1: Privacy Badge mit Dot
```javascript
function renderPrivacyBadge(software) {
    const statusMap = {
        'DSGVO_COMPLIANT': {
            label: translations[currentLang].privacy.dsgvo || 'DSGVO-konform',
            color: 'dsgvo',
            tooltip: 'Diese Software wird DSGVO-konform betrieben.'
        },
        'EU_HOSTED': {
            label: translations[currentLang].privacy.eu || 'Hosting in der EU',
            color: 'eu',
            tooltip: 'Server befinden sich in der EU.'
        },
        'NON_EU': {
            label: translations[currentLang].privacy.nonEu || 'Server außerhalb der EU',
            color: 'non-eu',
            tooltip: 'Serverstandort außerhalb der EU.'
        }
    };

    const status = statusMap[software.dataPrivacyStatus];
    if (!status) return '';

    return `
        <div class="privacy-badge" title="${status.tooltip}">
            ${software.inhouseHosted && settings.inhouseLogoUrl ?
                `<img src="${settings.inhouseLogoUrl}" class="h-5 w-5" alt="Inhouse" />` :
                ''}
            <span class="privacy-dot ${status.color}"></span>
            <span>${status.label}</span>
        </div>
    `;
}
```

#### Schritt 5.2: Verfügbar Badge
```javascript
function renderAvailableBadge() {
    return `
        <div class="available-badge" style="
            background-color: ${settings.badgeBackgroundColor || '#10b981'};
            color: ${settings.badgeTextColor || '#ffffff'};
        ">
            ${settings.badgeText || 'Verfügbar'}
        </div>
    `;
}
```

```css
.available-badge {
    padding: 0.25rem 0.75rem;
    font-size: 0.875rem;
    font-weight: 600;
    border-radius: 0.25rem;
    box-shadow: var(--shadow-md);
    background: white;
}
```

---

### Phase 6: Feintuning & Testing 🟢
**Geschätzte Zeit:** 2-4 Stunden

#### Schritt 6.1: Backdrop Blur für Header
```css
.header.sticky {
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
}
```

#### Schritt 6.2: Grid Spacing
```css
.grid {
    gap: 1.5rem; /* 24px wie Original */
}
```

#### Schritt 6.3: Responsive Testing
- Mobile: Filter-Buttons wrappen
- Tablet: 2 Spalten Grid
- Desktop: 3 Spalten Grid

**Testkriterien:**
- [ ] Desktop: Identisch mit Original
- [ ] Tablet: Layout funktioniert
- [ ] Mobile: Buttons wrappen korrekt
- [ ] Animationen smooth
- [ ] Performance OK

---

## 📊 Gesamtaufwand

| Phase | Beschreibung | Priorität | Aufwand | Risiko |
|-------|--------------|-----------|---------|--------|
| **Phase 1** | Filter-System Button-basiert | 🔴 KRITISCH | 4-6h | MITTEL |
| **Phase 2** | Page Header entfernen | 🟡 HOCH | 1h | NIEDRIG |
| **Phase 3** | Search Input Layout | 🟢 MITTEL | 0.5h | NIEDRIG |
| **Phase 4** | Card Layout umbauen | 🔴 KRITISCH | 6-8h | HOCH |
| **Phase 5** | Badge-System | 🟡 HOCH | 2-3h | MITTEL |
| **Phase 6** | Feintuning & Testing | 🟢 MITTEL | 2-4h | NIEDRIG |
| **GESAMT** | - | - | **16-23h** | **MITTEL** |

---

## 🎯 Erfolgskriterien

### Must-Have (Kritisch)
- [x] ~~CSS-Farben angepasst~~ (Bereits erledigt)
- [ ] Filter als Buttons (nicht Dropdowns)
- [ ] Card Layout wie Original (Logo klein, ExternalLink Icon)
- [ ] Badges absolute positioned
- [ ] Nur 1 Button pro Card ("Details anzeigen")
- [ ] Kein Page Header "Software-Katalog"

### Should-Have (Wichtig)
- [ ] Search Input zentriert über Filtern
- [ ] Backdrop Blur im Header
- [ ] Type Icons in Card-Titel
- [ ] Privacy Badge mit Dot
- [ ] Responsive Design perfekt

### Nice-to-Have (Optional)
- [ ] Animationen wie Original (Framer Motion nachbilden)
- [ ] Smooth Transitions
- [ ] Hover-Effekte exakt
- [ ] Performance-Optimierung

---

## 🚨 Risiken & Mitigation

### Risiko 1: Filter-Button-Logik komplex
**Mitigation:** Schrittweise implementieren, erst HTML/CSS, dann JS

### Risiko 2: Card-Rendering Performance
**Mitigation:** Virtual Scrolling falls >100 Cards (später)

### Risiko 3: Responsive-Probleme
**Mitigation:** Mobile-First Approach, progressive enhancement

### Risiko 4: Browser-Kompatibilität (backdrop-filter)
**Mitigation:** Fallback mit solid background

---

## 📝 Nächste Schritte

1. **User Approval einholen** für diesen Plan
2. **Backup erstellen** von aktueller Version
3. **Branch erstellen** für Redesign (optional)
4. **Phase 1 starten:** Filter-System
5. **Iterativ testen** nach jeder Phase
6. **Screenshots vergleichen** mit Original

---

## 🔄 Rollback-Strategie

Falls das Redesign nicht funktioniert:

```bash
# Git verwenden (falls initialisiert)
git stash
git checkout main

# Oder Backup wiederherstellen
cp -r software-hub-php-backup/* software-hub-php/
```

---

## 📚 Referenzen

- **Original Code:** `/software-hub/src/app/page.tsx`
- **Filter Components:**
  - `/software-hub/src/components/CategoryFilter.tsx`
  - `/software-hub/src/components/TargetGroupFilter.tsx`
- **PHP Code:** `/software-hub-php/index.php`
- **JavaScript:** `/software-hub-php/assets/js/app.js`
- **Screenshots:**
  - `/home/anoack/Bilder/claude-screenshots_1.png` (Original)
  - `/home/anoack/Bilder/claude-screenshots_2.png` (PHP aktuell)

---

**Erstellt von:** Claude Code + Nutzer-Feedback
**Letzte Aktualisierung:** 2026-01-22
**Status:** 🟡 Warte auf Approval zur Implementierung
