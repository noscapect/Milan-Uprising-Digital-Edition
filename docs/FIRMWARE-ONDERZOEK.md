# Firmware als onafhankelijke onderzoeksbron

Onderzocht op 24 oktober 2026, nadat de gebruiker de officiële Teburu-app op de tablet had geopend en vroeg of een firmware-update kon worden onderschept voor onderzoek naar het Core-gedrag.

## Uitkomst

Onderscheppen is voor deze eerste stap niet nodig. De geïnstalleerde officiële Teburu Android-app **1.2.0** bevat al afzonderlijke firmware-updatearchieven voor Core, dice en LED-ring. Via de bestaande geautoriseerde USB-verbinding is uitsluitend het gebundelde Core-archief naar de genegeerde onderzoeksmap gekopieerd. De officiële app en firmware zijn niet gewijzigd; er is niet op Update gedrukt en geen firmware verstuurd of geïnstalleerd.

De bestandsnaam van het bordpakket verwijst naar **2.31**. Dat bewijst niet dat dit de nieuwste online versie is, of dat de virtuele Core deze firmware uitvoert. Ten tijde van dit onderzoek meldde de virtuele Core versie 0.0.0. Inmiddels bestaat op gebruikersverzoek een [afzonderlijke gesimuleerde update met blijvende compatibiliteitsversies](FIRMWARE-SIMULATIE.md); ook die voert geen officiële firmware uit.

## Gecontroleerde eigenschappen

| Eigenschap | Waarneming |
| --- | --- |
| Pakket | ZIP met toepassingsmanifest, firmware-image en initmetadata |
| Omvang ZIP | 145.117 bytes |
| Omvang image | 144.288 bytes; gelijk aan de grootte in de initmetadata |
| Integriteit | SHA-256 van de image komt overeen met de hash in de initmetadata |
| Ondertekening | Ondertekende metadata-envelop aanwezig; handtekening niet cryptografisch geverifieerd of gewijzigd |
| Debugaanduiding | Bestandsnaam bevat debug; initmetadata heeft de debugvlag uit |
| Meegeleverde bron/symbolen | Geen C-bronbestanden of ELF-bestand in het updatepakket |
| Technische aanwijzingen | Vectorgegevens en leesbare moduleverwijzingen wijzen op Nordic nRF52-/ARM-microcontrollercode; exacte chip nog niet bevestigd |

Herkenbare moduleverwijzingen betreffen onder meer BLE, radio, LED-aansturing, USB, timers en de RFID-driver. Dit zijn aanknopingspunten voor statische analyse, geen bewijs dat hun volledige werking al is gereconstrueerd. Exacte bytes, modulepaden, archieven, hashes en analyses blijven privé; beschermde firmware wordt niet gepubliceerd.

Het manifest en de initmetadata sluiten aan bij het door Nordic gedocumenteerde DFU-formaat. Het officiële [protobuf-schema](https://github.com/NordicSemiconductor/pc-nrfutil/blob/master/nordicsemi/dfu/dfu-cc.proto) beschrijft onder meer toepassingsgrootte, hash en ondertekende commando-envelop. De [S113-documentatie](https://docs.nordicsemi.com/r/bundle/sds_s113/page/sds/s1xx/s113.html) beschrijft de betreffende BLE-stack voor nRF52-systemen. Het aantreffen van zulke verwijzingen maakt een volledige chip- of versie-identificatie nog niet bewezen.

## Nut voor de virtuele Core

De firmware kan als aanvullende, onafhankelijke referentie dienen voor commandoafhandeling, toestandovergangen, foutreacties en timing. Eerst worden concrete verschillen met het reeds waargenomen app-/SDK-gedrag onderzocht. Bevindingen krijgen afzonderlijke tests in onze eigen implementatie en daarna acceptatie met de ongewijzigde app.

Een microcontroller-image draait niet rechtstreeks als Windows-programma. Uitvoering in een volledige hardware-emulator zou ook ontbrekende geheugenindeling, BLE-stack, radio, RFID en overige randapparatuur moeten modelleren. De eerste onderzoekslijn is daarom statische analyse, zonder firmwarepatches, beveiligingsomzeiling of een vervalste versieclaim.

Een toekomstige update-opvang zou bovendien een afzonderlijke update-/bootloaderroute moeten modelleren. Alleen op Update klikken garandeert geen volledige overdracht naar de bestaande pc-Core. De officiële [updatebeschrijving](https://teburu.zendesk.com/hc/en-us/articles/25458803972635-Teburu-system-Updates-Upgrades) beschrijft een updateproces met herverbinding; de huidige virtuele Core ondersteunt dat proces niet.
