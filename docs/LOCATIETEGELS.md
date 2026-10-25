# Locatiebonus en speciale locatietegels

## Havenkamers links op het bord

Sinds 25 oktober kunnen de tien Havenkamers ook een afzonderlijk kamertype, niveau (onbevestigd, standaard of upgraded) en actuele bonus bewaren. Voorheen waren deze kamers uitsluitend pixels in de vaste kaartafbeelding; daarmee konden upgrades of veranderde bonussen niet worden weergegeven. Dit staat los van het Haven-huissymbool op een stadsdistrict.

Klik een Havenkamer aan en kopieer onder **Location → Haven room** het kamertype, niveau en de actuele bonus uit Milan. **Save current Haven bonus** bewaart de gegevens en toont de bonus direct op de kaart. De gekoppelde tafel deelt deze stand met de andere browsers via de bestaande tegelroute. Het wijzigen van de tekst gebruikt de kamer niet, koopt geen upgrade en wijzigt de officiële campagne niet. Zonder bevestigde gegevens staat op het bord **Bonus not copied from Milan**; er wordt geen bonus uit het achtergrondbeeld afgeleid.

Automatische uitlezing van de tien actuele kamerstanden uit de officiële app is nog niet geïmplementeerd. Deze wijziging voegt expliciete kopieerbediening, weergave en opslag toe. De Havengegevens zitten optioneel in de bestaande `locationTiles`-opslag; oude exports blijven leesbaar. Testen controleren revisieconflicten, ongeldige kamer-ID’s, upgrade-/bonuswijzigingen, replay van de overige tafel, onveranderlijke projecties en expliciet onbekende bonussen. Alle 77 publieke tests en de desktop-/mobiele browserproef slagen.

Kies een stadsdistrict op de kaart. Onder **Location → Board tiles** toont een kaartje het symbool, de betekenis en het gebruik van de getoonde tegel. **Flip tile** wisselt tussen achterzijde en symboolzijde. Om een nog onbekende tegel uit Milan over te nemen, open je **Copy or correct a tile**. De appinterface en de speluitleg zijn Engels, passend bij het spel; deze documentatie blijft Nederlands. Dezelfde uitleg werkt op de schematische kaart en via de gedeelde bordlink.

De officiële handleiding beschrijft locatiebonussen en hun typen op pagina 7: Haven, Herd, Income, Media Office, Possible Haven, Secret Bar en Underground. Bron: [Game Manual](https://teburu.com/downloads/VtM/VTM_MU_GameManual.pdf). Er is geen volledige geverifieerde toewijzing van beide fysieke zijden aan ieder district ingebouwd. Een onbekende tegel blijft daarom **Nog niet ingesteld** of **Nog niet vastgesteld**. Het kiezen van een bonus voert de bijbehorende spelactie niet uit; dat blijft aan Milan.

Op het gecontroleerde Android-scherm voor **Scenario setup → Board tiles** staat het huisjessymbool in QT8. Het bord toont nu **Schuilplaats** en legt de Haven-functie uit. Het eerdere label “Haven 11” was onvoldoende onderbouwd als spelterm. De handleiding beschrijft Haven als locatiebonus, zonder afzonderlijke spelregels voor “Haven 11” en “Haven 12”. De oude opslagwaarden blijven leesbaar, maar worden niet meer als verschillende Haven-typen of kamernummers aangeboden. De volledige fysieke toewijzing van alle tegelzijden blijft open.

## Werking op het fysieke bord

Een locatiebonus is een klein omkeerbaar inzetstuk. Het symbool herinnert aan de vrijgespeelde bonus; de officiële app biedt de bijbehorende actie. De attribuuticonen in het midden van een district geven verwachte encounter-attributen aan en zijn een andere informatielaag. Controlefiches geven weer wie het district beheerst. Bronnen: handleiding pagina 7, 8 en 13.

De digitale oplossing toont daarom het spelsymbool met uitleg, benoemt de twee zijden en houdt het kiezen/corrigeren van een tegel apart van normaal spelen. Bij het herkende opstellingsscherm staat er concreet dat je de getoonde zijde vergelijkt en daarna Continue in Milan gebruikt. Het tonen van uitleg voert geen spelactie uit. Een verbindingsfout in Milan wordt als fout herkend, niet als gereed opstellingsscherm.

## Opslag en architectuur

De tegelstand is afzonderlijke headless Milan-moduledata: `milan-location-tiles`, schema 1, met een revisie en per district een bonus- en speciale tegel. Elke tegel heeft een waarde en een zichtbaarheid: onbekend, verborgen of zichtbaar. Opdrachten valideren district, tegeltype, waarde en verwachte revisie. Dezelfde stand kan door 2D en een latere 3D-presentatie worden gebruikt; er staan geen grafische objecten in de toestand.

De bestaande engine, bordprofielen en pion-/fiche-events veranderen niet. Op de zelfstandige stadstafel bevat **Bewaar JSON** de optionele toevoeging `locationTiles`. Openen valideert die vóór vervanging van de tafel; oudere exports zonder deze toevoeging blijven bruikbaar. De tegelstand heeft nog geen eigen undo/redo-geschiedenis; gebruik omkeren om de vorige zichtbaarheid terug te zetten.

De private gekoppelde tafel bewaart deze gegevens apart op de pc. Alle browsers lezen en wijzigen dezelfde stand; een verouderde revisie wordt geweigerd en opnieuw ingelezen. Omkeren van zo'n losse fysieke tegel vereist geen sensorcontact en stuurt dus ook geen fictieve bevestiging naar Milan. De gebruiker bedient **Continue** in de officiële app. Automatische herkenning van alle afgebeelde opstellingstegels en automatisch wissen bij een nieuwe campagne zijn nog niet geïmplementeerd.

## Controle op 24 oktober 2026

Headless tests controleren validatie, beide tegelsoorten, revisieconflicten, behoud van pionnen, export/herstel en onveranderlijke projecties. Browsertests controleren omkeren, JSON-export, de gedeelde tegelstand en behoud na herladen. De aanvullende betekenistest controleert huisjessymbool, uitleg over nacht/zonsopkomst, achterzijde/symboolzijde en de beschikbaarheidsuitleg voor een gewone bonus. Deze test gebruikt de echte opgeslagen tegelstand met een nagebootste opstellingsfase; tijdens de proef toonde de echte app een netwerkfout. De nieuwe route gebruikt dezelfde login- en oorsprongcontroles als bordbewegingen. De volledige suite slaagt met 48 tests; de bestaande sleepbediening is opnieuw in de browser gecontroleerd.
