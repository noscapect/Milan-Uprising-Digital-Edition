# Architectuur — modulair tabletop-platform

Architectuur vastgesteld en eerste sandboxdoorsnede geïmplementeerd op 21 oktober 2026. Milan Uprising heeft een afzonderlijke game-module met neutrale profieldata; echte spelregels en locaties ontbreken nog. Prioriteit: getrouwe functionele 2D-reproductie, daarna automatisering en optionele visuele uitbreiding.

Uitbreiding 0.5 op 22 oktober: een apart schema-2-retailpakket bevat brongecontroleerde fysieke onderdelen en identiteiten. Generieke componentzijden worden als IDs in de engine bijgehouden; categorieën, bronverwijzingen en kleuren blijven in data/projecties. Regels en volledige locatiekaart blijven open. De oudere neutrale profielen en hun saves blijven werken.

Uitbreiding 0.6: een apart stadsprofiel bevat dertig districtslabels en tien Havenvelden in een eigen schema. De Milan-opstellingsbuilder en zijn UI staan buiten de engine; de engine ontvangt uitsluitend de generieke atomaire opdracht `table.arrange`. Er is geen vaste campagnebeginstand ingebouwd en geen automatische aangrenzendheids-/bewegingsregel toegevoegd.

## Bestaand prototype

Huidig: browserinvoer → applicatie → generieke engine en sandboxmodule → toestand/events → projectie → 2D-renderer. JSON-download is een aparte adapter.
Geen netwerktransport, BLE of officiële app-integratie in de applicatie.

De lokale Node-server serveert alleen expliciet toegestane statische bestanden op loopback.

Het oude model met vier pionnen en coördinaten blijft beschikbaar in legacy/ en src/model.js. De actieve engine gebruikt component- en zone-ID's; aantallen en capaciteit komen uit gevalideerde profieldata. Dit is geen uitspraak over Milan-spelregels. Er is geen hardwaremapping.

De oorspronkelijke demo blijft als referentie behouden. De actieve Milan-demo is naar de lagen hieronder gemigreerd. Een synthetisch profiel met drie onregelmatige zones en capaciteit groter dan één wordt headless getest; dit bewijst geen tweede complete game of 3D-ondersteuning.

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

De eerste modules in dit mapplan bestaan nu; 3D ontbreekt bewust. Geen extra toolchain. Contracten en huidige beperkingen staan in CONTRACTEN.md. Sinds uitbreiding 0.4 zijn losse kubussen/fiches en gevalideerd JSON-herstel via eventreplay beschikbaar voor hetzelfde profiel. Migraties, complexe componenttypen, regels, stapelvolgorde en oriëntatie volgen later.

## App en hardware

Het einddoel is nu expliciet de officiële app gebruiken zonder fysieke spelonderdelen. De app is daarbij regel-/campagneautoriteit; de engine levert de generieke virtuele tafel en presentatie. Toekomstige app-updates naar onze tafel moeten via een bewezen adapter binnenkomen, niet via dubbel uitgevoerde Milan-regels. De zelfstandige sandbox blijft ondersteunend.

De lokale virtual-core-adapter is uitsluitend een gedragssimulator. Identiteitsselectie, tijdelijk sensorcontact en logische zoneplaatsing zijn gescheiden. Vrijgeven van een sensor verwijdert geen pion. Herhaald contact geeft een interactie-intentie, geen spelregelactie. Werkelijke hardware-identiteitstoewijzing, sensorvolgorde en handshake zijn niet gereproduceerd. Publieke bronnen en beperkingen staan in TEBURU-DEEPSEARCH.md.

Behoud van de officiële app blijft voorkeur, maar is geen engine-afhankelijkheid. Voeg pas een adapter toe zodra een gedocumenteerde/toegestane interface bewezen is. De UI maakt geen GATT-payloads. Houd mock, hardware-aanwezigheid en bewezen appcompatibiliteit afzonderlijk zichtbaar. Onderzoek blijft in ONDERZOEK.md; geen beveiligingsomzeiling of beschermde assets zonder toestemming.

## Acceptatie van de architectuur

1. Engine en Milan-regels werken in Node zonder browser of grafische bibliotheek.
2. Dezelfde opdrachten en vastgelegde worpen leveren headless, in 2D en later 3D dezelfde toestand op, zonder herschrijven van regels.
3. Een tweede synthetisch spelprofiel met andere bordvorm en bezetting vereist geen kernwijziging.
4. Ongeldige data/opdrachten muteren niets; incompatibele saves worden geweigerd of expliciet gemigreerd.
5. Sandbox werkt zonder volledige Milan-regels of Teburu.

Zie BESLUITEN.md voor de wijzigingen ten opzichte van het oorspronkelijke ontwerp.
