# Architectuurbeslissingen — 21 oktober 2026

## Projectnaam — 29 oktober 2026

Het project heet voortaan **Teburu Core Emulator (TCE)**; de GitHub-repository heet `Teburu-Core-Emulator`. Dit betreft uitsluitend de naam, zichtbare projectbranding en pakket-/launchernamen. Milan Uprising blijft de bestaande spelmodule. De volgende refactorering voor meer spelmodules is afzonderlijk werk. Sessie-/profiel-ID's, interne formaatnamen en bestaande opslag blijven behouden; deze naamswijziging is geen nieuw compatibiliteitsbewijs.

## Windows-releasekandidaat — 29 oktober 2026

De releasebuilder gebruikt alleen publieke bronmappen, verpakt Node/Python en self-contained .NET-helpers, bewaart third-party notices en voegt een bestandsmanifest toe. De per-user installer bewaart private instellingen bij bijwerken. Android-tools worden pas na afzonderlijke toestemming rechtstreeks van Google gedownload; Linux-pakketten en de eigen geïsoleerde helperomgeving worden via vaste opdrachten voorbereid. Tablettoestemming, voorgrondapp en schermresolutie worden gecontroleerd; taal en oriëntatie blijven een expliciete gebruikersbevestiging. Normaal stoppen geeft uitsluitend de door onze sessie geregistreerde radio-overdracht terug; na geforceerd afsluiten is herstel expliciet. De releaseworkflow is alleen handmatig en mag niet voor de review worden uitgevoerd. Geen fysieke tweede-machineacceptatie of volledige campagnevalidatie geclaimd.

## Windows-voorbereiding — 29 oktober 2026

Bluetooth via WSL2 is de vaste transportkeuze voor de Windows-/Android-route. Het Control Center controleert de Windows-onderdelen en biedt expliciete installatieacties voor WSL, Debian en usbipd, plus selectie en delen van één gedetecteerde Bluetooth-adapter. Alle installatie- en UAC-vensters blijven zichtbaar. Er is geen automatische herstart, verwijdering/conversie van bestaande distributies of adapteroverdracht bij een statuscontrole. Acties zijn vast begrensd en alleen beschikbaar via de lokale same-origin bediening. Machineconfiguratie en voortgang blijven in private/. Een broncheckout is hiermee nog geen complete gebundelde release. Zie [installatie](INSTALLATION.md).

## Overdraagbare distributie — 29 oktober 2026

De projecteigenaar heeft publicatie van het geselecteerde artwork en de eigen afgeleide integratiecode expliciet toegestaan. Het artwork wordt als één archief meegeleverd en automatisch lokaal uitgepakt. De benodigde eigen runtimecode wordt onder `integration/runtime/` beheerd; de launcher maakt daaruit een afzonderlijke genegeerde werkmap `private/linked/`. Machineconfiguratie, spelstanden, observaties en willekeurig gegenereerde identities blijven lokaal. De oorspronkelijke SDK, libraries, voorbeelden en documentatie blijven uitgesloten. De bestaande private ontwikkelopstelling wordt niet gekopieerd of gewijzigd. De gekoppelde route vereist nog steeds expliciete configuratie van de eigen radio en tablet; een volledige campagne of iedere machine is hiermee niet bewezen. Zie [installatie](INSTALLATION.md).

## Verdieping na bronnenonderzoek

- Officiële app gebruiken zonder fysieke spelonderdelen is het einddoel; sandbox en eigen regels zijn ondersteunend, geen stilzwijgende vervanging van dat doel.
- Sensorcontact is niet hetzelfde als spelzonebezetting. De nieuwe studie scheidt die, behoudt de oorspronkelijke demo en laat meerdere demopionnen één zone delen.
- SDK-aanvraagroute is gevonden, maar niet bewezen geschikt voor bestaande apps en niet aangevraagd. Eventuele vertrouwelijke inhoud blijft buiten de publieke repo.
- Officiële Milan-digitale dice zijn de eerste te testen route; hardwaredice nabootsen krijgt geen automatische prioriteit.
- Een browser-Central API bewijst geen virtuele Core/peripheral. Transportkeuze wacht op bewijs en toegestane interfaces.

Onderbouwing: TEBURU-DEEPSEARCH.md. Echte appcompatibiliteit blijft onbewezen.

Status: eerste modulaire sandboxdoorsnede geïmplementeerd. Regels, fysieke inhoud, 3D en appintegratie blijven open.

| Onderwerp | Vorige richting | Nieuwe beslissing |
| --- | --- | --- |
| Productgrens | Milan-bordvervanger met adapter | Generiek tabletop-platform met Milan als eerste game-module. |
| Bordmodel | Vier vaste pionnen en 8 × 5, één pion per cel | Entiteiten en zones in kern; geometrie, aantallen en bezetting in profiel/module. |
| Spelregels | Volledige regels buiten eerste scope | Getrouwe handmatige 2D-reproductie in fase 1; automatisering expliciet in fase 2. |
| Gegevens | Demo-waarden direct in code | Versieerbare declaratieve pakketten voor componenten, personages, scenario's en releases, met rechten/herkomst. |
| Presentatie | Browser rond eenvoudig model | Strikte scheiding engine, regels, gegevens, UI en presentatie. Optioneel 3D in fase 3 zonder regelherschrijving. |
| Appintegratie | Compatibiliteit als eerste hoofdroute | Zelfstandig onderzoeksspoor en optionele adapter; appbehoud blijft voorkeur, compatibiliteit onbewezen. |
| Sandbox | Mogelijke uitwijkroute | Volwaardige toekomstige modus, met structurele controles en handmatige handelingen. |
| Opslag | JSON-demo-export | Versieerbare saves en gevalideerde import in fase 2; demoformaat blijft apart. |
| Uitbreiding | Andere spellen niet gespecificeerd | Modulecontracten en pakketten; generiek ontwerp toetsen met tweede synthetisch profiel. |

Alle bestaande code, tests, neutrale vormgeving, prototypefuncties en onderzoeksbevindingen blijven behouden. De actieve demo gebruikt nu de gescheiden lagen; legacy/ bewaart de oorspronkelijke demo. CONTRACTEN.md beschrijft het geïmplementeerde contract en de open fysieke inventaris. Sensorverificatie bewijst geen Milan-locatiemapping of appcompatibiliteit. Rechten- en beveiligingsgrenzen blijven gelden.

Afweging: leg kleine expliciete contracten vast en migreer stapsgewijs. Bouw geen algemene regelscripting, pluginmarktplaats of 3D-toolchain voordat concrete spelhandelingen dit nodig maken.

## 0.7 — lokaal app-artwork

Originele, leesbare textures uit de lokaal geïnstalleerde app worden uitsluitend onder genegeerd `private/artwork/` bewaard. De server heeft een beperkte PNG-allowlist en een gefilterde catalogus; domeinstate en sessie-export bevatten geen afbeeldingen of lokale paden. Geen externe demo-dependencies. De optionele UnityPy-extractor staat los van de runtime. Details: [ARTWORK.md](ARTWORK.md).

Kaartnamen Portello, Sempione en Argonne zijn gecorrigeerd op basis van de scherpe appkaart. Nieuw standaardpakket `city.json` 0.7.0 met eigen release-ID; `campaign.json` 0.6 blijft intact voor bestaande sessies. Geen stille sessiemigratie.


## Tafel eerst, 22 oktober 2026

De oorspronkelijke kaart wordt met lokaal artwork de interactieve hoofdweergave. Volledige schermbreedte, een compacte zijbalk, schaalbare kaart en aparte voorbereidingsvensters vervangen de lange informatiepagina. Visuele klikgebieden zijn eigen benaderingen, buiten de engine. Bekijken is de standaard; voorraadselectie schakelt naar plaatsen. De volledige locatie-inhoud blijft toegankelijk wanneer het bord meer dan vier onderdelen samenvat.

De officiële app blijft het einddoel en de beoogde regelautoriteit. Automatisering kan dezelfde applicatie aansturen: observatie van statewijzigingen vernieuwt de UI ook zonder gebruikershandeling. Er is geen werkende officiële appadapter of automatisch overgenomen cityronde ingebouwd. Origineel artwork blijft uitsluitend lokaal.
