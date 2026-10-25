# Prospero naast de tafel

De gekoppelde tafel toont **Prospero, Prince of Milan** op zijn troon rechts naast de fysieke kaart, met een duidelijk zichtbare LED-voet en vier afzonderlijke lichtsegmenten. Dit is het miniatuuraccessoire. De afzonderlijke verhaalcampagne **Prospero's Legacy** en zijn extra spelonderdelen worden hiermee niet toegevoegd of ontgrendeld.

De [uitgeverspagina van de miniatuur](https://pegasus.de/Teburu-Vampire-The-Masquerade-Milan-Uprising-Prospero-Prince-of-Milan-Miniature/34037G) bevestigt compatibiliteit met de LED-ring. [Xplored beschrijft vier LED-lichten](https://teburu.zendesk.com/hc/en-us/articles/25458659932827-Troubleshooting-your-Teburu-LED-Ring). Prospero is een afzonderlijke miniatuur naast de kaart, geen achtste speelbaar basispersonage. Zijn weergave voegt geen RFID-identiteit of campagne-invoer toe en wijzigt bestaande sessies niet.

Het lokale beeld komt uit de reeds geïnstalleerde officiële app. De originele instructieafbeelding bevat meerdere aanzichten; CSS toont uitsluitend het rechter aanzicht van de gemonteerde miniatuur. Het brondocument wordt niet aangepast. De beelden en het extractiescript blijven onder genegeerd `private/`. Zonder lokaal artwork blijven naam, voet en vier lichtsegmenten zichtbaar.

## Lichtstand

Zonder ontvangen lichtopdracht toont de tafel een neutrale voet met **LED ring · awaiting Milan**. Er worden geen gezondheid, macht, dreiging of kleurbetekenissen verzonnen. De optionele private adapter kan ondersteunde broadcastopdrachten voor vier RGB-kleuren, één RGB-/paletlicht en uitschakelen doorgeven. Individueel geadresseerde, ongeldige en niet ondersteunde opdrachten worden niet aan Prospero toegeschreven. Alleen de laatst ontvangen statische kleuren worden weergegeven; aangevraagde hardwareanimaties worden nog niet nagebootst. Verbreken van de Coreverbinding maakt de actuele lichtstand weer onbekend.

Dit implementeert de presentatie en een beperkte uitvoerprojectie. Het meldt geen virtuele LED-ring als nieuw radioapparaat aan Milan en bewijst geen volledige LED-ringemulatie. Of en wanneer de officiële app een broadcastopdracht uitstuurt, blijft door die app bepaald. De stand is ook via de bestaande gedeelde bordlink zichtbaar; hiervoor is geen aparte toegang of handmatige kleurbediening nodig.

Na activering is op de echte verbinding een uitschakelopdracht uit Milan ontvangen: alle vier kleuren werden zwart. Dat bevestigt deze beperkte live uitvoerroute. Een volledige kleur-/animatiesequentie en herkenning van een virtueel ringapparaat zijn daarmee nog niet aangetoond.

## Verificatie

De publieke tests controleren het accessoire zonder speelbare identiteit en accepteren uitsluitend vier volledige waargenomen RGB-waarden. De browserproef controleert origineel artwork, de vier segmenten, kleurupdates, neutrale status, behoud van het grootste schermdeel voor de kaart, drie kleinere schermformaten en de terugval zonder artwork. De private parserproef controleert samengestelde en afzonderlijke kleurwijzigingen, uitschakelen en het negeren van vreemde adressen of ongeldige invoer. De virtuele Bluetooth-proef controleert ook de projectie van een ontvangen broadcast en het wissen na verbreken. Deze proeven sturen geen echte spelactie naar Milan.
