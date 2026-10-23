# Milan Uprising: Digital Edition

Onafhankelijk project voor een modulair digitaal tabletop-platform met Vampire: The Masquerade – Milan Uprising als eerste module. **Het einddoel is de officiële game-app downloaden en gebruiken met onze virtuele tafel, zonder fysieke spelonderdelen.** Later moeten andere officiële releases kunnen aansluiten. De officiële app blijft eigenaar van regels, verhaal en campagne. Een losse sandbox is een tussenstap, geen vervulling van dit einddoel.

De architectuur scheidt generieke engine, spelregels, spelgegevens, gebruikersinterface en grafische presentatie. De volgorde is **2D-reproductie → automatisering → optionele 3D-uitbreiding**. De eerste doorsnede is geïmplementeerd: een configureerbare engine met afzonderlijke Milan-sandboxmodule en JSON-profiel. Andere spellen en uitgeversreleases kunnen later via eigen modules en gegevenspakketten worden toegevoegd. Volledige regels, kaarten en scenario's zijn nog niet geïmplementeerd.

**Status: lokaal bordprototype met een beperkte live koppeling naar de ongewijzigde officiële app aangetoond.** De private proef omvat personageregistratie, campagne, spelactie, digitale worp en hervatten. Een klik op onze tafel verplaatste de actieve pion in Milan; pas na appbevestiging wijzigde de bordpositie. Een echte invloedactie werd automatisch overgenomen. Eén beurtwissel gaf een foutmelding; de oorzaak is nog onbekend. De publieke demo blijft een zelfstandige sandbox. Zie [actuele appvalidatie](docs/APP-VALIDATIE.md#live-tafelbediening-en-invloed).

## Starten

Benodigd: Node.js 22 of nieuwer. Geen installatie van pakketten nodig.

```powershell
cd 'C:\CODE\Milan Uprising'
node server.mjs
```

Open http://127.0.0.1:5178. Stop met Ctrl+C. Testen: `node --test`. Als npm beschikbaar is, werken ook `npm start` en `npm test`. Open de pagina via de lokale server: rechtstreeks openen als bestand kan JavaScript-modules blokkeren.

## Lokaal artwork

Op deze computer zijn 79 originele afbeeldingen uit de geïnstalleerde app toegevoegd: alle dertig locatiebeelden, portretten, fiches, logo en originele kaart. Ze staan alleen onder genegeerd `private/artwork/`. De publieke code werkt ook zonder deze beelden. Zie [voorbereiding, bron en gebruik](docs/ARTWORK.md). Het vorige kaartprofiel 0.6 blijft beschikbaar voor oude sessies.

## Speeltafel gebruiken

De tafel gebruikt de volledige beschikbare schermbreedte. Met lokaal artwork opent de originele fysieke kaart met veertig klikbare locatiegebieden. **Bekijken** toont de inhoud van een district; selecteer een onderdeel in de voorraad om het daarna op een bestemming te **plaatsen**. Met Escape ga je terug naar bekijken. In deze stand kun je een onderdeel op de kaart selecteren en via de zijbalk verplaatsen, omkeren of terugleggen. Bij meer dan vier onderdelen opent `+n` de volledige locatielijst.

**Voorraad**, **Locatie** en **Sessie** staan in een compacte zijbalk. Gebruik de zoomknoppen voor details, **Passend** voor het hele bord en **Bordfocus** voor extra ruimte. Op tablet en telefoon staat de zijbalk onder de kaart. **Campagne-opstelling** en **Tafelinstellingen** openen aparte vensters. Bewaren, openen en activiteiten staan onder Sessie; undo/redo blijven direct onder het bord bereikbaar. Zonder lokaal artwork blijven dezelfde handelingen in de schematische weergave beschikbaar.

De fysieke weergave benadert de gedrukte gebieden; dit is geen geverifieerde aangrenzendheidsmapping. De officiële app blijft de regel- en campagneautoriteit bij de private koppeling. Andere invoerbronnen kunnen dezelfde sessie bijwerken; de UI reageert automatisch via `tabletop.subscribe`. Live tafelbediening en invloedsoverdracht zijn beperkt getest in de private proef, zonder publieke integratieadapter. Zie [layout en vervolgrichting](docs/TAFEL-LAYOUT.md).

## Inhoud en bestaande profielen

Standaard opent nu **locatiekaart 0.7**: dertig benoemde stadsdistricten en tien Havenvelden, met de retailonderdelen uit 0.5. De kaart is een eigen schema met op de appkaart gecontroleerde districtnamen; exacte grenzen, aangrenzendheid en sensorindex zijn nog niet geverifieerd. Via **Campagne-opstelling** open je **Campagne-opstelling overnemen** voor vier personages, invloed, controle, afgesloten locaties, NPC’s, bondgenoten, ghouls en Masquerade. Toepassen is één handeling, inclusief undo/redo en JSON-herstel. Er is **nog geen geverifieerde officiële campagnebeginstand** ingevuld. Zie [kaart, bronnen en opstellingsstatus](docs/KAART-EN-OPSTELLING.md).

**Milan-content 0.5: retail-basisspel** blijft als apart profiel beschikbaar met de echte namen en aantallen: zeven personages, twee bondgenoten, twee ghouls, 65 factiekubussen en 56 fiches, samen 132 losse onderdelen. Categorieën en zoeken maken de voorraad doorzoekbaar. Controle- en onderzoek/afgesloten-locatiefiches kun je omkeren; zijde en positie worden samen bewaard en hersteld. De eigen symbolen vervangen geen officiële illustraties. Zie [inhoud en bronnen](docs/MILAN-CONTENT.md). Dit oudere profiel behoudt het voorlopige sensorraster voor bestaande sessies.

De **neutrale werktafel 0.4** blijft als apart profiel beschikbaar. In beide handmatige profielen: kies een onderdeel uit de voorraad of keuzelijst en klik op een zone. Pionnen, invloedskubussen en fiches zijn afzonderlijk te plaatsen en te verplaatsen, ook samen in één zone. **Terug naar voorraad** verwijdert alleen het geselecteerde onderdeel. De voorraad toont waar ieder onderdeel staat. Gebruik **Bewaar JSON** en later **Open JSON** om dezelfde tafel met dezelfde vastgelegde worpen te hervatten. Laden controleert profiel/versie, events en eindtoestand vóór vervanging; fouten laten de bestaande sessie intact. Geen automatische opslag of migraties. Sensorstudies blijven alleen export ondersteunen.

De vier pionnen, twaalf kubussen, acht fiches en capaciteit 32 in de neutrale werktafel zijn een demovoorraad, geen geverifieerde Milan-inventaris of locatiecapaciteit. Die 8 × 5 indeling volgt de sensorlaag. De ontwikkeling van de fysieke tafel blijft onafhankelijk van fabrikantcontact; de verbinding met onze tafel moet nog worden geïmplementeerd.

**Ongedaan maken** en **Opnieuw uitvoeren** herstellen maximaal honderd lokale handelingen, inclusief bord leegmaken. Opnieuw uitvoeren behoudt de oorspronkelijke worp. Een nieuwe handeling na teruggaan vervangt de redo-reeks. De herstelgeschiedenis blijft alleen in het tabblad; een JSON-export bewaart de actieve tafel en het openen van JSON begint een nieuwe herstelgeschiedenis. Deze knoppen zijn niet beschikbaar in de sensorstudie.

Kies voor de **interactiestudie** het bijbehorende tafelprofiel: kies een demopion, druk op **Registreer demopion**, klik een sensor en druk op **Maak sensor vrij**. De pion blijft logisch in de zone. Registreer daarna een andere pion en gebruik dezelfde sensor: beide mogen de demozone delen. Opnieuw dezelfde zone aanraken registreert alleen een generieke interactie. Dit is expliciete lokale selectie, geen RFID-scan of echte Core-emulatie. Het d10-profiel volgt de Milan-inventaris; capaciteit vier is alleen een demokeuze. Digitale worpen van de officiële Windows-app zijn inmiddels afzonderlijk gevalideerd in de private spelproef; deze sandbox stuurt ze niet aan.

Het tafelprofielmenu kan terug naar het oorspronkelijke referentieprofiel hieronder. Kies het profiel en klik **Start lege tafel met dit profiel**; exporteer eerst wat je wilt bewaren. De JSON-export van de interactiestudie bevat ook een afzonderlijk lokaal inputlog, zonder echte hardware-identifiers.

In het referentieprofiel: kies een van vier neutrale pionnen en klik op een cel om die te plaatsen of verplaatsen. Iedere cel ondersteunt één pion in dit profiel; de engine ondersteunt ook andere zones en capaciteiten. Verwijder de geselecteerde pion, draai een demo-d6/d10, of herstel de beginsituatie. Bewaar de sessie en het eigen eventlog als JSON (tabletop-session v1). Met Tab en Enter zijn de bordcellen bedienbaar. Zonder een bewaard JSON-bestand wist herladen de stand. De oorspronkelijke demo en haar oude exportformaat blijven beschikbaar op http://127.0.0.1:5178/legacy/index.html; dat oude formaat wordt niet geïmporteerd.

De 8 × 5 indeling is bevestigd voor de **Teburu-sensorlaag** door Xplored. A1–H5 is onze eigen coördinatienotatie; officiële sensorvolgorde, oriëntatie en Milan-locatiemapping zijn onbekend. Het prototype implementeert geen spelregels, verhaal of campagne en is nog geen speelbare digitale editie.

## Onderzoek naar appkoppeling

Voor de private gekoppelde tafel is er nu ook een [bordlink voor een tweede pc op het lokale netwerk](docs/BORD-DELEN.md), met een korte toegangscode en dezelfde tafelsessie. De technische Core-bediening blijft lokaal.

De actuele ontwikkelstap is [Core-functies zelfstandig testen](docs/CORE-VALIDATIE.md), zodat hardwarewijzigingen geen nieuwe campagne-setup vereisen. Een private regressiesuite en vijf virtuele d10's met afzonderlijke identiteiten en selecteerbare groepsworpen zijn toegevoegd. Alle vijf zijn op het echte Android-setupscherm herkend; volledige spelchecks, opslaan/hervatten en bordterugkoppeling op Android zijn nog niet bevestigd.

De [vergelijking van verbindingsroutes](docs/APP-KOPPELING-VOORONDERZOEK.md) adviseert een optionele native helper voor appinvoer en afzonderlijke toestandsterugkoppeling. Een read-only probe staat in `tools/check-bridge-prerequisites.ps1`; lokale resultaten blijven privaat. De private proef toont personageregistratie, tafelbediening, digitale worpen, invloedsoverdracht en hervatten binnen beperkte scope. Volledige cityrondes, andere schermformaten en een publieke adapter blijven open.

## Projectstructuur

- `src/engine/`: headless zone-/componentmodel, profielvalidatie en atomische opdrachten.
- `src/application/`: sessiebediening, projecties en exportcontract.
- `src/games/milan-uprising/`: afzonderlijke module, uitsluitend sandbox.
- `data/games/milan-uprising/demo.json`: neutrale componenten en sensorprofiel.
- `data/games/milan-uprising/retail.json`: geverifieerde basisspelvoorraad, personage-/NPC-namen, facties, ficheszijden en bronverwijzingen.
- `data/games/milan-uprising/campaign.json`: benoemde districts-/Havenvelden, bronstatus en handmatige campagne-opstelling; geen officiële startpreset.
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

Dit project is niet verbonden aan Xplored, Teburu of de rechthebbenden van Vampire: The Masquerade. Namen dienen ter identificatie. De tafel heeft eigen schematische vormgeving met optioneel lokaal app-artwork; de retailvoorraad bevat bronverwezen feitelijke namen en aantallen. Geen kaartscans, appbestanden, audio, verhaallijnen of andere beschermde assets overnemen zonder toestemming. Privégebruik vormt geen automatische toestemming voor hergebruik of verspreiding. Geen beveiliging, authenticatie of licentiecontrole omzeilen. Een publieke softwarelicentie is nog niet gekozen.

Begin een volgende Codex-sessie met: “Lees AGENTS.md en werk de eerstvolgende open stap in docs/PLAN.md uit.”
