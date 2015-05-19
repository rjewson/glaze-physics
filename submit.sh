#!/bin/sh
rm glaze2.zip
zip -r glaze2.zip src demo bin build.hxml haxelib.json README.md -x "*/\.*"
haxelib submit glaze2.zip