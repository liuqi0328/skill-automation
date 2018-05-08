#!/usr/bin/env bash

echo 'installing package...'
npm install
echo 'install complete...'

echo 'creating build...'
mkdir submission
zip -X -r submission/index.zip * -x build build/* *.xlsx Skills Skills/* test test/* speechAssets speechAssets/* index.zip deploy.sh > /dev/null
echo 'build complete...'