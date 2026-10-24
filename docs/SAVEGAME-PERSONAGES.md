# Personages scannen en herstellen

De gekoppelde tafel toont de laatst gelezen opgeslagen groep als hulpmiddel. Registratievinkjes, bordposities en OCR-herkenning mogen een nieuwe RFID-scan niet blokkeren. De Core moet verbonden zijn en de officiële app moet de RFID-lezer hebben ingeschakeld. Alle bekende speelbare miniaturen kunnen dan opnieuw worden aangeboden; de officiële app beoordeelt de scan.

Bij een nieuw spel of een niet bevestigde savegroep staan alle zeven basispersonages in de miniaturenstrook. Een achtergebleven groep van vier uit een vorige sessie beperkt die keuze niet. Bij een bevestigde geladen save toont de strook de nog te scannen leden van die groep. De keuze komt uit de componentgegevens en heeft geen vaste limiet van vier.

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


## Bondgenoten en ghouls scannen

De gekoppelde PC-Core ondersteunt naast de zeven personages ook de vier miniaturen uit onze retailvoorraad: **Carabinieri Officer**, **Reporter**, **Con Artist** en **Fixer**. Ze hebben afzonderlijke scanknoppen met het label Ally of Ghoul. Wanneer Milan om een Ally/Ghoul vraagt, staan deze vier miniaturen naast het bord klaar om naar de Core-lezer te slepen. Scannen verandert hun blijvende bordpositie niet. De officiële app bepaalt welke miniatuur in de huidige situatie geldig is; selecteer zelf het juiste onderdeel.

De private adapter herkent het zichtbare verzoek om een Ally/Ghoul te scannen en kent een daaropvolgende plaatsingsinvoer toe aan de aangeboden miniatuur, niet aan de spelersnaam onderaan dat scherm. Alle veertig sensorbestemmingen gebruiken de bestaande plaatsingsroute met appbevestiging. Een niet herkende bevestiging blijft onbevestigd; de adapter verzint geen plaatsing.

De elf scanselecties zijn afzonderlijk getest op hun semantische gegevens uit lokale appmetadata. Hiervoor worden uitsluitend eigen gegenereerde virtuele identiteiten gebruikt. De browserproef controleert de vier knoppen, de wachtrij, slepen naar de lezer en het behoud van bordposities. De bijgewerkte Core is opnieuw met de tablet verbonden en de lezer is actief. Acceptatie van een concrete bondgenoot/ghoul en de daaropvolgende plaatsing moet tijdens het echte spelen nog worden bevestigd; de tests kiezen geen onderdeel namens de speler.
