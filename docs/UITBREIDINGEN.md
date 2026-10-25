# Zes uitbreidingspakketten

Toegevoegd op 25 oktober 2026. De voorraad volgt de [officiële fysieke inventaris van Xplored](https://teburu.zendesk.com/hc/en-us/articles/25458904976667-Physical-components-VTM). Namen van de vier extra personages zijn ook gecontroleerd op de [officiële gamepagina](https://games.teburu.com/vtm-milan-uprising). Alleen namen, aantallen en eigen schematische presentatie zijn opgenomen; verhalen en spelregels blijven in de officiële app.

| Pakket | Extra onderdelen | Inhoud op de tafel |
| --- | ---: | --- |
| Faction Miniatures | 50 | 20 Anarchs-, 20 Camarilla- en 10 St. Ambrose-controleminiaturen |
| Allies & Ghouls | 6 | Food Delivery Driver, Paramedic, Taxi Driver, Blood Addict, Enforcer en Punk |
| Playable Characters | 4 | Jamilah Ianni (Hecata), Domenica Amato (Lasombra), Aristide Demiana (Ministry) en Romeo De Carlo (Tzimisce) |
| Mystical Milan | 10 | Investigator, Burglar, twee NPC-fiches, vier amuletlocatiefiches en twee speciale locatiefiches |
| Prospero’s Legacy | 13 | Hacker, zes Sabbat-controleminiaturen en zes invloedskubussen |
| The Unending Dream | 18 | Real Estate Agent, Vagrant, tien Nephilim-invloedskubussen en zes NPC-fiches |

Samen zijn dit **101 extra onderdelen**, naast de 132 onderdelen van het basisspel. De controleminiaturen zijn alternatieve fysieke representaties: plaats niet zowel een basiscontrolefiche als een controleminiatuur om dezelfde controle dubbel te tellen. De tafel berekent geen controle uit het aantal miniaturen.

## Bediening

De zelfstandige demo biedt onder **Table settings → Table profile** het nieuwe profiel **Milan · base game + 6 expansion packs**. **Start an empty table with this profile** begint een lege tafel; bewaar eerst een bestaande sessie. De bestaande basisprofielen blijven beschikbaar voor hun oude exports. In **Stock** kun je filteren op basisspel of één van de zes pakketten. Alle onderdelen ondersteunen de gewone plaatsing, gedeelde zones, terugleggen, undo/redo en JSON-opslag.

De private gekoppelde tafel gebruikt de uitgebreide voorraad. Hij biedt elf personages, acht bondgenoten en zeven ghouls als scanbare miniaturen. Scans zijn alleen beschikbaar wanneer de officiële app haar lezer inschakelt; ze gebruiken eigen blijvende simulatie-identiteiten. De nieuwe catalogus is in de pc-Core geladen. De oudere Android-helper ondersteunt deze uitbreiding niet.

Voor controleminiaturen, uitbreidingskubussen en fiches staat onder **Stock → Place expansion markers** een onderdeelkeuze, locatiekeuze en bediening voor plaatsen of terugleggen. Dit werkt ook via de gedeelde bordlink. Deze handelingen wijzigen alleen onze tafel: volg de plaatsingsinstructies in Milan. De automatische invloed-/controleherkenning blijft beperkt tot de drie basisfacties. Sabbat, Nephilim en speciale uitbreidingsmarkers worden handmatig overgenomen. Een markerhandeling kan geen scanbare miniatuur verplaatsen en weigert een verouderde tafelrevisie.

Selecteren of filteren op onze tafel activeert geen uitbreidingsverhaal in de officiële app. Gebruik daarvoor de normale uitbreidingskeuze in Milan. Er zijn geen activeringscodes, officiële tag-identiteiten, campagne-inhoud of gewijzigde appbestanden toegevoegd. De Prospero-accessoireminiatuur met LED-ring blijft een afzonderlijk accessoire.

## Gegevens en opslag

`expansions.json` bevat zes afzonderlijke, bronverwezen voorraden. `withExpansions` stelt daaruit een eigen Milan-profiel samen; de generieke engine heeft geen uitbreidingsafhankelijkheid. De opgenomen combinatie in `city-expansions.json` is reproduceerbaar met:

```powershell
node tools/build-expansion-profile.mjs
```

Iedere combinatie heeft een eigen release-ID. De importcontrole blijft de exacte profielversie vereisen. Er is geen stilzwijgende verruiming van de generieke save-import.

De private adapter zet bestaande eigen basisbordexports expliciet om met `extendTableSession`: eerst controle van de oude save door replay, daarna replay van dezelfde events op het uitgebreide profiel en opnieuw validatie. Posities, bestaande ficheszijden, revisie en vastgelegde worpen blijven behouden; nieuwe onderdelen beginnen in voorraad. De adapter gebruikt afzonderlijke bestanden met het achtervoegsel `-expansions.json` en laat de oorspronkelijke basisbordbestanden staan. Dit is geen omzetting of wijziging van officiële Android-campagnesaves. De private alleen-lezen rosterkoppeling kent nu ook de vier extra personagedefinities.

## Verificatie en grenzen

Alle 73 publieke tests slagen, inclusief zes pakketvoorraden, alle 101 extra onderdelen samen in één zone, opslag/replay, undo/redo, incompatibele profielimport, behoud van bestaande saves, vier uitbreidingspersonages in de opstellingshulp en de gedeelde markerroute.

De private controle vergelijkt alle 26 scanpayloads met de eerder lokaal gelezen semantische miniatuurgegevens, controleert afzonderlijke eigen identiteiten en bewaakt de lezerstatus. Daarnaast slagen de 24 Core-regressiescenario’s, de virtuele Bluetooth-proef, de bestaande setup-/rosterregressies en de browserproef op desktop en mobiel. Die browserproef controleert zes voorraadfilters, 26 scanknoppen en markerplaatsing/terugleggen. De gekoppelde tafel is lokaal met 233 onderdelen geladen en de Core draait met de nieuwe catalogus.

Volledige campagnes van de zes uitbreidingen en alle nieuwe miniaturen zijn nog niet via echte Android-spelhandelingen geaccepteerd. De offline payload- en browserproeven bewijzen die compatibiliteit niet. Op de ingerichte pc hebben alle 101 uitbreidingsonderdelen inmiddels lokaal artwork; alle elf nieuwe bondgenoten/ghouls hebben ook hun volledige portret. Zonder dit private pakket blijven de eigen symbolen beschikbaar. Zie [artworkdekking en nummeringsgrenzen](ARTWORK.md). Ruwe metadata, synthetische identiteiten en private adaptercode blijven onder genegeerd `private/`.
