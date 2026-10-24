# De virtuele fysieke tafel

De gebruikerservaring vertrekt vanuit het bord op tafel. Op een breed scherm krijgt het bord alle ruimte naast een compacte zijbalk. Op tablet en telefoon schuift de zijbalk eronder. De hoofdweergave gebruikt de originele kaart uit het lokale artworkpakket. Figuren gebruiken de volledige personageafbeelding, kubussen en fiches hun eigen icoon. Geen externe grafische bibliotheek of netwerkdienst nodig.

## Bediening

- **Bekijken**: klik een district voor de volledige locatie-inhoud. Klik een geplaatst onderdeel om het te selecteren. Dit verandert geen speltoestand.
- **Plaatsen**: kies een onderdeel in de voorraad, of druk op Plaats / verplaats. Klik de bestemming; ook een district waar al onderdelen liggen blijft een geldige klikbestemming. Escape of Bekijken stopt het plaatsen.
- **Locatie**: alle aanwezige onderdelen zijn afzonderlijk selecteerbaar. Het geselecteerde voorraadonderdeel kan direct op deze locatie worden geplaatst. Boven vier onderdelen toont de kaart vier stukken en een `+n`-knop; de locatielijst blijft volledig.
- **Sessie**: JSON bewaren/openen, activiteiten en optionele lokale demo-dobbelsteen. Leegmaken staat achter een uitklapveld. Undo en redo staan direct onder het bord.
- **Passend / zoom**: het hele bord binnen de beschikbare breedte en hoogte, of tot 300% vergroten met scrollen/vegen. Bordfocus verbergt op desktop de zijbalk. De schematische weergave blijft beschikbaar.
- **Campagne-opstelling**: een apart venster voor het overnemen van de app-instructies. Geen ingebouwde officiële beginstand. **Tafelinstellingen** bevat profielen, broninformatie en beperkingen.

De klikgebieden zijn eigen benaderingen van de zichtbare gedrukte districten en Havenvelden. Het zijn geen spelregelgrenzen, bewezen aangrenzendheid of sensorcoördinaten. Logische plaatsing blijft een zone-ID. Bij afwezig artwork of een mislukte kaartdownload valt de weergave terug op het schema. Oude sessies gebruiken hun oorspronkelijke profiel en versies.

## Automatisch passend maken

De fysieke kaart start met **Auto fit**. De weergave meet de daadwerkelijke resterende vensterhoogte na de kop, werkbalk, appmeldingen, scanbediening en statusregel. De kaart behoudt haar verhouding en past binnen zowel breedte als hoogte. Op desktop sluit de hoogte van de zijbalk aan; op kleinere schermen blijft de zijbalk onder het bord staan.

Vensterwijzigingen, schermwisseling en gewijzigde meldinghoogten leiden automatisch tot een nieuwe berekening. Handmatig zoomen blijft beschikbaar; **Auto fit** herstelt de volledige kaart. Deze berekening verandert uitsluitend presentatie en laat bordposities, sensorinvoer en saves ongemoeid. De gekoppelde bordpagina is gecontroleerd op 2560×1440, 1920×1080, 1366×768, 1280×720, 768×1024 en 390×844, inclusief extra instructies boven het bord, zoomen en bordfocus.

## Ruimte voor digitale voordelen

De officiële app moet uiteindelijk regels en campagne blijven beheren, terwijl de virtuele tafel de fysieke onderdelen weergeeft. Een toekomstige instructie zoals “plaats invloed tijdens de cityronde” hoeft dan niet meer door een speler te worden overgenomen.

De applicatie meldt nu iedere geslaagde toestandwijziging via `subscribe`, waarop de UI een nieuwe projectie rendert. Dit werkt ook als plaatsing vanuit andere code komt, zonder klik of expliciete refresh. Het observercontract is headless getest; in de browser is een opdracht buiten de UI uitgevoerd en direct zichtbaar geworden. De renderer en engine bevatten geen officiële app- of netwerkafhankelijkheid.

Nog te implementeren voor echte automatisering: een reproduceerbaar werkende communicatieadapter, interpretatie van echte appinstructies, autoriteit/toestemming per bericht, partiële plaatsingsupdates met behoud van overige stukken, atomaire groepen en dubbele/verouderde berichten. Alleen de observatie-/presentatieroute is nu gerealiseerd; er worden geen cityronde-instructies ontvangen of gesimuleerd als echte appdata. Het scherm vermeldt daarom Handmatig · app niet verbonden.

## Controle

`node --test` bevat regressies plus controle op veertig complete klikgebieden, ankers binnen het juiste gebied, geen geometrie in exports en observatie van externe opdrachten, undo/redo en import. Browsercontrole omvat daadwerkelijke klikken op alle veertig kaartankers, selectie, verplaatsing, een vol district, fichezijde, campagne-opstelling, JSON-herstel, toetsenbord, zoom/bordfocus en fallback zonder artwork. Schermen gecontroleerd op 2560×1440, 1600×1000, 1366×768, 768×1024 en 390×844. Screenshots en tijdelijke browsertools staan uitsluitend onder genegeerd `work/`.
