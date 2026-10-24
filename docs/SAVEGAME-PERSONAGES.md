# Personages bij het hervatten van een savegame

De gekoppelde tafel toont boven de kaart **Saved roster · Slot …** met de personages uit het officiële saveprofiel. De speler ziet per personage of een scan nog nodig is, is verstuurd, door Milan als plaatsingsopdracht is beantwoord of na plaatsing is bevestigd. Alleen resterende personages uit die groep kunnen worden gescand wanneer Milan daarom vraagt. Een vrije keuze uit de hele retailvoorraad is bij hervatten onjuist.

## Bron en werking

De private Android-adapter leest via de al geautoriseerde USB-verbinding uitsluitend de saveversie en profielmetadata uit de externe opslag van Milan. De app, campagne en savebestanden worden niet aangepast. De laatste saveverwijzing in het profiel bepaalt de slotindex; de bijbehorende header bevat de vier personagedefinities. Deze worden via lokaal gecontroleerde namen naar onze onderdeel-ID's vertaald. Accountgegevens en hardware-identiteiten worden niet aan de bordpagina doorgegeven. Ruwe bestanden en formaatonderzoek blijven onder `private/`.

De geverifieerde Android 1.0.9-save wees slot 5 aan met **Simona Ferrari, Orlando Bianchi, Latebra Uberto Ascheri en Dante Brunieri**. Dezelfde groep werd afzonderlijk in de bijbehorende campagnegegevens aangetroffen. Dit resultaat is uit de save gelezen, niet afgeleid van de oude virtuele bordposities of een vaste voorkeursgroep.

De achtergrondtaak leest de profielmetadata periodiek opnieuw, zonder Codex of een open bordbrowser. Bij onbekend formaat, onvolledige gegevens, een niet ondersteund personage of ontbrekende USB-verbinding blijven de scanknoppen uitgeschakeld. De laatst gelezen groep kan zichtbaar blijven met een expliciete melding dat die niet bevestigd is. De momenteel ondersteunde bron is het lokale standaardprofiel van de gecontroleerde appversie; andere profielstructuren worden niet op basis van vermoedens geïnterpreteerd.

## Registratie en herladen

Een geslaagde verzendactie is nog geen bevestigde registratie. Pas een herkende plaatsingsopdracht maakt de scan bevestigd; de daaropvolgende appbevestiging maakt het personage geregistreerd. Ook een reeds bestaande virtuele positie kan daarom opnieuw een sensorcontact nodig hebben. Een stabiele overgang naar het volgende scanscherm bevestigde de echte plaatsing van Simona in Haven 2L.

De voortgang wordt lokaal bewaard, gekoppeld aan slot, campagne, scenario en groep. Een nieuwe hardware- of componentenopstelling maakt de registratievoortgang opnieuw leeg. Een ander slot erft geen oude registraties. De namenlijst blijft zichtbaar tijdens setup; de scanknoppen worden pas actief wanneer Milan daadwerkelijk **Scan your Character** toont.

## Verificatie en grenzen

- De echte profieluitlezing en namenlijst zijn gecontroleerd op de gedeelde bordpagina, zonder nieuwe spelinvoer te versturen.
- Afzonderlijke tests controleren een andere slotverwijzing, gewijzigde groepssamenstelling, dubbele of onbekende personages, onvolledige bestanden, herstart, een nieuwe setup en ontbrekende verbinding.
- De browserproef simuleert daarnaast een scanverzoek en registratievoortgang, zonder daarmee nieuwe scanacceptatie door Milan te claimen. De eerder bevestigde Simona-plaatsing is een afzonderlijke echte waarneming.
- De achtergrondtaak bepaalt hiermee de opgeslagen groep en registratievoortgang. Dit is geen volledige save-import van bordposities, tegels, verhaalmarkers of actuele spelregels.

De publieke demo blijft zonder externe dependencies werken. De private reader gebruikt tijdens het spelen alleen Node en de bestaande geautoriseerde ADB-verbinding; onderzoekshulpmiddelen zijn geen runtimevereiste.
