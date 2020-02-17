# ioBroker-Creating-Alias
Basierend auf dem Skript von paul53 - https://forum.iobroker.net/topic/27295/vorlage-alias-per-skript-erzeugen

Was dieses Skript kann:

- Erzeugung von Alias Datenpunkten
- Die Werte wie Quelle des Alias, Ziel Datenpunkt des Alias, Raum, Funktion etc. können alle der Funktion selber übergeben werden
- Der Präfix alias.0. kann hierbei weggelassen werden und wird automatisch generiert
- Um Räume und Funktionen dem Alias mitzugeben sind diese beim Aufrufen der Methode mitzugeben und am Ende des Skripts muss die Funktion assignEnums() einmalig aufgerufen werden
- Die Knoten Datenpunke (Im Objektexplorer als Ordner dargestellt) über den eigentlichen Alias Werten können mit den Variablen bCreateAliasPath und bConvertExistingPath so erstell/umgewandelt werden, dass man ihnen Räume und Funktionen zuordnen kann

bCreateAliasPath
=> Beim Anlegen eines Alias, werden die Knoten Datenpunkte die noch nicht existieren, direkt so erstellt, dass man ihnen Räume und Funktionen zuweisen kann.

bConvertExistingPath (Erfordert das bCreateAliasPath auf true gesetzt ist)
=> Auch schon existierende Knoten Datenpunkte werden konvertiert um Räume und Funktionen zuweisen zu können.
