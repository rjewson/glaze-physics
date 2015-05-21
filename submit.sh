#!/bin/sh
rm glaze2.zip
zip -r glaze-physics.zip src demo bin build.hxml haxelib.json README.md -x "*/\.*"
haxelib submit glaze-physics.zip