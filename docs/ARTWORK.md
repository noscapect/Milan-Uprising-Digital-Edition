# Lokaal artwork (0.7)

## Distributie-update — 29 oktober 2026

De projecteigenaar heeft expliciet toestemming bevestigd voor publicatie van het geselecteerde artwork. Alle 156 actuele afbeeldingen staan nu met een opgeschoond manifest in `resources/milan-artwork.json.gz`. De server pakt dit automatisch uit naar genegeerd `private/bundled-artwork/`; een lokale officiële-appinstallatie of extractietool is hiervoor niet nodig. Bronpaden en oude manifesten zijn niet opgenomen. Zie [installatie op een andere computer](INSTALLATION.md). Hieronder blijft de historische extractie- en onderzoeksbeschrijving behouden; uitspraken over uitsluitend private opslag beschrijven de eerdere distributiesituatie.

De geïnstalleerde officiële Windows-app 1.0.9 bevat leesbare Unity-textures. De lokale tafel gebruikt hiervan 79 originele PNG-exporten: 30 locatiebeelden, 19 personen met icoon en volledig portret, drie kubusiconen, vijf fichesymbolen, een Masquerade-fiche, logo en stadskaart. Geen nieuw artwork gegenereerd. De app is niet gestart, aangepast of gepatcht; er zijn geen versleuteling of beveiligingen omzeild. Verhaal, audio, scripts en scenario's zijn niet geëxporteerd.

## Bestanden en starten

Op 25 oktober zijn voor de vier personages uit Playable Characters ook de originele iconen en volledige portretten toegevoegd: Jamilah Ianni, Domenica Amato, Aristide Demiana en Romeo De Carlo. De acht beelden blijven onder `private/artwork/`; de bestaande kaart-, basispersonage-, dice- en Prospero-beelden zijn behouden. De voorbereidingstool neemt deze vier personages voortaan eveneens mee. Herlaad de bordpagina na het bijwerken en herstarten van de lokale artworkserver.

Daarna zijn ook alle overige uitbreidingsonderdelen gekoppeld: de elf nieuwe bondgenoten/ghouls hebben een icoon én volledig portret, en de NPC’s, factiecontroleminiaturen, Sabbat-/Nephilim-kubussen, vier amuletmarkers en twee speciale locatiefiches hebben hun beschikbare originele iconen. Alle 101 uitbreidingsonderdelen hebben nu een beeldkoppeling. De lokale catalogus bevat in totaal 136 afbeeldingen, inclusief de eerder toegevoegde dice- en Prospero-accessoires. Niet iedere NPC heeft een afzonderlijk groot portret in deze selectie; waar dat ontbreekt gebruikt de detailweergave het icoon.

De nummering van amuletmarkers, speciale locatiefiches en de vier Cult Fanatic-varianten is onze voorraadnummering, geen geverifieerde officiële fysieke nummering of automatische locatietoewijzing. De beelden bepalen geen regels of plaatsing. Voor bijwerken met behoud van eerder toegevoegde accessoires ondersteunt de voorbereidingstool `--merge`.

De beelden en het bronmanifest staan uitsluitend in `private/artwork/`, dat door Git wordt genegeerd. Op deze computer zijn ze al aanwezig. Start `node server.mjs` en open http://127.0.0.1:5178. Herstart de server na een nieuwe export. Zonder dit pakket werkt de demo met de bestaande symbolen, zonder Python of andere externe runtime-dependencies.

Voor een eigen lokale installatie is er de optionele voorbereidingstool:

```powershell
python -m pip install UnityPy==1.23.0
python tools/extract-artwork.py --app-data 'C:\pad\naar\VTMTEBURU_Data'
```

De tool selecteert uitsluitend textures met exact passende namen en afmetingen uit `resources.assets` en `sharedassets0.assets`. Meerdere matches worden overgeslagen. Het manifest bewaart texture-naam, bestand, objectindex, afmetingen en SHA-256 voor herleidbaarheid. De bron wordt alleen gelezen; uitvoer gaat naar `private/artwork/`. Python/UnityPy zijn alleen nodig voor deze voorbereiding, niet voor de tafel.

## Presentatie en grenzen

Portretten verschijnen in de voorraad, bij het geselecteerde onderdeel en op het bord. Locatiebeelden worden op de nieuwe stadskaart getoond. Fiche-iconen volgen de gekozen zijde. De originele kaart is nu de interactieve hoofdweergave, met eigen benaderde klikgebieden en onderdelen bovenop het beeld. Een schematische weergave en uitklapbare kaartreferentie blijven beschikbaar; zie [TAFEL-LAYOUT.md](TAFEL-LAYOUT.md). Afbeeldingen veranderen geen regels, posities, exports of undo/redo.

De server publiceert uitsluitend een gefilterde catalogus en geselecteerde PNG-routes onder `/local-artwork/`. Geen algemene toegang tot `private/`, bronmanifest of installatiebestanden. Bestandsnamen, PNG-header, grootte en opgeloste paden worden gecontroleerd. Ontbrekende beelden vallen terug op tekst en symbolen.

De scherpe appkaart corrigeert eerdere foto-interpretaties: bovenaan staat Portello; de eerder als Chinatown benoemde zone is Sempione; Corsica is Argonne. Het nieuwe standaardprofiel `city.json` heeft release `milan-city-artwork`, versie 0.7.0. `campaign.json` 0.6 blijft ongewijzigd beschikbaar voor bestaande sessies. De eigen Havenlabels en attribuutgegevens zijn hiermee niet opnieuw als officiële sensor- of regelmapping geverifieerd.

## Bronnen en verspreiding

- [Officiële appdownloads](https://www.teburu.com/game-apps/): lokaal geïnstalleerde Windows-app 1.0.9, textures visueel gecontroleerd.
- [UnityPy](https://github.com/K0lb3/UnityPy): open source reader, gebruikt op versie 1.23.0. De toollicentie geeft geen rechten op game-artwork.
- Openbare SDK-/repozoekresultaten leverden geen geverifieerd herbruikbaar Milan-artpakket op. Een officiële perskit werd gevonden, maar zonder vastgestelde herdistributielicentie.

Geen herdistributielicentie voor het artwork vastgesteld. De afbeeldingen, het lokale manifest en screenshots worden niet naar GitHub gestuurd. De repository bevat alleen loader, presentatie, extractietool en documentatie. Dit is geen bewijs van appcompatibiliteit of werkende Teburu-emulatie.

De dobbelbak gebruikt aanvullend vier originele vlaksymbolen uit de lokaal geïnstalleerde app: leeg, schedel, ankh en ankh met tanden. De extractietool neemt ze optioneel mee in de lokale catalogus. De publieke UI bevat alleen de koppeling en een eigen symboolfallback; de afbeeldingen blijven onder private/artwork/.
