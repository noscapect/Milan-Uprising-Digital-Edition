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

Standaard opent de **interactiestudie**: kies een demopion, druk op **Registreer demopion**, klik een sensor en druk op **Maak sensor vrij**. De pion blijft logisch in de zone. Registreer daarna een andere pion en gebruik dezelfde sensor: beide mogen de demozone delen. Opnieuw dezelfde zone aanraken registreert alleen een generieke interactie. Dit is expliciete lokale selectie, geen RFID-scan of echte Core-emulatie. Het d10-profiel volgt de Milan-inventaris; capaciteit vier is alleen een demokeuze. De officiële Milan-app heeft zelf digitale worpen, maar een echte appkoppeling is nog niet bewezen.

Het tafelprofielmenu kan terug naar het oorspronkelijke referentieprofiel hieronder. Kies het profiel en klik **Start lege tafel met dit profiel**; exporteer eerst wat je wilt bewaren. De JSON-export van de interactiestudie bevat ook een afzonderlijk lokaal inputlog, zonder echte hardware-identifiers.

Kies een van vier neutrale pionnen en klik op een cel om die te plaatsen of verplaatsen. Iedere cel ondersteunt één pion in dit profiel; de engine ondersteunt ook andere zones en capaciteiten. Verwijder de geselecteerde pion, draai een demo-d6/d10, of herstel de beginsituatie. Exporteer de sessie en het eigen eventlog als JSON (tabletop-session v1). Met Tab en Enter zijn de bordcellen bedienbaar. De sessie staat alleen in het geheugen; herladen wist de stand. JSON importeren is nog niet beschikbaar. De oorspronkelijke demo en haar oude exportformaat blijven beschikbaar op http://127.0.0.1:5178/legacy/index.html.

De 8 × 5 indeling is bevestigd voor de **Teburu-sensorlaag** door Xplored. A1–H5 is onze eigen coördinatienotatie; officiële sensorvolgorde, oriëntatie en Milan-locatiemapping zijn onbekend. Het prototype implementeert geen spelregels, verhaal of campagne en is nog geen speelbare digitale editie.

## Projectstructuur

- `src/engine/`: headless zone-/componentmodel, profielvalidatie en atomische opdrachten.
- `src/application/`: sessiebediening, projecties en exportcontract.
- `src/games/milan-uprising/`: afzonderlijke module, uitsluitend sandbox.
- `data/games/milan-uprising/demo.json`: neutrale componenten en sensorprofiel.
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

Dit project is niet verbonden aan Xplored, Teburu of de rechthebbenden van Vampire: The Masquerade. Namen dienen ter identificatie. Alleen zelfgemaakte geometrische vormgeving en neutrale demo-inhoud zijn opgenomen. Geen kaartscans, appbestanden, audio, verhaallijnen of andere beschermde assets overnemen zonder toestemming. Privégebruik vormt geen automatische toestemming voor hergebruik of verspreiding. Geen beveiliging, authenticatie of licentiecontrole omzeilen. Een publieke softwarelicentie is nog niet gekozen.

Begin een volgende Codex-sessie met: “Lees AGENTS.md en werk de eerstvolgende open stap in docs/PLAN.md uit.”
