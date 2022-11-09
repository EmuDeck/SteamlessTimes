#!/bin/bash

pnpm build

rm -rf build
mkdir -p build/"$1"/dist
cd build || exit

cp ../dist/index.js "$1"/dist/index.js
cp ../*.py -t "$1"
cp ../package.json "$1"
cp ../plugin.json "$1"
cp ../LICENSE "$1"
cp ../README.md "$1"

zip "$1-$2.zip" "$1"/dist/index.js
zip "$1-$2.zip" "$1/"*.py
zip "$1-$2.zip" "$1/"*.json
zip "$1-$2.zip" "$1"/LICENSE
zip "$1-$2.zip" "$1"/README.md