# Virtuele hardware afzonderlijk valideren

Bijgesteld op 23 oktober 2026: de eerstvolgende stap is het gedrag van de fysieke Core afzonderlijk implementeren en testen. Een nieuwe Milan-campagne doorlopen is geen geschikte regressietest voor iedere hardwarewijziging. De officiële app blijft eigenaar van regels, worpen die zij zelf uitvoert, verhaal en campagneopslag.

## Testlagen

### Gesimuleerde batterij en aanwezigheid

De private Core geeft iedere virtuele dobbelsteen een eigen stabiel gesimuleerd batterijniveau, ruim boven een lage-ladingwaarschuwing. Het niveau blijft bij wakker maken, rollen en opnieuw verbinden hetzelfde; het is geen meting van een fysieke batterij. De status vermeldt expliciet dat de lading gesimuleerd is.

Tijdens een actieve spelverbinding worden aangemelde dobbelstenen periodiek als aanwezig gemeld, ook wanneer de speler er maar één gebruikt. Deze meldingen pauzeren tijdens een worp, verzinnen geen uitslag en veranderen de gekozen dobbelsteenselectie niet. Alleen opnieuw aanmelden was onvoldoende om eerder bekende dobbelsteenstatussen te verversen.

De private regressiesuite heeft negentien geslaagde scenario’s, inclusief stabiele lading, wakker maken zonder worp en statusmeldingen zonder verandering van bewaarde waarden. De onafhankelijke decoderproef bevestigt gezonde batterijniveaus en controleert dat extra statusmeldingen geen nieuwe start- of resultaatcallbacks veroorzaken. Ruwe waarnemingen, decoderinhoud en virtuele identiteiten blijven onder private/.

1. **Offline Core-tests:** sessiestatus, alle veertig contacten, gelijktijdige contacten, vrijgave, scanvoorwaarden, eigen synthetische identiteiten en herstel na verbreken. Geen radio, tablet of campagne nodig.
2. **Onafhankelijke SDK-controle:** de oorspronkelijke SDK leest de gegenereerde invoer en levert de verwachte callbacks. Dit controleert de interpretatie buiten onze eigen encoder.
3. **Virtuele Bluetooth-test:** ontdekking, verbinding, abonnementen, opdrachten, notificaties en verbreken tussen afzonderlijke softwarecontrollers.
4. **Fysieke acceptatie:** de ongewijzigde Milan-app op de echte tablet gebruikt de pc-Core. Alleen deze laag bewijst werking met de app; een geslaagde SDK-test vervangt dit bewijs niet.

De private offline runner compileert dezelfde Core-bron als de adapter, zonder Windows-Bluetoothbibliotheken of toegang tot appgegevens. Testbron, fixtures en rapporten blijven onder genegeerd `private/`. De publieke demo krijgt geen SDK-dependency.

## Huidige dekking

| Functie | Zelfstandige dekking | Milan op echte Android-tablet |
| --- | --- | --- |
| Sessie openen/sluiten en reset | Regressietest, inclusief honderd herstelcycli | Verbinding en setup bevestigd; herstel nog breder toetsen |
| Veertig tijdelijke contacten | Alle afzonderlijk, samen en onafhankelijk vrijgeven | Enkele bestemmingen bevestigd |
| Personage aanbieden | Scanvoorwaarden, annuleren, zeven synthetische selecties | Vier personages geregistreerd |
| Radio-instellingen | Bevestiging en interne toestand | Verbinding bewezen; geen bewijs van volledige hardwaredekking |
| Lichtopdrachten | Ontvangen opdracht veilig uitleesbaar | Nog geen zichtbare reproductie |
| Vijf virtuele fysieke d10's | Eigen vaste identiteiten, groeps- en selectieworpen, oorspronkelijke SDK-callbacks en virtueel Bluetooth-transport | Alle vijf herkend op het setupscherm; spelchecks nog toetsen |
| Firmware bijwerken / tags schrijven | Expliciet niet ondersteund | Normale appoptie om zonder update door te gaan gebruikt |
| Invloed en blijvende pionpositie | Afzonderlijke terugkoppeladapter | Android-kaartoverdracht nog onvolledig |
| Campagne opslaan en laden | Verantwoordelijkheid officiële app | Nog niet bevestigd op Android |

De offline run slaagt voor zestien scenario's, waaronder tien bestaande vergelijkingsbestanden. Deze vergelijkingsbestanden zijn regressiereferenties; zij vormen op zichzelf geen onafhankelijk bewijs. Het rapport vermeldt expliciet dat geen radio of officiële app is gebruikt.

De aanvullende onafhankelijke SDK-proef controleert alle veertig afzonderlijke contacten en vrijgaven, veertig gelijktijdige contacten en iedere afzonderlijke vrijgave zonder de andere contacten te verliezen. Ook het virtuele Bluetooth-transport heeft alle veertig contacten en vrijgaven doorgegeven. De bewegingsadapter is met nagebootste appwaarnemingen voor elf miniaturen × veertig bestemmingen gecontroleerd. Dit is softwaredekking; fysieke acceptatie op iedere bestemming blijft afzonderlijk nodig. Zie [sleepbediening en bewijsgrenzen](SLEPEN-EN-SENSOREN.md).

De oorspronkelijke SDK herkent vijf afzonderlijke synthetische d10's en hun onafhankelijke waarden, ook bij aanlevering in gesplitste berichten. De test omvat alle tien waarden van de eerste d10 en vervolgens een groepsworp met alle vijf. De private adapter biedt een willekeurige fysieke waarde van één tot en met tien per gekozen dobbelsteen; de aanvrager kan geen gewenste uitkomst opgeven. Iedere dobbelsteen behoudt zijn eigen lokaal opgeslagen identiteit. Dit is invoer voor de officiële app, geen eigen berekening van spelsucces.

De private pc-bediening biedt vijf selectievakjes, toont de laatst verzonden waarden en kan één tot vijf geselecteerde dice gooien. Lege of dubbele selecties worden geweigerd. Niet-geselecteerde dobbelstenen krijgen geen nieuwe worp. De browsercontrole toetst een volledige worp, een selectie van twee en het blokkeren van een lege selectie.

De virtuele Bluetooth-test ontdekte dat langere berichten bij de standaard pakketgrootte werden afgekapt. De adapter splitst notificaties nu op basis van de beschikbare pakketgrootte. De transporttest controleert complete ontvangst, vijf verschillende identiteiten, volledige en gedeeltelijke worpen, weigering van gelijktijdige worpen en annuleren bij uitschakelen of verbreken. Dit is getest met softwarecontrollers, zonder fysieke radio.

De aansluitende fysieke proef met de ongewijzigde Android-app bevestigt herkenning van de eerste virtuele d10 op het setupscherm en een zichtbare verandering van één naar vijf bij de tweede worp. Na het laden van de uitbreiding toont hetzelfde officiële setupscherm alle vijf de dobbelstenen, met dezelfde vijf waarden als de private pc-Core. De app toont firmware- en batterijwaarschuwingen doordat de virtuele dice hiervoor nog geen bruikbare telemetrie aanbieden. Dit bewijst geen geslaagde spelcheck, groepscheck of campagneopslag.

## Gerichte acceptatie na de hardwaretests

### Opstelling bij een nieuwe campagne

Een lege tafel met alleen vier personages is geen volledige spelopstelling. Op 23 oktober is de actuele Android-kaart voor alle dertig districten afzonderlijk uitgelezen en gecontroleerd: 22 controlefiches, twaalf invloedskubussen, vier personages en één onderzoeksfiche, samen 39 geplaatste onderdelen. Een tweede schermafbeelding bevestigde dezelfde invloed en controle vóór de atomaire overname. Orlando staat in deze momentopname in Portello; de andere drie personages op QT8. Dit betreft de huidige campagne tijdens Night 0, na de eerste handelingen, en is geen ongewijzigde beginopstelling of algemene startpreset.

De private opstellingsimport behoudt het reeds bevestigde onderzoeksfiche, controleert voorraad en unieke locaties/personages en weigert een onvolledige of ongeldige invoer zonder gedeeltelijke wijzigingen. Herhaling verandert de sessie niet. De browsercontrole bevestigt alle 39 plaatsingen. De beelduitlezing is alleen op het gecontroleerde tabletscherm gekalibreerd; algemene automatische kaartovername is hiermee nog niet bewezen.

Open acceptatie-eis voor iedere **New Chronicle**: beëindig de vorige tafelsessie, verzamel de complete door Milan gevraagde opstelling en toon pas gereed nadat alle benodigde componenten zijn gecontroleerd. Neem daarna de eerste bewegingen en nieuwe markers over. Die automatische initialisatieworkflow is nog niet geïmplementeerd; een opgeslagen momentopname van onze tafel vervangt ook geen save van de officiële app.

Tijdens de Android-tutorial zijn ook werkelijke bordinstructies zichtbaar: de waargenomen kaartmelding bevestigt één Anarch-invloed in Portello en de volgende encounter in Sempione. Na controle van het scherm en gebruikersbevestiging zijn de kubus en het onderzoeksfiche op de private digitale tafel geplaatst. De verwerking behoudt andere onderdelen, weigert ongeldige combinaties atomair en voegt bij herhaling geen duplicaten toe. Een browsercontrole bevestigt de plaatsingen. Dit is expliciete overname van deze instructie, nog geen algemene automatische herkenning van de Android-kaart. Een tutorial kan echte bordwijzigingen vereisen; uitsluitend de aanwezigheid van tutorialuitleg is geen reden om een gevraagde bordhandeling over te slaan.

Toets op Android achtereenvolgens ontdekking en herverbinding, personagescan, herhaald locatiecontact, een normale worp en een groepsworp. Controleer daarna een echte **Save & Quit** en **Load Game**, met behoud van positie en actiepunten. Houd deze uitkomst gescheiden van de eerdere Windows-proef, waarin hervatten wel is aangetoond.

De laatste Android-sessie kwam via de tutorial tot spelacties en twee geslaagde digitale appworpen. Een groepsworp bleef vervolgens wachten; Save & Quit was nog uitgeschakeld. De oorzaak is onbekend. De ontbrekende fysieke dobbelsteeninvoer is een implementatiegat, geen bewezen verklaring van deze blokkade. Het digitale bord toont voorlopig een overgenomen beginstand met vier personages, geen volledig bijgewerkte Android-speltoestand.

## Afzonderlijk wekken van vijf virtuele dobbelstenen — 24 oktober 2026

De gekoppelde bordpagina heeft nu **Wake 5 dice**, ook via de afgeschermde LAN-link. De actie is alleen beschikbaar tijdens hardware-setup, met een verbonden Core, een door Milan geopend dobbelsteenkanaal en zonder lopende worp. Het wekken meldt de vijf bestaande, eigen virtuele dobbelstenen opnieuw aan. Het start geen worp en kiest geen uitslagen. De bordpagina toont hoeveel dobbelstenen zijn aangemeld; deze lokale teller is op zichzelf geen appbevestiging.

De echte Android-proef is uitgevoerd vanaf de gedeelde bordpagina. Milan toonde daarna vijf dobbelsteenvakken en bood **Continue without updating** aan. De Core meldde vijf aangemelde dobbelstenen, geen lopende worp en geen nieuwe uitslagen. Het scherm toonde ook firmware-, batterij- en **Throw again**-aanduidingen. Daarmee is ontdekking in dit setupscherm aangetoond; geldige spelworpen en volledige dobbelsteencompatibiliteit volgen hier niet uit. Er is geen firmware-update uitgevoerd of beveiligingscontrole gewijzigd.

De private codec-regressie slaagt met 17 scenario's, inclusief apart wekken, herhaald aanmelden, weigeren van worpen tijdens het setupkanaal en het uitblijven van uitslagen bij wekken. De virtuele transportproef bevestigt vijf ontdekkingsmeldingen zonder worp, naast de eerdere sensor-, worp- en herverbindingscontroles. De publieke suite slaagt met 49 tests, inclusief toegangscode en oorsprongcontrole voor de nieuwe bordroute. Browsercontroles bevestigen de werkelijke wekknop, automatische schermpassing en behoud van slepen. Protocolcode, eigen identifiers en beelden blijven privé.
