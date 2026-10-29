# Validatie — 21 oktober 2026

## Overdraagbare installatie — 29 oktober 2026

- `node --test`: 95 tests geslaagd, nul fouten, inclusief archiefherstel, afwijzen van padontsnapping en integriteitscontrole.
- Een schone bestandskopie zonder de oorspronkelijke `private/`-map start beide webservices en de gekoppelde tafel. Alle 156 afbeeldingen geven HTTP 200. De nieuwe tafelsessie heeft revisie nul en geen geplaatste onderdelen; geen campagne of apparaatinstelling is overgenomen.
- Browsercontrole op desktop (1440 × 1000) en mobiel (390 × 844): fysieke kaart geladen, tien Haven-labels aanwezig, geen paginafouten en geen horizontale overflow. Ook de gekoppelde bordpagina start zonder de oorspronkelijke ontwikkelbestanden.
- Beide .NET-programma's gebouwd met `dotnet publish` uit uitsluitend de meegeleverde eigen broncode, zonder SDK-libraries. De Bluetooth-radio is bij deze controles niet gestart en de officiële app is niet gewijzigd. Een verse fysieke verbinding op een tweede computer is nog niet uitgevoerd.

De oudere uitspraken hieronder over uitgesloten artwork en volledig private adaptercode beschrijven de eerdere distributiesituatie. Publicatietoestemming en installatie staan in [INSTALLATION.md](INSTALLATION.md).

## Actuele controle — 28 oktober 2026

- Publiek: `node --test` geslaagd, 94 tests, nul fouten; uitgevoerd vóór commit `fe0a5fa`. Private adaptercode, identifiers en artwork zijn niet opgenomen in Git.
- Geladen spel: het echte Milan-scherm toonde Agnese in Washington. Na twee gelijke waarnemingen corrigeerde onze tafel de oude positie Cadorna naar Washington. Live browsercontrole zonder paginafouten; geïsoleerde NPC- en companionproeven bevestigen behoud van andere onderdelen en idempotentie. Geen volledige save-import getest.
- Haven-labels: tien actuele geregistreerde bonussen zichtbaar in de browser, inclusief de opgeslagen +2 Willpower voor Haven 1L; geen bonuslabels in stadsdistricten en geen duplicaten na verversen.
- Virtuele Core: 26 private regressiescenario’s geslaagd, inclusief migratie van oude firmwarestatus, mislukte commit, afbreken, herstart en stabiele ringbatterij. Virtuele Bluetooth- en Control Center-browserproeven geslaagd.
- Echte Android-tablet, ongewijzigde Teburu-app 1.2.0: LED-ring 1.15.0, Firmware up to date, 46%, 3852 mV. Dit zijn gesimuleerde versies en batterijgegevens; geen officiële firmware geïnstalleerd.
- LED-oriëntatie: geïsoleerde browserproef met vier verschillende kleuren bevestigt licht 3 linksboven, 4 rechtsboven, 1 rechtsonder en 2 linksonder. De uitgebreidere bestaande Prospero-browserproef liep vast bij het zichtbaar worden van het accessoire en is voor deze wijziging niet als geslaagd aangemerkt. Volledige hardwareanimaties blijven buiten deze controle.

Oudere, gedateerde controles hieronder blijven als historisch bewijs behouden.

## Locatiekaart en opstellingshulp 0.6 — 22 oktober 2026

- `node --test`: 32 tests geslaagd. Toegevoegd: dertig district-ID’s plus tien Havenvelden, atomaire toepassing/undo/redo/replay, onbewezen-bronstatus, vier verschillende personages, eindige voorraden en componentzijden. Een lastige controleverdeling van 21 Anarchs en acht Camarilla wordt correct gematcht; onmogelijke verdelingen worden geweigerd. Zonecapaciteit en beschadigde opstellingen muteren niets.
- Browser: stadsprofiel standaard; veertig vakken, waarvan tien Havenvelden, districtslabels en attribuuttekst. Vier handmatig gekozen testpersonages met testlocaties, invloed/controle, afgesloten locatie, NPC en Masquerade via het formulier toegepast als één event. Undo maakte alle plaatsingen ongedaan; redo en JSON-import herstelden ook de zijden. Dubbel gekozen personage geweigerd met behoud van de opstelling.
- Toegankelijke labels van de opstellingskeuzes gecontroleerd. Desktop 1440 px en mobiel 390 px bekeken; geen pagina-overloop, ook niet met geopende districtentabel. Bronbeelden en screenshots blijven in genegeerd `work/`.
- Retail- en neutrale browserregressies, sensorstudie, referentiebezetting, JSON-herstel, herstelgeschiedenis en afgeschermde bestanden blijven slagen. Geen browserfouten.
- De formulierinvoer in deze tests is synthetisch. Geen claim dat deze de echte Chronicle-start voorstelt; geen officiële app/hardware gestart of gewijzigd. Exacte kaartgrenzen, Havenwerking en appgestuurde campagnebeginstand blijven open.

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

## Tafelindeling — 22 oktober 2026

- 37 Node-tests geslaagd, inclusief headless observatie van externe opdrachten, undo/redo/reset/import en controle van alle veertig visuele klikgebieden. Geen nieuwe domein-/saveversie.
- Browser: daadwerkelijke klik op de veertig fysieke kaartankers selecteert steeds het verwachte district/Havenveld. Figuren en fiches renderen boven de oorspronkelijke kaart; selectie, verplaatsing, omkeren, voorraad, volle locatie met +n, undo/redo en JSON-herstel gecontroleerd.
- Campagneformulier via apart venster: onvolledige invoer geweigerd, vier gekozen personages in één atomaire handeling geplaatst. Tabnavigatie, toetsenbordtabs en Escape, zoom, passend en bordfocus gecontroleerd.
- Weergave op 2560×1440, 1600×1000, 1366×768, tablet 768×1024 en mobiel 390×844; geen horizontale pagina-overloop. Desktoptafel past binnen de schermhoogte. Tablet/mobiel hebben de zijbalk onder de kaart. Desktop- en mobiele screenshots visueel bekeken.
- Een plaatsing en verplaatsing direct via de applicatie, buiten de UI, worden zonder expliciete refresh zichtbaar. Een lege artworkcatalogus houdt alle handelingen via het schema beschikbaar. Geen browserexceptions tijdens deze controles.
- Oudere profielen (retail, neutrale tafel, sensorstudie en referentie) gecontroleerd via het instellingenvenster, inclusief zoeken, toetsenbordplaatsing met focusbehoud en vrijgeven van sensorcontact. Een ontbrekend kaartbestand valt eveneens terug op het schema; 320 px heeft geen horizontale pagina-overloop.
- Geen officiële app gestart of aangepast. Geen echte cityronde-, protocol- of hardwaretest. Appcompatibiliteit en automatische invloedsoverdracht blijven open.
