# Milan Uprising: Digital Edition

Onafhankelijk project voor een modulair digitaal tabletop-platform met Vampire: The Masquerade – Milan Uprising als eerste module. **Het einddoel is de officiële game-app downloaden en gebruiken met onze virtuele tafel, zonder fysieke spelonderdelen.** Later moeten andere officiële releases kunnen aansluiten. De officiële app blijft eigenaar van regels, verhaal en campagne. Een losse sandbox is een tussenstap, geen vervulling van dit einddoel.

De architectuur scheidt generieke engine, spelregels, spelgegevens, gebruikersinterface en grafische presentatie. De volgorde is **2D-reproductie → automatisering → optionele 3D-uitbreiding**. De eerste doorsnede is geïmplementeerd: een configureerbare engine met afzonderlijke Milan-sandboxmodule en JSON-profiel. Andere spellen en uitgeversreleases kunnen later via eigen modules en gegevenspakketten worden toegevoegd. Volledige regels, kaarten en scenario's zijn nog niet geïmplementeerd.

**Status: lokaal bordprototype. Geen werkende vervanging van Teburu en geen verbinding met de officiële app.** Emulatie is onbewezen. De haalbaarheid van volledige bordvervanging is nog onbekend.

## Starten

Benodigd: Node.js 22 of nieuwer. Geen installatie van pakketten nodig.

```powershell
cd 'C:\CODE\Milan Uprising'
node server.mjs
```

Open http://127.0.0.1:5178. Stop met Ctrl+C. Testen: `node --test`. Als npm beschikbaar is, werken ook `npm start` en `npm test`. Open de pagina via de lokale server: rechtstreeks openen als bestand kan JavaScript-modules blokkeren.

## Prototype gebruiken

Standaard opent **Milan-content 0.5: retail-basisspel** met de echte namen en aantallen: zeven personages, twee bondgenoten, twee ghouls, 65 factiekubussen en 56 fiches, samen 132 losse onderdelen. Categorieën en zoeken maken de voorraad doorzoekbaar. Controle- en onderzoek/afgesloten-locatiefiches kun je omkeren; zijde en positie worden samen bewaard en hersteld. De eigen symbolen vervangen geen officiële illustraties. Zie [inhoud, bronnen en open kaartgegevens](docs/MILAN-CONTENT.md). De locatiekaart en scenario-opstelling zijn nog niet gereconstrueerd; het raster blijft een voorlopige werktafel.

De **neutrale werktafel 0.4** blijft als apart profiel beschikbaar. In beide handmatige profielen: kies een onderdeel uit de voorraad of keuzelijst en klik op een zone. Pionnen, invloedskubussen en fiches zijn afzonderlijk te plaatsen en te verplaatsen, ook samen in één zone. **Terug naar voorraad** verwijdert alleen het geselecteerde onderdeel. De voorraad toont waar ieder onderdeel staat. Gebruik **Bewaar JSON** en later **Open JSON** om dezelfde tafel met dezelfde vastgelegde worpen te hervatten. Laden controleert profiel/versie, events en eindtoestand vóór vervanging; fouten laten de bestaande sessie intact. Geen automatische opslag of migraties. Sensorstudies blijven alleen export ondersteunen.

De vier pionnen, twaalf kubussen, acht fiches en capaciteit 32 zijn een neutrale werkvoorraad, geen geverifieerde Milan-inventaris of locatiecapaciteit. De 8 × 5 indeling volgt de sensorlaag; een echte Milan-locatiekaart en officiële appkoppeling ontbreken nog. Deze uitbreiding bouwt aan de virtuele fysieke tafel zonder fabrikantcontact als voorwaarde voor de lokale ontwikkeling.

**Ongedaan maken** en **Opnieuw uitvoeren** herstellen maximaal honderd lokale handelingen, inclusief bord leegmaken. Opnieuw uitvoeren behoudt de oorspronkelijke worp. Een nieuwe handeling na teruggaan vervangt de redo-reeks. De herstelgeschiedenis blijft alleen in het tabblad; een JSON-export bewaart de actieve tafel en het openen van JSON begint een nieuwe herstelgeschiedenis. Deze knoppen zijn niet beschikbaar in de sensorstudie.

Kies voor de **interactiestudie** het bijbehorende tafelprofiel: kies een demopion, druk op **Registreer demopion**, klik een sensor en druk op **Maak sensor vrij**. De pion blijft logisch in de zone. Registreer daarna een andere pion en gebruik dezelfde sensor: beide mogen de demozone delen. Opnieuw dezelfde zone aanraken registreert alleen een generieke interactie. Dit is expliciete lokale selectie, geen RFID-scan of echte Core-emulatie. Het d10-profiel volgt de Milan-inventaris; capaciteit vier is alleen een demokeuze. De officiële Milan-app heeft zelf digitale worpen, maar een echte appkoppeling is nog niet bewezen.

Het tafelprofielmenu kan terug naar het oorspronkelijke referentieprofiel hieronder. Kies het profiel en klik **Start lege tafel met dit profiel**; exporteer eerst wat je wilt bewaren. De JSON-export van de interactiestudie bevat ook een afzonderlijk lokaal inputlog, zonder echte hardware-identifiers.

In het referentieprofiel: kies een van vier neutrale pionnen en klik op een cel om die te plaatsen of verplaatsen. Iedere cel ondersteunt één pion in dit profiel; de engine ondersteunt ook andere zones en capaciteiten. Verwijder de geselecteerde pion, draai een demo-d6/d10, of herstel de beginsituatie. Bewaar de sessie en het eigen eventlog als JSON (tabletop-session v1). Met Tab en Enter zijn de bordcellen bedienbaar. Zonder een bewaard JSON-bestand wist herladen de stand. De oorspronkelijke demo en haar oude exportformaat blijven beschikbaar op http://127.0.0.1:5178/legacy/index.html; dat oude formaat wordt niet geïmporteerd.

De 8 × 5 indeling is bevestigd voor de **Teburu-sensorlaag** door Xplored. A1–H5 is onze eigen coördinatienotatie; officiële sensorvolgorde, oriëntatie en Milan-locatiemapping zijn onbekend. Het prototype implementeert geen spelregels, verhaal of campagne en is nog geen speelbare digitale editie.

## Projectstructuur

- `src/engine/`: headless zone-/componentmodel, profielvalidatie en atomische opdrachten.
- `src/application/`: sessiebediening, projecties en exportcontract.
- `src/games/milan-uprising/`: afzonderlijke module, uitsluitend sandbox.
- `data/games/milan-uprising/demo.json`: neutrale componenten en sensorprofiel.
- `data/games/milan-uprising/retail.json`: geverifieerde basisspelvoorraad, personage-/NPC-namen, facties, ficheszijden en bronverwijzingen.
- `src/ui/`, `src/presentation/2d/`: bediening en aparte bordrenderer.
- `src/adapters/`: cryptografische demo-worpen en JSON-download.
- `src/adapters/virtual-core.js`: lokale simulatie met gescheiden identiteit, sensorcontact en spelpositie; geen netwerktransport.
- `src/app.js`: samenstellen van module, gegevens en adapters.
- `legacy/`, `src/model.js`: behouden oorspronkelijke demo/referentiemodel.
- `docs/PLAN.md`: fasen en acceptatiecriteria.
- `docs/ONDERZOEK.md`: bronnen, feiten, onzekerheden en onderzoeksvragen.
- `docs/ARCHITECTUUR.md`: laaggrenzen, contracten en presentatie-onafhankelijke engine.
- `docs/BESLUITEN.md`: gewijzigde architectuurbeslissingen en behoud van bestaande werkzaamheden.
- `docs/CONTRACTEN.md`: v1-contracten, componentinventaris en referentiesessie.
- `docs/TEBURU-DEEPSEARCH.md`: technische verdieping, actuele SDK-/downloadroute, bronbewijs en haalbaarheidsgrenzen.
- `tests/`: oorspronkelijke regressies plus engine-, module- en replaycontroles.
- `AGENTS.md`: instructies voor verder werken in Codex.

## Grenzen en rechten

Dit project is niet verbonden aan Xplored, Teburu of de rechthebbenden van Vampire: The Masquerade. Namen dienen ter identificatie. Vormgeving is zelfgemaakt; de retailvoorraad bevat bronverwezen feitelijke namen en aantallen. Geen kaartscans, appbestanden, audio, verhaallijnen of andere beschermde assets overnemen zonder toestemming. Privégebruik vormt geen automatische toestemming voor hergebruik of verspreiding. Geen beveiliging, authenticatie of licentiecontrole omzeilen. Een publieke softwarelicentie is nog niet gekozen.

Begin een volgende Codex-sessie met: “Lees AGENTS.md en werk de eerstvolgende open stap in docs/PLAN.md uit.”
