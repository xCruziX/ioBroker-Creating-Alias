# ioBroker-Creating-Alias
Basierend auf dem Skript von paul53 - https://forum.iobroker.net/topic/27295/vorlage-alias-per-skript-erzeugen

Was dieses Skript kann:

- Erzeugung von Alias Datenpunkten
- Die Werte wie Quelle des Alias, Ziel Datenpunkt des Alias, Raum, Funktion etc. können alle der Funktion selber übergeben werden
- Der Präfix alias.0. kann hierbei weggelassen werden und wird automatisch generiert
- Um Räume und Funktionen dem Alias mitzugeben sind diese beim Aufrufen der Methode mitzugeben
- Die Knoten Datenpunke (Im Objektexplorer als Ordner dargestellt) über den eigentlichen Alias Werten können mit den Variablen bCreateAliasPath und bConvertExistingPath so erstellt/umgewandelt werden, dass man ihnen Räume und Funktionen zuordnen kann

bCreateAliasPath
=> Beim Anlegen eines Alias, werden die Knoten Datenpunkte die noch nicht existieren, direkt so erstellt, dass man ihnen Räume und Funktionen zuweisen kann.

bConvertExistingPath (Erfordert das bCreateAliasPath auf true gesetzt ist)
=> Auch schon existierende Knoten Datenpunkte werden konvertiert um Räume und Funktionen zuweisen zu können.

Beispiele:

Erstellt wird aus shelly.0.SHSW-1#68BAC3#1.Relay0.Switch der Alias Test.Licht.An (alias.0.Test.Licht.An)
```
let idSource = 'shelly.0.SHSW-1#68BAC3#1.Relay0.Switch';
let idTargetAlias = 'Test.Licht.An';
let room = 'Wohnzimmer';
let funct = 'Licht';

createAlias(idSource,idTargetAlias,room,funct);
```

Erstellt wird aus shelly.0.SHSW-1#68BAC3#1.Relay0.Switch der Alias Test.Licht.Shelly.An (alias.0.Test.Licht.Shelly.An)
und aus sonoff.0.dev-1.on der Alias Test.Licht.Sonoff.An (alias.0.Test.Licht.Sonoff.An)
```
let idSource = 'shelly.0.SHSW-1#68BAC3#1.Relay0.Switch';
let idTargetAlias = 'Test.Licht.Shelly.An';
let room = 'Wohnzimmer';
let funct = 'Licht';

createAlias(idSource,idTargetAlias,room,funct);
createAlias('sonoff.0.dev-1.on','Test.Licht.Sonoff.An','Wohnzimmer','Licht');
```
