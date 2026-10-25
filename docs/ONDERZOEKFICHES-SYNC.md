# Onderzoeksfiche uit een encountermelding

De private adapter herkent de zichtbare melding **[locatie] – Next Encounter in [bestemming]** in een faseoverzicht. Beide locatienamen moeten bekende stadsdistricten zijn. Na twee overeenkomende waarnemingen wordt op de bestemming een fiche met de zijde **Investigation** geplaatst. Een al aanwezig onderzoeksfiche wordt hergebruikt; opnieuw lezen maakt geen duplicaten. Andere onderzoeksfiches en Restricted-zijden blijven behouden.

Dit herstelt ook een ontbrekend fiche na **Clear board & resync**, zolang de betreffende melding nog zichtbaar is in Milan. De overname werkt op de achtergrond zonder een open browser of Codex. Een onbekende bestemming, onduidelijke melding of lege fichevoorraad verandert de tafel niet gedeeltelijk. Deze uitbreiding leest geen onderzoeksiconen van willekeurige kaartschermen: zonder zichtbare ondersteunde instructie kan de adapter die informatie nog niet reconstrueren.

De actuele melding **QT8 – Next Encounter in Washington** is gecontroleerd tegen het zichtbare fiche bij Washington in de officiële Android-app. Na activering heeft de achtergrondadapter dit fiche geplaatst; de gedeelde bordpagina toont het bij Washington met het lokale Investigation-artwork. Er is geen sensorcontact of spelactie naar Milan verstuurd.

De publieke suite heeft 67 geslaagde tests. De geïsoleerde private proef speelt de echte schermopname opnieuw af en controleert herstel na leegmaken, twee waarnemingen, geen duplicaten en weigering van een onbekende bestemming. De bestaande nachtfaseproef voor personageverplaatsingen en controleverwijdering slaagt eveneens. Ruwe schermopnamen blijven onder genegeerd `private/`.
