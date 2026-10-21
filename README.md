# Milan Uprising: Digital Edition

Onafhankelijk project voor een modulair digitaal tabletop-platform met Vampire: The Masquerade – Milan Uprising als eerste afzonderlijke game-module. Doel is eerst een zo getrouw mogelijke functionele 2D-reproductie voor privégebruik, bij voorkeur met behoud van de officiële app.

De doelarchitectuur scheidt generieke engine, spelregels, spelgegevens, gebruikersinterface en grafische presentatie. De volgorde is **2D-reproductie → automatisering → optionele 3D-uitbreiding**. Een toekomstige sandboxmodus ondersteunt handmatig spelen zonder volledige regels. Andere spellen en uitgeversreleases kunnen later via eigen modules en gegevenspakketten worden toegevoegd. Dit is het ontwerp; de huidige demo is nog niet naar deze lagen gemigreerd.

**Status: lokaal bordprototype. Geen werkende vervanging van Teburu en geen verbinding met de officiële app.** Emulatie is onbewezen. De haalbaarheid van volledige bordvervanging is nog onbekend.

## Starten

Benodigd: Node.js 22 of nieuwer. Geen installatie van pakketten nodig.

```powershell
cd 'C:\CODE\Milan Uprising'
node server.mjs
```

Open http://127.0.0.1:5178. Stop met Ctrl+C. Testen: `node --test`. Als npm beschikbaar is, werken ook `npm start` en `npm test`. Open de pagina via de lokale server: rechtstreeks openen als bestand kan JavaScript-modules blokkeren.

## Prototype gebruiken

Kies een van vier neutrale pionnen en klik op een cel om die te plaatsen of verplaatsen. Iedere cel ondersteunt één pion. Verwijder de geselecteerde pion, draai een demo-d6/d10, of herstel de beginsituatie. Exporteer de bordstand en het eigen eventlog als JSON. Met Tab en Enter zijn de bordcellen bedienbaar. De sessie staat alleen in het geheugen; herladen wist de stand. JSON importeren is nog niet beschikbaar.

De 8 × 5 indeling is bevestigd voor de **Teburu-sensorlaag** door Xplored. A1–H5 is onze eigen coördinatienotatie; officiële sensorvolgorde, oriëntatie en Milan-locatiemapping zijn onbekend. Het prototype implementeert geen spelregels, verhaal of campagne en is nog geen speelbare digitale editie.

## Projectstructuur

- `src/model.js`: bordmodel en lokale demo-events, los van transport.
- `index.html`, `src/style.css`, `src/app.js`: lokale interface.
- `docs/PLAN.md`: fasen en acceptatiecriteria.
- `docs/ONDERZOEK.md`: bronnen, feiten, onzekerheden en onderzoeksvragen.
- `docs/ARCHITECTUUR.md`: laaggrenzen, contracten en presentatie-onafhankelijke engine.
- `docs/BESLUITEN.md`: gewijzigde architectuurbeslissingen en behoud van bestaande werkzaamheden.
- `tests/model.test.js`: modelcontroles.
- `AGENTS.md`: instructies voor verder werken in Codex.

## Grenzen en rechten

Dit project is niet verbonden aan Xplored, Teburu of de rechthebbenden van Vampire: The Masquerade. Namen dienen ter identificatie. Alleen zelfgemaakte geometrische vormgeving en neutrale demo-inhoud zijn opgenomen. Geen kaartscans, appbestanden, audio, verhaallijnen of andere beschermde assets overnemen zonder toestemming. Privégebruik vormt geen automatische toestemming voor hergebruik of verspreiding. Geen beveiliging, authenticatie of licentiecontrole omzeilen. Een publieke softwarelicentie is nog niet gekozen.

Begin een volgende Codex-sessie met: “Lees AGENTS.md en werk de eerstvolgende open stap in docs/PLAN.md uit.”
