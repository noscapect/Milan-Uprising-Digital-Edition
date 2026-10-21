# Architectuurbeslissingen — 21 oktober 2026

Status: vastgesteld ontwerp; implementatie volgt later.

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

Alle bestaande code, tests, neutrale vormgeving, prototypefuncties en onderzoeksbevindingen blijven behouden. Deze wijziging betreft uitsluitend planning, architectuurdocumentatie en ontwikkelinstructies. Sensorverificatie bewijst geen Milan-locatiemapping of appcompatibiliteit. Rechten- en beveiligingsgrenzen blijven gelden.

Afweging: leg kleine expliciete contracten vast en migreer stapsgewijs. Bouw geen algemene regelscripting, pluginmarktplaats of 3D-toolchain voordat concrete spelhandelingen dit nodig maken.
