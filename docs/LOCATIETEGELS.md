# Locatiebonus en speciale locatietegels

Kies een stadsdistrict op de kaart. Onder **Locatie → Bordtegels** staan afzonderlijke bedieningselementen voor de **Locatiebonus** en de **Speciale locatie**. Kies het type dat de officiële app toont en klik **Zichtbaar maken**. Daarna wisselt **Tegel omkeren** tussen zichtbaar en verborgen. De kaart toont zichtbare tegels met een label. Dit werkt ook op de schematische kaart en via de gedeelde bordlink.

De officiële handleiding beschrijft locatiebonussen en hun typen op pagina 7: Haven, Herd, Income, Media Office, Possible Haven, Secret Bar en Underground. Bron: [Game Manual](https://teburu.com/downloads/VtM/VTM_MU_GameManual.pdf). Er is geen volledige geverifieerde toewijzing van beide fysieke zijden aan ieder district ingebouwd. Een onbekende tegel blijft daarom **Nog niet ingesteld** of **Nog niet vastgesteld**. Het kiezen van een bonus voert de bijbehorende spelactie niet uit; dat blijft aan Milan.

Op het gecontroleerde Android-scherm voor **Scenario setup → Board tiles** staat QT8 met Haven 11. Die speciale tegel is op de huidige gekoppelde tafel ingesteld en via de echte LAN-bediening gecontroleerd. Dit bevestigt niet de volledige overige scenario-opstelling. Alleen Haven 11 en Haven 12 zijn momenteel benoemde speciale tegels; andere speciale typen zijn nog niet ingevuld.

## Opslag en architectuur

De tegelstand is afzonderlijke headless Milan-moduledata: `milan-location-tiles`, schema 1, met een revisie en per district een bonus- en speciale tegel. Elke tegel heeft een waarde en een zichtbaarheid: onbekend, verborgen of zichtbaar. Opdrachten valideren district, tegeltype, waarde en verwachte revisie. Dezelfde stand kan door 2D en een latere 3D-presentatie worden gebruikt; er staan geen grafische objecten in de toestand.

De bestaande engine, bordprofielen en pion-/fiche-events veranderen niet. Op de zelfstandige stadstafel bevat **Bewaar JSON** de optionele toevoeging `locationTiles`. Openen valideert die vóór vervanging van de tafel; oudere exports zonder deze toevoeging blijven bruikbaar. De tegelstand heeft nog geen eigen undo/redo-geschiedenis; gebruik omkeren om de vorige zichtbaarheid terug te zetten.

De private gekoppelde tafel bewaart deze gegevens apart op de pc. Alle browsers lezen en wijzigen dezelfde stand; een verouderde revisie wordt geweigerd en opnieuw ingelezen. Omkeren van zo'n losse fysieke tegel vereist geen sensorcontact en stuurt dus ook geen fictieve bevestiging naar Milan. De gebruiker bedient **Continue** in de officiële app. Automatische herkenning van alle afgebeelde opstellingstegels en automatisch wissen bij een nieuwe campagne zijn nog niet geïmplementeerd.

## Controle op 24 oktober 2026

Headless tests controleren validatie, beide tegelsoorten, revisieconflicten, behoud van pionnen, export/herstel en onveranderlijke projecties. Browsertests controleren een bonus zichtbaar maken en omkeren, JSON-export, instellen van Haven 11 via de LAN-link en behoud na herladen. De nieuwe route gebruikt dezelfde login- en oorsprongcontroles als bordbewegingen. De volledige suite slaagt met 48 tests; de bestaande sleepbediening is opnieuw in de browser gecontroleerd.
