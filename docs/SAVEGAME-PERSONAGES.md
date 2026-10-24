# Personages scannen en herstellen

De gekoppelde tafel toont de laatst gelezen opgeslagen groep als hulpmiddel. Registratievinkjes, bordposities en OCR-herkenning mogen een nieuwe RFID-scan niet blokkeren. De Core moet verbonden zijn en de officiële app moet de RFID-lezer hebben ingeschakeld. Alle bekende speelbare miniaturen kunnen dan opnieuw worden aangeboden; de officiële app beoordeelt de scan.

## Fysieke handeling op het virtuele bord

Sleep een miniatuur uit de wachtrij naast het bord naar de Core-lezer. Dit is een tijdelijk lezercontact, geen blijvende spelpositie. Daarna sleep je het gelezen personage naar de locatie die Milan aanwijst. De adapter bewaart die positie pas na een herkende appbevestiging. Een personage mag opnieuw dezelfde bestemming krijgen: een oude bordpositie vervangt geen nieuw sensorcontact. Klikken op een scanknop blijft een toegankelijk alternatief.

De opgeslagen groep komt uit profielmetadata die de private Android-adapter via de geautoriseerde USB-verbinding leest. De officiële app en savebestanden worden niet gewijzigd. Bij onleesbare metadata blijft de laatst bekende groep adviserend zichtbaar; een ingeschakelde Core-lezer blijft bruikbaar. Onbekende bestandsformaten worden niet op basis van vermoedens geïnterpreteerd.

## Na een crash of herstart

De achtergrondadapter vergelijkt de Android-app-procesinstantie met de vorige waarneming. Bij een andere instantie worden tijdelijke registratievoortgang, scancontext en een nog onbevestigde beweging vergeten. De beweging wordt voor onderzoek als afgebroken bewaard en nooit automatisch opnieuw verstuurd. Een herstart van alleen onze server behoudt de bekende appinstantie.

Op het bord staat **App restarted? Recover input**. Het Control Center biedt **Reset registrations / recover input**. Deze bediening is ook beschikbaar als schermherkenning of saveprofieluitlezing niet lukt. Ze wist tijdelijke voortgang en geeft actieve sensorcontacten vrij, zonder bewegingen te bevestigen of nieuwe spelacties te kiezen. Bevestigde bordposities, fiches en officiële campagnebestanden blijven behouden. Dit is dus geen opdracht om de hele campagne te wissen. Volg na herstel het actuele scherm in Milan en scan opnieuw wanneer de lezer actief is.

Als Android niet via USB bereikbaar is, kan de adapter een procesherstart niet waarnemen. Gebruik dan de herstelknop zodra de Coreverbinding weer beschikbaar is. Korte gelijktijdige sensoracties blijven geserialiseerd om overlappende contacten te voorkomen.

## Verificatie en grenzen

De geïsoleerde herstelproef controleert een gewijzigde procesinstantie, afgebroken wachtende beweging, behouden sessie, herhaald scannen en uitsluitend vrijgeven van actieve contacten. Browserproeven controleren slepen naar de lezer, tijdelijke presentatie, plaatsingsbevestiging, foutafhandeling en schermformaten. Dit zijn simulatieproeven; ze vervangen geen echte acceptatie door Milan. Eerder werden onder meer plaatsingen in Haven 2L en QT8 door de echte app bevestigd. Een volledige campagne-import blijft buiten deze beperkte uitlezing.

De publieke demo blijft zonder externe dependencies werken; protocolgegevens en ruwe apparaatwaarnemingen blijven onder private/.
