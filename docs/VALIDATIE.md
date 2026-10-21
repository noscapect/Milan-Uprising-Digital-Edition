# Validatie — 21 oktober 2026

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
