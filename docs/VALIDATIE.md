# Validatie — 21 oktober 2026

## Tegelbehoud tijdens vervolgsetup — 30 oktober 2026

Alle 144 publieke tests slagen met Node 26 en de gebundelde Node 22. De nieuwe regressie doorloopt de echte adapter van Board tiles naar Components setup: tegelstand en kamerupgrades blijven identiek, ook na herhaalde componentwaarneming; expliciet leegmaken blijft alles wissen. De live verdwenen tegels zijn uit de exacte automatische-resetback-up hersteld zonder de 63 geplaatste onderdelen te wijzigen. Lokale en LAN-browsercontrole bevestigen beide symbolen nadat Milan al naar companion placement is gegaan. Zie [de overgangscorrectie](LOCATIETEGELS.md#preserve-tiles-through-the-next-setup-step).

## Locatietegels na hervatten — 30 oktober 2026

- Alle 143 publieke tests slagen met Node 26 en de gebundelde Node 22. Nieuwe proeven controleren de volledige dertig-districtsbonusinventaris, twee onafhankelijke waarnemingen, generatiegrenzen, afwijzen van gewone kaarten/verkeerde geometrie/dubbele tegels, geen achterzijde op alleen een ontbrekend icoon, behoud van kamerupgrades en idempotentie.
- De echte adapterketen is geïsoleerd met een opgenomen setupbeeld herhaald: het eerste beeld past geen tegels toe; het tweede bevestigt 29 locaties. Washington blijft automatisch onbevestigd en is voor de huidige opstelling afzonderlijk visueel gecontroleerd en gekopieerd. Andere speciale illustraties dan Haven zijn nog niet automatisch herkend.
- Browsercontrole op localhost én de LAN-bordlink bevestigt Haven op QT8, Underground op Portello, uitleg onder Location en uitsluitend symbolen op het stadsbord. De verbinding met Milan bleef actief; er is geen app-, scan- of sensorinvoer verstuurd. Zie [locatietegels](LOCATIETEGELS.md).

## Inbegrepen tekstherkenning en werkelijke setupreparatie — 30 oktober 2026

- Vervolgcontrole van Start Core: een gestopte WSL-distributie wordt nu met een eigen tijdelijk proces actief gehouden vóór USB-koppeling. De gerichte acht startup-/lifecycle-/installertests slagen. De gecorrigeerde lokale start bereikte `running:true` en daarna `connected:true`; de officiële app is niet aangepast. Dit bewijst de huidige verbinding, geen volledige campagneondersteuning.

- Alle 139 publieke tests slagen met Node 26 en de gebundelde Node 22. De setup installeert geen Windows OCR-taalpakket meer. Ontbrekende tekstherkenning blokkeert de basisverbindingsvoorbereiding niet en wordt afzonderlijk als ontbrekende automatische synchronisatie getoond. Modeldownloadfouten en onjuiste SHA-256 worden bij het bouwen geweigerd.
- De meegeleverde herkenner is geforceerd als `bundled-tesseract` getest met echte herkenning van `NIGHT 2 DAY`, plus een opgenomen Milan-kaart van 2560 × 1600 met herkende `android-city-v1`-geometrie. Dit bewijst geen volledige campagneherkenning of gelijkwaardige nauwkeurigheid voor elk scherm.
- Het Windows-testpakket is gebouwd zonder artwork en start met beperkte PATH en zonder ontwikkelruntimes; de OCR-smoketest vereist nu werkelijk geslaagde portable herkenning. De nieuwe herkenner is ook in de bestaande lokale installatie geladen zonder beschikbaar Windows English OCR. Google's stabiele Android-toolsdownload en het expliciete `/usr/sbin/useradd`-pad zijn tijdens de werkelijke helpervoorbereiding gecontroleerd; deze voorbereiding is voltooid met het niet-root helperaccount. Er is geen Bluetooth-overdracht gestart en geen officiële app gewijzigd.
- De echte lokale setup-API meldt `completed`, `ready:true` en `textRecognitionReady:true`. Een browsercontrole bevestigt de gereedmelding, verborgen voortgangsindicator en een afzonderlijke uitleg bij gesimuleerd ontbrekende OCR, zonder paginafouten. Volledige fysieke acceptatie op een andere schone pc blijft open.

## Automatische PC-voorbereiding — 29 oktober 2026

- De publieke suite slaagt met Node 26 én de gebundelde Node 22: **135 tests**, nul fouten. Negen nieuwe orkestratietests controleren één start voor de volledige volgorde, overslaan van bestaande onderdelen, expliciete toestemming, herstart/Continue, adapterkeuze, geen automatische vervanging van een opgeslagen radio, UAC-annulering, helperfouten/retry en geen installatie door alleen statuscontrole. Twee aanvullende helpertests controleren hergebruik van Android-tools na een Linux-fout, opslag van het niet-root helperaccount en stoppen vóór downloads wanneer OCR of het reviewpakket ontbreekt.
- Een browserproef gebruikt de echte setup-orkestratie met nagemaakte Windows-installers. Eén primaire installatieactie voert de volgorde uit; eenmalige voorwaarden worden bewaard voor Continue/retry. Tabletcontrole gebeurt automatisch. Herstart, twee adapters, netwerkmislukking/retry en desktop/390-pixel mobiel zijn gecontroleerd zonder paginafouten of horizontale overflow. Technische bediening staat standaard dicht onder Advanced/More options.
- De gewijzigde PowerShell-scripts zijn syntactisch gecontroleerd. Er zijn tijdens deze verificatie **geen echte Windows-/Linux-installaties, accountwijzigingen, USB-overdrachten of tabletacties** op de ontwikkelmachine uitgevoerd. Eerste installatie op een schone Windows-machine met echte UAC, Debian-initialisatie en herstart blijft een afzonderlijke acceptatieproef. Zie [automatische setup](AUTOMATIC-SETUP.md).

## TCE-modules en automatische artworkinstallatie — 29 oktober 2026

- De volledige publieke suite slaagt met Node 26 én de gebundelde Node 22: **124 tests**, nul fouten. Nieuwe moduleproeven controleren twee tegelijk ingeschakelde spellen, afzonderlijke caches/archieven, uitschakelen en archiefverlies zonder invloed op de andere module, weigeren van artwork voor de verkeerde game en migratie van de eerdere installatieopslag. Achtergrondacquisitie, dubbelklikken, fout/retry, downloadintegriteit en omschakelen pas na geslaagde oude cleanup zijn geïsoleerd getest.
- De gedeelde engine, server en Core/WSL-transport hebben geen imports van Milan-code of Milan-profielen. Het gedeelde .NET-codec bouwt met een eigen namespace en leest miniatuursemantiek uit de geselecteerde modulecatalogus. De originele SDK blijft uitgesloten.
- De officiële Windows 1.0.9-ZIP is opnieuw daadwerkelijk gedownload; grootte en de vastgelegde SHA-256 komen overeen. De echte extractieroute exporteert **alle 156 beelden**, inclusief de twee Prospero-Sprites en Havenbeelden. De resulterende catalogus en alle 156 PNG-routes geven HTTP 200. De Windows-game is niet geïnstalleerd of gestart. De tijdelijk uitgepakte clientbestanden en de gedownloade ZIP zijn na succes opgeruimd; bij mislukte extractie kon de geverifieerde ZIP voor retry worden hergebruikt.
- De daadwerkelijk geëxtraheerde artwork opent de Milan-tafel met veertig zones op desktop en 390-pixel mobiel zonder paginafouten of horizontale overflow. Een afzonderlijke browserproef met een synthetische tweede module bevestigt meerdere ingeschakelde kaarten, afzonderlijk uitschakelen en archiefverlies, terwijl de andere module beschikbaar blijft. Het synthetische profiel is testmateriaal en wordt niet als ondersteund spel gepubliceerd.
- Een geïsoleerde bronkopie start de TCE-bibliotheek zonder gameadapter. Pas **Connect Android** bereidt de gedeelde infrastructuur en Milan-adapter voor en start de gameservice; dezelfde adapter openen hergebruikt deze instantie. De gekoppelde HTML verwijst naar de juiste boardclient en de verplaatste schermen/styles laden. Geen tablet of radio aangestuurd.
- Een lokaal Windows-reviewpakket zonder artwork bevat Python/UnityPy met elf gepinde compatibele wheels, Node en opnieuw gebouwde eigen .NET-helpers. De runtimes starten in de rookproef zonder ontwikkelruntimepaden. Een schone Windows-installatie met fysieke tablet/radio en volledige campagneacceptatie blijven afzonderlijke open punten. Geen GitHub-releaseworkflow uitgevoerd.
- De per-user installer is ook op het modulaire reviewpakket uitgevoerd naar een geïsoleerde werkmap zonder snelkoppelingen. De geïnstalleerde gebundelde Node start de bibliotheek en Milan-adapter zonder ontwikkelruntimepaden; de gecompileerde Core leest de moduleminiaturen. De Android-bediening blijft bruikbaar voor stoppen/afsluiten wanneer artwork verdwijnt, ook na herladen. Desktop/mobiel hebben geen paginafouten of overflow. PC-/tabletstatus is gesimuleerd; geen echte radio of tablet aangestuurd.

## Optionele game-artworkarchieven — 29 oktober 2026

- De publieke Windows-suite bevat 115 geslaagde tests met zowel Node 26 als de meegeleverde Node 22. De zes nieuwe tests controleren opstarten zonder artwork, gescheiden installatie/activatie, herstart met bewaarde installatiestatus, blokkeren na archiefverwijdering ondanks bestaande cache, vervangen/corrupt artwork, catalogusvalidatie, lokale API-oorsprong en release-staging zonder artwork. De Windows-installerproef controleert ook een ontbrekend optioneel archief dat nog in het oorspronkelijke integriteitsmanifest staat.
- Een browserproef met de echte add-on-API en een klein testarchief bevestigt installatie/activatie, de veertig bordzones, terugkeer naar het add-onscherm na archiefverwijdering en blokkeren van Start Core zonder actieve game. Desktop en 390-pixel mobiel hebben geen paginafouten of horizontale overflow; Windows-/tabletstatus is gesimuleerd.
- Een afzonderlijke bronkopie zonder artwork en zonder bestaande private werkmap start beide gekoppelde webservices. De Control Center-proxy blokkeert activatie zonder archief en weigert ontbrekende Origin; Core-start, scan-, sensor-, dice- en bewegingsroutes worden vóór hardware-invoer geblokkeerd. Geen tablet, radio of installer aangestuurd.
- Geen nieuw volledig Windows-releasepakket gebouwd en geen GitHub-workflow uitgevoerd voor deze wijziging. De bestaande fysieke acceptatiepunten blijven open. Zie [game-add-ons](GAME-ADDONS.md) en [release-review](RELEASE-REVIEW.md).

## Windows-releasekandidaat, lokaal — 29 oktober 2026

- De lokale builder heeft een Windows x64-reviewpakket gemaakt met Node 22, Python 3.13.17, gepinde Windows NumPy/OpenCV-wheels en self-contained .NET-helpers. Officiële Node-/Python- en PyPI-hashes zijn gecontroleerd. De Teburu-SDK, private configuratie, campagnes en identifiers zijn niet opgenomen. De GitHub-releaseworkflow is niet gestart.
- De meegeleverde Node, Python/vision en Core starten in de smokeproef met ontwikkelruntimepaden verwijderd. De browserproef gebruikt de meegeleverde Node en laadt alle 156 afbeeldingen; helpertoestemming, tabletstappen, expliciete taal-/oriëntatiebevestiging en herstelknop werken op desktop en mobiel zonder paginafouten of horizontale overflow. Installatie- en hardware-antwoorden zijn gesimuleerd.
- De installer is naar een geïsoleerde werkmap gekopieerd zonder bureaublad-/Startmenuwijzigingen. Afzonderlijke Windows-tests bevestigen behoud van private saves, afwijzen van beschadigde bestanden en weigeren van paden buiten het pakket. De afsluitknop sluit beide echte webservices netjes af; de tweede start hergebruikt de bestaande instantie. Bij deze proeven was geen radio door de app overgedragen.
- De publieke suite bevat nu 109 tests, inclusief staging van bronbestanden zonder SDK-binaries, USB-toestemming/meerdere apparaten, scherm-/appcontrole, helpertoestemming/voortgang, de stop-voor-detach-volgorde, terugdraaien van mislukte Core-start en installercontroles. Een aanvullende Python-proef gebruikt nagemaakte sysfs-bestanden en callbacks om te bevestigen dat uitsluitend één unieke geselecteerde USB-radio toegang krijgt, en dat ambiguïteit geen permissies wijzigt. Zie [reviewchecklist](RELEASE-REVIEW.md) voor de nog vereiste schone Windows-/Linux-installatie en fysieke radio-/tablettests. Een lokale smokeproef vervangt die niet.

## Begeleide Windows-voorbereiding — 29 oktober 2026

- Publieke suite expliciet uit `test/` en `tests/`: 102 tests geslaagd, nul fouten. Een volledige `node --test`-run slaagde eveneens, maar ontdekte daarnaast kopieen van oudere suites in genegeerde tijdelijke werkmappen; die zijn niet als extra dekking geteld.

- Zeven nieuwe geisoleerde tests controleren uitsluitend lezen bij statuscontrole, gedeelde/gecachete uitlezingen, expliciete bevestiging, begrensde acties, keuze van een gedetecteerde adapter, blokkeren van gelijktijdige installaties, annuleren van UAC, installatiefouten en herstartmeldingen. Reeds gedeelde adapters worden zonder installer of overdracht geselecteerd; onderbroken installaties starten niet automatisch opnieuw.
- Browsercontrole op desktop en mobiel geslaagd: geen installatieverzoek voor bevestiging, annuleren doet niets, voortgang blokkeert nieuwe acties, herstartmelding zichtbaar, adapterkeuze correct en geen paginafouten of horizontale overflow. De installatie-antwoorden zijn gesimuleerd; er is geen echte installer gestart.
- De PowerShell-statuscontrole is op de ontwikkelcomputer uitgevoerd en herkent WSL, Debian op WSL2, usbipd en de gedeelde Bluetooth-adapter. De nieuwe actie-API weigert verzoeken zonder lokale Origin en onbekende acties. Geen radio-overdracht, software-installatie, firmware- of officiele-appwijziging uitgevoerd.
- Een complete installatie met echte UAC, downloads en Windows-herstart op een schone tweede machine blijft te toetsen. De gebundelde release met runtimes en vooraf gebouwde helpers blijft een volgende stap.

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
