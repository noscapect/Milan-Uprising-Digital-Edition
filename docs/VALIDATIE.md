# Validatie — 21 oktober 2026

## Milan-content 0.5 — 22 oktober 2026

- `node --test`: 26 tests geslaagd. Retailaantallen en drie controlefichecombinaties gecontroleerd, plus bron-/groep-/zijdevalidatie. Gemengde retailonderdelen geplaatst; fiche omgekeerd, verplaatst, teruggenomen, ongedaan/opnieuw uitgevoerd en na JSON-export via replay hersteld. Onjuiste eindzijde geweigerd zonder toestandverlies. Geen kleuren in de domeintoestand.
- Browser: retail standaard, 132 onderdelen in de keuzelijst, zeven personages in de eerste categorie, drie bronlinks. Personages, invloed en controle samen in A1; omkeren veranderde de factiekleur en toegankelijke zijdenaam; undo/redo herstelde beide. Onderzoeksfiche met Enter geplaatst en omgekeerd. NPC op H5; omkeren voor eenzijdige onderdelen uitgeschakeld.
- Categorieën, zoeken op naam en lege zoekresultaten gecontroleerd. Retail-JSON daadwerkelijk gedownload, bord geleegd en hersteld met behoud van ficheszijden. Retailbestand in neutraal profiel geweigerd. Geen browserfouten. Desktop 1440 px en mobiel 390 px gecontroleerd, zonder pagina-overloop.
- Bestaande browsercontroles voor neutrale tafel, JSON, herstelgeschiedenis, sensorstudie, referentiebezetting en afgeschermde bestanden blijven slagen. Screenshots en tijdelijke scripts staan onder genegeerd `work/`.
- De lokale server is herstart om het nieuwe JSON-pakket te registreren. Geen externe runtime-dependencies, beschermde afbeeldingen of appbestanden toegevoegd. Geen echte locatiemapping, scenario-opstelling of officiële-appverbinding geclaimd.

## Herstelgeschiedenis — 22 oktober 2026

- `node --test`: 21 tests geslaagd. Toegevoegd: ongedaan maken/opnieuw uitvoeren van plaatsen, verwijderen en leegmaken; dezelfde worp zonder nieuwe RNG; vertakken na teruggaan; behoud van redo na een geweigerde opdracht; limiet van honderd stappen; import/export van de actieve eventreeks.
- Browser: knoppen aanvankelijk uitgeschakeld; worp ongedaan en opnieuw uitgevoerd met identieke uitkomst; leegmaken ongedaan gemaakt met herstel van onderdelen en worp. Na import beide knoppen uitgeschakeld. In sensorstudie blijven beide uitgeschakeld.
- Bestaande browsercontroles voor voorraad, gemengde bezetting, bewegen/verwijderen, toetsenbordfocus, JSON-herstel, ongeldige import, mobiel en afgeschermde bestanden opnieuw geslaagd.

## Virtuele tafel 0.4 — 22 oktober 2026

- `node --test`: 18 tests geslaagd. Toegevoegd: gemengde onderdelen in gedeelde zones, afzonderlijk bewegen/verwijderen, atomaire capaciteitscontrole, volledige werkvoorraad en deterministische replay, hervatten zonder nieuwe willekeur en weigering van beschadigde/verkeerde exports zonder toestandverlies.
- Headless Chromium, eigen lokale webapp: 24 selecteerbare onderdelen; pionnen, kubus en fiche samen op A1; kubus afzonderlijk naar H5; fiche terug naar voorraad; toetsenbordplaatsing met behoud van celfocus; d10-worp.
- JSON daadwerkelijk gedownload, tafel geleegd en dezelfde sessie via bestandsinvoer hersteld. Ongeldig JSON-sessieformaat geweigerd met behoud van de tafel.
- Sensorstudie: twee geregistreerde pionnen na vrijgeven in dezelfde zone behouden. Referentieprofiel: bezette zone blijft geweigerd. Geen browserfouten. `.git/config` en een privépad geven 404.
- Desktop 1440 px en mobiel 390 px visueel bekeken. Gevonden pagina-overloop op mobiel verholpen; alleen het bord scrolt horizontaal. Tijdelijke controles en screenshots staan onder genegeerd `work/`; de demo zelf heeft geen externe dependencies.
- Geen officiële app gestart, hardware aangesloten of emulatorverbinding bewezen. Aantallen werkvoorraad en capaciteit zijn expliciete placeholders.

## Interactiestudie 0.3

- Dertien tests geslaagd: eerdere negen plus gescheiden identiteit/contact/positie, gedeelde zones, herhaalde interactie, foutafhandeling en expliciet verwijderen.
- Browser: contact zonder registratie geweigerd; p1 en p2 na afzonderlijke registratie via dezelfde A1-sensor in dezelfde zone geplaatst; vrijgeven behield beide posities. Herhaald contact via Enter maakte een interactie-event zonder verplaatsing. D10 en JSON-download werkten.
- Profielkeuze met expliciete startknop getest: referentieprofiel toont d6/d10 en normale pionplaatsing; simulatorcontrols verdwijnen. Profielstart wist bewust de sessie, vooraf zichtbaar aangegeven.
- Officiële Windows-download via HEAD gecontroleerd: HTTP 200, doel VTMTEBURU_v1.0.9.zip. Geen appdownload/installatie/runtime- of compatibiliteitstest uitgevoerd.
- De inputtrace is eigen demo-invoer, geen hardwarecapture. Echte sensormapping, protocol en officiële appverbinding blijven onbekend.

## Modulaire doorsnede 0.2

- `node --test`: negen tests geslaagd, inclusief oorspronkelijke regressies, headless referentiesessie, tweede profiel met afwijkende geometrie/capaciteit, ongeldige data/opdrachten, revisie/actorcontrole, beschermde snapshots en deterministische replay met vastgelegde worpen.
- Browser: veertig cellen; plaatsen A1, verplaatsen H5, tweede pion op bezet H5 geweigerd zonder nieuw event; Enter op A1, verwijderen, d6/d10, leegmaken gecontroleerd.
- JSON-download daadwerkelijk ontvangen en gecontroleerd: tabletop-session v1, sandbox, zes events/revisie 6. Geen importfunctie geclaimd.
- Visuele desktopcontrole uitgevoerd; bord, pionkleur, bediening en activiteiten zichtbaar.
- Alle actieve modules, JSON-profiel en legacydemo bereikbaar met HTTP 200; .git/config geeft 404.
- Geen 3D-renderer, volledige Milan-regels of hardwarekoppeling getest/geïmplementeerd. De fysieke referentievergelijking staat nog open.

## Oorspronkelijke demo 0.1 (historisch)

- `node --test`: 3 tests geslaagd (verplaatsen/verwijderen, grenzen/ID's, bezetting zonder stateverlies).
- `node --check src/app.js` en `node --check server.mjs`: geslaagd.
- Lokale server: HTTP 200 voor de startpagina.
- Visuele browsercontrole: niet afgerond; de browserautomatisering liep vast bij openen. Handmatig controleren: veertig cellen, plaats/verplaats/verwijder, bezette cel, d6/d10, JSON-export, leegmaken en toetsenbordbediening. Deze handelingen zijn nog niet end-to-end getest.
- Geen hardware of officiële app aangesloten of gewijzigd. Appcompatibiliteit en emulatie niet getest.

Omgeving bevat Node.js 24, maar geen npm op PATH. Gebruik daarom de directe Node-commando's uit README.md.
