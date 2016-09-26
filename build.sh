#!/bin/bash

BUILD_FOLDER="./build"
MODULES="./node_modules"

[ -d "$MODULES" ] || {
  echo "ERROR: Missing 'node_modules' folder, please run 'npm install'"
  exit 1;
}

[ -d "${BUILD_FOLDER}" ] && rm -rf "${BUILD_FOLDER}"
mkdir "${BUILD_FOLDER}"

SOURCE_FILES="$(ls ./src/js/*.js)"

# Run browserify => Bundle widget and its dependencies into one file
echo "Bundling widget..."
DEST_FILE="${BUILD_FOLDER}/cropOntologyWidget.js"
"${MODULES}/browserify/bin/cmd.js" "${SOURCE_FILES}" -o "${DEST_FILE}"

# Run uglify => Reduce file size
echo "Minifying widget..."
DEST_MIN_FILE="${BUILD_FOLDER}/cropOntologyWidget.min.js"
"${MODULES}/uglifyjs/bin/uglifyjs" "${DEST_FILE}" -o "${DEST_MIN_FILE}"

cp -R ./demo/* "${BUILD_FOLDER}"
cp -R ./src/css "${BUILD_FOLDER}"
