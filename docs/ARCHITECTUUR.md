# Architectuur — modulair tabletop-platform

Doelarchitectuur vastgesteld op 21 oktober 2026; nog niet geïmplementeerd. Milan Uprising wordt de eerste afzonderlijke game-module. Prioriteit: getrouwe functionele 2D-reproductie, daarna automatisering en optionele visuele uitbreiding.

## Bestaand prototype

Huidig: browserinterface → bordmodel → eigen lokaal eventlog → JSON-download.
Geen netwerktransport, BLE of officiële app-integratie in de applicatie.

De lokale Node-server serveert alleen expliciet toegestane statische bestanden op loopback.

Het model bewaart vier synthetische pion-ID's en nulgebaseerde coördinaten. Iedere cel bevat maximaal één pion, conform de gedocumenteerde sensorcapaciteit; dit is geen uitspraak over Milan-spelregels. Coördinaten zijn niet naar hardware vertaald.

Het prototype blijft als werkende referentie behouden tijdens een latere stapsgewijze migratie. Vaste pionnen, rastervorm en bezetting zijn huidige demo-beperkingen, geen universele engine-eisen.

## Lagen en afhankelijkheden

| Laag | Verantwoordelijkheid | Toegestane afhankelijkheden |
| --- | --- | --- |
| Engine | serialiseerbare toestand, entiteiten, zones, generieke opdrachten en events | eigen contracten; geen Milan, DOM of renderer |
| Game-module | setup, spelregels, beurtverloop, kaartacties en spelvalidatie | enginecontracten en gevalideerde spelgegevens |
| Spelgegevens | borden, kaarten, fiches, personages, scenario's en releases | versieerbare schema's; geen uitvoerbare datascripts |
| Applicatie | sessies, modulekeuze, opslag en adapters coördineren | enginecontracten, geregistreerde modules en poorten |
| Gebruikersinterface | menu's, toegankelijke bediening, intenties naar opdrachten | applicatiecontracten en alleen-lezen projecties |
| Presentatie | 2D; later optioneel 3D, animaties en effecten | alleen-lezen sceneprojectie en presentatiegegevens |
| Adapters | opslag, toeval en eventuele app/hardwarekoppeling | contracten van engine/applicatie; nooit andersom |

Stroom: invoer → applicatie → opdracht → engine en gekozen regels → toestand/events → projecties → UI en renderer. Hit-tests leveren entiteit- of zone-ID's; de renderer bepaalt geen legaliteit. Animatietiming verandert geen speluitkomst.

## Domeincontracten

- Stabiele IDs voor spelers, componenten, zones, kaarten en scenario's. Logische plaatsing gebruikt zones, optionele stapelvolgorde en oriëntatie. Pixels, camera's en meshes horen uitsluitend bij presentatie.
- Borden ondersteunen zones en verbindingen; een raster is één profiel. De 8 × 5 sensormapping wordt aparte adapterconfiguratie. Eén pion per sensor wordt geen universele limiet per spelzone.
- Gegevenspakketten bevatten gameId, releaseId, pakketversie, schemaVersion en herkomst/rechten voor assets. Andere spellen en uitgeversreleases laden als aparte pakketten; dezelfde uitgever impliceert geen identieke regels.
- Opdrachten bevatten type, actorId, payload en verwachte revisie. Validatie en toepassing zijn atomair; een fout laat de staat intact. Events krijgen volgorde en payloadversie. Dit zijn eigen contracten, geen Teburu-protocol.
- Een game-module biedt setup, validatie en toestandsovergangen. Eenvoudige inhoud is declaratieve data; complexe regels blijven geïsoleerde modulecode.
- Toeval komt via een vervangbare poort. Bewaar worpuitkomsten zodat replay geen nieuwe worpen maakt. Tijd en rendering sturen geen regels.
- Saves bevatten schema-, engine-, module- en pakketversies, modus, revisie en toestand. Import valideert en migreert expliciet of weigert begrijpelijk. De huidige v1-demo-export blijft een apart formaat en is niet stilzwijgend een platform-save.

## Sandbox en automatisering

Sandbox wordt een volwaardige modus met handmatige tafelhandelingen zonder volledige spelregelautomatisering. Structurele controles blijven gelden: bestaande IDs, geldige zones en consistente data. Spelregelcontroles horen bij module en modus. Sla de modus op; zet een sandboxsessie niet ongemerkt om naar een gevalideerde regelsessie.

In automatiseringsmodus beheert de game-module legale acties en beurtverloop. Eventuele AI gebruikt hetzelfde opdrachtcontract als spelers. Als een officiële app regels beheert, legt de adapter expliciet de toestandseigenaar vast; voorkom dubbele regelautoriteit.

## Beoogde structuur bij migratie

```text
src/engine/                 # generieke domeinlogica en contracten
src/application/            # sessies en poorten
src/games/milan-uprising/   # modulemanifest en Milan-regels
data/games/milan-uprising/  # toegestane declaratieve inhoud
src/ui/                     # bediening
src/presentation/2d/         # eerste renderer
src/presentation/3d/         # pas in fase 3
src/adapters/                # opslag, toeval, optionele integratie
```

Dit is een mapplan. Maak nu geen lege modules of extra toolchain. Begin met contracten en één werkende doorsnede, behoud bestaande functies tijdens migratie.

## App en hardware

Behoud van de officiële app blijft voorkeur, maar is geen engine-afhankelijkheid. Voeg pas een adapter toe zodra een gedocumenteerde/toegestane interface bewezen is. De UI maakt geen GATT-payloads. Houd mock, hardware-aanwezigheid en bewezen appcompatibiliteit afzonderlijk zichtbaar. Onderzoek blijft in ONDERZOEK.md; geen beveiligingsomzeiling of beschermde assets zonder toestemming.

## Acceptatie van de architectuur

1. Engine en Milan-regels werken in Node zonder browser of grafische bibliotheek.
2. Dezelfde opdrachten en vastgelegde worpen leveren headless, in 2D en later 3D dezelfde toestand op, zonder herschrijven van regels.
3. Een tweede synthetisch spelprofiel met andere bordvorm en bezetting vereist geen kernwijziging.
4. Ongeldige data/opdrachten muteren niets; incompatibele saves worden geweigerd of expliciet gemigreerd.
5. Sandbox werkt zonder volledige Milan-regels of Teburu.

Zie BESLUITEN.md voor de wijzigingen ten opzichte van het oorspronkelijke ontwerp.
