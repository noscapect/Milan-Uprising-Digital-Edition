# Virtuele hardware afzonderlijk valideren

Bijgesteld op 23 oktober 2026: de eerstvolgende stap is het gedrag van de fysieke Core afzonderlijk implementeren en testen. Een nieuwe Milan-campagne doorlopen is geen geschikte regressietest voor iedere hardwarewijziging. De officiële app blijft eigenaar van regels, worpen die zij zelf uitvoert, verhaal en campagneopslag.

## Testlagen

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
| Virtuele fysieke d10 | Encoder, invoergrenzen, oorspronkelijke SDK-callbacks voor alle tien waarden en virtueel Bluetooth-transport | Nog geen acceptatiebewijs |
| Firmware bijwerken / tags schrijven | Expliciet niet ondersteund | Normale appoptie om zonder update door te gaan gebruikt |
| Invloed en blijvende pionpositie | Afzonderlijke terugkoppeladapter | Android-kaartoverdracht nog onvolledig |
| Campagne opslaan en laden | Verantwoordelijkheid officiële app | Nog niet bevestigd op Android |

De eerste offline run slaagt voor vijftien scenario's, waaronder tien bestaande vergelijkingsbestanden. Deze vergelijkingsbestanden zijn regressiereferenties; zij vormen op zichzelf geen onafhankelijk bewijs. Het rapport vermeldt expliciet dat geen radio of officiële app is gebruikt.

De oorspronkelijke SDK herkent afzonderlijk ontdekking van de synthetische d10, tien rolstarts en de tien bijbehorende eindwaarden, ook bij aanlevering in gesplitste berichten. De private adapter biedt een experimentele worp met een willekeurige fysieke waarde van één tot en met tien; de aanvrager kan geen gewenste uitkomst opgeven. Dit is invoer voor de officiële app, geen eigen berekening van spelsucces.

De virtuele Bluetooth-test ontdekte dat langere berichten bij de standaard pakketgrootte werden afgekapt. De adapter splitst notificaties nu op basis van de beschikbare pakketgrootte. De transporttest controleert complete ontvangst, een stabiele eigen dobbelsteenidentiteit, weigering van gelijktijdige worpen en annuleren bij uitschakelen of verbreken. Dit is getest met softwarecontrollers, zonder fysieke radio. Activering en acceptatie in de echte Android-sessie blijven een vervolgstap.

## Gerichte acceptatie na de hardwaretests

Toets op Android achtereenvolgens ontdekking en herverbinding, personagescan, herhaald locatiecontact, een normale worp en een groepsworp. Controleer daarna een echte **Save & Quit** en **Load Game**, met behoud van positie en actiepunten. Houd deze uitkomst gescheiden van de eerdere Windows-proef, waarin hervatten wel is aangetoond.

De laatste Android-sessie kwam via de tutorial tot spelacties en twee geslaagde digitale appworpen. Een groepsworp bleef vervolgens wachten; Save & Quit was nog uitgeschakeld. De oorzaak is onbekend. De ontbrekende fysieke dobbelsteeninvoer is een implementatiegat, geen bewezen verklaring van deze blokkade. Het digitale bord toont voorlopig een overgenomen beginstand met vier personages, geen volledig bijgewerkte Android-speltoestand.
