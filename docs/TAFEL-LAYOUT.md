# De virtuele fysieke tafel

## Gekoppelde speeltafel: bord centraal

De gekoppelde `/board`-pagina opent nu in een compacte speelweergave. Alleen een kop van 44–48 pixels, de actuele spelhandeling, **Pieces**, **Table menu**, de kaart en de Core-lezer blijven permanent zichtbaar. De zijbalk, scanlijsten, instructieblokken en technische synchronisatiemeldingen nemen standaard geen bordruimte meer in. De onderstaande beschrijving van de vaste werkbalk en zijbalk geldt nog voor de zelfstandige sandbox.

**Pieces** opent een zwevend onderdelenpaneel dat met Close of Escape weer sluit. Klikken op een district opent hetzelfde paneel direct op de locatie-inhoud, inclusief de bestaande tegelbediening. Scanknoppen staan onder **Pieces → Scan a miniature**; miniaturen kunnen ook rechtstreeks vanaf de Core-wachtrij worden gesleept. **Table menu** bevat zoom, Auto fit en tabelinformatie. Technische status, dobbelsteenbediening en **Recover input** staan onder **Connection & recovery**. Tijdens de dobbelsteenopstelling verschijnt bovendien een directe **Wake dice**-knop in de kop.

De volledige resterende breedte en hoogte zijn voor de tafel beschikbaar. Het bord behoudt zijn fysieke verhouding; op smalle staande schermen betekent dat vrije ruimte boven en onder de kaart. Meldingen na een handeling verschijnen kort als overlay en verschuiven de kaart niet. Open panelen zweven boven de tafel; ze verkleinen de kaart niet. Engine, sensormapping, scan-/plaatsingsopdrachten en saves blijven hetzelfde.

Browsercontrole op zes schermformaten bevestigt dat de bordruimte vanaf de compacte kop tot onderaan het venster loopt, zonder horizontale pagina-overloop. De proeven controleren ook slepen naar de lezer en naar een district, wachten op appbevestiging, locatie-inspectie, menu, herstelbediening en Escape. Screenshots en appfixtures blijven lokaal onder private/.


De gebruikerservaring vertrekt vanuit het bord op tafel. Op een breed scherm krijgt het bord alle ruimte naast een compacte zijbalk. Op tablet en telefoon schuift de zijbalk eronder. De hoofdweergave gebruikt de originele kaart uit het lokale artworkpakket. Figuren gebruiken de volledige personageafbeelding, kubussen en fiches hun eigen icoon. Geen externe grafische bibliotheek of netwerkdienst nodig.

## Bediening

- **Bekijken**: klik een district voor de volledige locatie-inhoud. Klik een geplaatst onderdeel om het te selecteren. Dit verandert geen speltoestand.
- **Plaatsen**: kies een onderdeel in de voorraad, of druk op Plaats / verplaats. Klik de bestemming; ook een district waar al onderdelen liggen blijft een geldige klikbestemming. Escape of Bekijken stopt het plaatsen.
- **Locatie**: alle aanwezige onderdelen zijn afzonderlijk selecteerbaar. Het geselecteerde voorraadonderdeel kan direct op deze locatie worden geplaatst. Boven vier onderdelen toont de kaart vier stukken en een `+n`-knop; de locatielijst blijft volledig.
- **Sessie**: JSON bewaren/openen, activiteiten en optionele lokale demo-dobbelsteen. Leegmaken staat achter een uitklapveld. Undo en redo staan direct onder het bord.
- **Passend / zoom**: het hele bord binnen de beschikbare breedte en hoogte, of tot 300% vergroten met scrollen/vegen. Bordfocus verbergt op desktop de zijbalk. De schematische weergave blijft beschikbaar.
- **Campagne-opstelling**: een apart venster voor het overnemen van de app-instructies. Geen ingebouwde officiële beginstand. **Tafelinstellingen** bevat profielen, broninformatie en beperkingen.

De klikgebieden zijn eigen benaderingen van de zichtbare gedrukte districten en Havenvelden. Het zijn geen spelregelgrenzen, bewezen aangrenzendheid of sensorcoördinaten. Logische plaatsing blijft een zone-ID. Bij afwezig artwork of een mislukte kaartdownload valt de weergave terug op het schema. Oude sessies gebruiken hun oorspronkelijke profiel en versies.

## Miniaturen naast de Core

Scanklare miniaturen staan in een aparte strook **links van de Core**, met een grotere afbeelding, volledige naam en clan of onderdeelgroep. De Core zelf bevat alleen de scanplek en de momenteel aangeboden miniatuur. De strook gebruikt de beschikbare ruimte naast de kaart; de kaart blijft leidend voor het passend maken.

De kaarten behouden hun leesbare formaat als er meer miniaturen beschikbaar zijn. De strook scrolt verticaal en toont vanaf negen beschikbare miniaturen een zoekveld voor naam of clan/groep. Er is geen vast aantal slots in deze UI. Op grotere schermen passen meerdere kolommen. Scrollpositie, zoekinvoer en bestaande miniatuurknoppen blijven bij ongewijzigde updates behouden. Een lege strook blijft als onzichtbare ruimte gereserveerd, zodat het bord bij de laatste scan niet opzij springt.

De Core is een eigen CSS-weergave met een compacte hoekige behuizing, een verzonken scanvak en ingetogen opdruk, gebaseerd op de [hardwareafbeelding van Teburu/Xplored](https://gamefound.com/en/projects/xplored/teburu-presents-the-bad-karmas/updates/10). Er is geen beschermde productfoto als asset opgenomen. Het kleine lichtje geeft onze scanbeschikbaarheid weer; dit is geen uitlezing van de fysieke Core-led.

De UI is getest met veertig synthetische extra miniaturen, inclusief zoeken, scrollen, behoud van DOM/scrollpositie en opruimen van de weergave. Dat bewijst ruimte voor toekomstige uitbreidingen, geen reeds geïmplementeerde speldata of app-/protocolondersteuning voor die uitbreidingen. De bestaande scan- en plaatsingsroute is afzonderlijk in de browser gecontroleerd.

## Automatisch passend maken

De fysieke kaart start met **Auto fit**. De weergave meet de daadwerkelijke resterende vensterhoogte na de kop, werkbalk, appmeldingen, scanbediening en statusregel. De kaart behoudt haar verhouding en past binnen zowel breedte als hoogte. Op desktop sluit de hoogte van de zijbalk aan; op kleinere schermen blijft de zijbalk onder het bord staan.

Vensterwijzigingen, schermwisseling en gewijzigde meldinghoogten leiden automatisch tot een nieuwe berekening. Handmatig zoomen blijft beschikbaar; **Auto fit** herstelt de volledige kaart. Deze berekening verandert uitsluitend presentatie en laat bordposities, sensorinvoer en saves ongemoeid. De gekoppelde bordpagina is gecontroleerd op 2560×1440, 1920×1080, 1366×768, 1280×720, 768×1024 en 390×844, inclusief extra instructies boven het bord, zoomen en bordfocus.

## Ruimte voor digitale voordelen

De officiële app moet uiteindelijk regels en campagne blijven beheren, terwijl de virtuele tafel de fysieke onderdelen weergeeft. Een toekomstige instructie zoals “plaats invloed tijdens de cityronde” hoeft dan niet meer door een speler te worden overgenomen.

De applicatie meldt nu iedere geslaagde toestandwijziging via `subscribe`, waarop de UI een nieuwe projectie rendert. Dit werkt ook als plaatsing vanuit andere code komt, zonder klik of expliciete refresh. Het observercontract is headless getest; in de browser is een opdracht buiten de UI uitgevoerd en direct zichtbaar geworden. De renderer en engine bevatten geen officiële app- of netwerkafhankelijkheid.

Nog te implementeren voor echte automatisering: een reproduceerbaar werkende communicatieadapter, interpretatie van echte appinstructies, autoriteit/toestemming per bericht, partiële plaatsingsupdates met behoud van overige stukken, atomaire groepen en dubbele/verouderde berichten. Alleen de observatie-/presentatieroute is nu gerealiseerd; er worden geen cityronde-instructies ontvangen of gesimuleerd als echte appdata. Het scherm vermeldt daarom Handmatig · app niet verbonden.

## Controle

`node --test` bevat regressies plus controle op veertig complete klikgebieden, ankers binnen het juiste gebied, geen geometrie in exports en observatie van externe opdrachten, undo/redo en import. Browsercontrole omvat daadwerkelijke klikken op alle veertig kaartankers, selectie, verplaatsing, een vol district, fichezijde, campagne-opstelling, JSON-herstel, toetsenbord, zoom/bordfocus en fallback zonder artwork. Schermen gecontroleerd op 2560×1440, 1600×1000, 1366×768, 768×1024 en 390×844. Screenshots en tijdelijke browsertools staan uitsluitend onder genegeerd `work/`.


De gekoppelde tafel heeft naast de kaart een Core-lezer en wachtrij voor miniaturen. Sleep een miniatuur naar de lezer en daarna naar de door Milan gevraagde locatie. Het eerste contact verandert geen blijvende bordpositie. De herstelknop onder Table menu → Connection & recovery maakt tijdelijke invoer na een crash opnieuw beschikbaar zonder de bevestigde tafelopstelling te wissen.
