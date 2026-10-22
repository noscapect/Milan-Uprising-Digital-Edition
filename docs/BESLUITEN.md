# Architectuurbeslissingen — 21 oktober 2026

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
