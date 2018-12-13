#!/bin/bash
set -e

SOURCE_FOLDER="./src"
JS_SOURCE=${SOURCE_FOLDER}"/js/main.js"
LESS_SOURCE="${SOURCE_FOLDER}/less/cropOntologyWidget.less"

BUILD_FOLDER="./dist"
MODULES="./node_modules"

[ -d "$MODULES" ] || {
  echo "ERROR: Missing 'node_modules' folder, please run 'npm install'"
  exit 1;
}

build_module() {
  # Prepare NPM module to be imported in GPDS
  MODULE_FOLDER="${BUILD_FOLDER}/module"
  mkdir -p "${MODULE_FOLDER}"
  DEST_MODULE="${MODULE_FOLDER}/cropOntologyWidget.module"

  echo "NPM module:"

  # JS (export widget for ES6 import)
  echo -e "[JS]\t ${JS_SOURCE} => ${DEST_MODULE}.js "
  "${MODULES}/browserify/bin/cmd.js" "${JS_SOURCE}" -t babelify --debug -o "${DEST_MODULE}.js" -s CropOntologyWidget

  # CSS
  echo -e "[CSS]\t ${LESS_SOURCE} => ${DEST_MODULE}.css "
  cp "${DEST_FILE}.css" "${DEST_MODULE}.css"

  # Style images
  cp ${MODULES}/jstree/dist/themes/default/*.{png,gif} "${MODULE_FOLDER}"

  echo ""
}

build_bundle() {
  # Run browserify => Bundle widget and its dependencies into one file
  echo "Bundling:"
  DEST_FILE="${BUILD_FOLDER}/cropOntologyWidget"

  echo -e "[JS]\t ${JS_SOURCE} => ${DEST_FILE}.js "
  "${MODULES}/browserify/bin/cmd.js" "${JS_SOURCE}" -t babelify --debug -o "${DEST_FILE}.js" &
  # the '--debug' option adds source mapping for easier debugging in web inspector

  echo -e "[CSS]\t  ${LESS_SOURCE} => ${DEST_FILE}.css "
  "${MODULES}/less/bin/lessc" "${LESS_SOURCE}" "${DEST_FILE}.css" &

  echo ""
  wait
}

build_minify() {
  # Run uglify => Reduce file size
  echo "Minifying:"
  DEST_MIN_FILE="${BUILD_FOLDER}/cropOntologyWidget.min"

  echo -e "[JS]\t  ${DEST_FILE}.js => ${DEST_MIN_FILE}.js "
  "${MODULES}/.bin/uglifyjs" "${DEST_FILE}.js" -o "${DEST_MIN_FILE}.js" &

  echo -e "[CSS]\t  ${DEST_FILE}.css => ${DEST_MIN_FILE}.css "
  "${MODULES}/.bin/cleancss" "${DEST_FILE}.css" -o "${DEST_MIN_FILE}.css" &
  wait

  echo ""
}

build() {
  [ -d "${BUILD_FOLDER}" ] && rm -rf "${BUILD_FOLDER}"/*
  mkdir -p "${BUILD_FOLDER}"

  build_bundle

  build_minify

  build_module

  cp -R ./demo/* "${BUILD_FOLDER}"
}
build
