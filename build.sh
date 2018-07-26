#!/bin/bash
set -e

SOURCE_FOLDER="./src"
BUILD_FOLDER="./dist"
MODULES="./node_modules"

[ -d "$MODULES" ] || {
  echo "ERROR: Missing 'node_modules' folder, please run 'npm install'"
  exit 1;
}

build() {
  [ -d "${BUILD_FOLDER}" ] && rm -rf "${BUILD_FOLDER}"/*
  mkdir -p "${BUILD_FOLDER}"

  JS_FILES=${SOURCE_FOLDER}"/js/main.js"
  LESS_FILES="$(ls ${SOURCE_FOLDER}/less/*.less)"

  # Run browserify => Bundle widget and its dependencies into one file
  echo "Bundling:"
  DEST_FILE="${BUILD_FOLDER}/cropOntologyWidget"

  echo -ne "[JS]\t"
  echo " ${JS_FILES} => ${DEST_FILE}.js "
  "${MODULES}/browserify/bin/cmd.js" "${JS_FILES}" -t babelify --debug -o "${DEST_FILE}.js" &
  # the '--debug' option adds source mapping for easier debugging in web inspector

  echo -ne "[CSS]\t"
  echo " ${LESS_FILES} => ${DEST_FILE}.css "
  #"${MODULES}/npm-css/bin/npm-css" "${LESS_FILES}" -o "${DEST_FILE}.css"
  "${MODULES}/less/bin/lessc" "${LESS_FILES}" "${DEST_FILE}.css" &
  wait

  echo ""

  # Run uglify => Reduce file size
  echo "Minifying:"
  DEST_MIN_FILE="${BUILD_FOLDER}/cropOntologyWidget.min"

  echo -ne "[JS]\t"
  echo " ${DEST_FILE}.js => ${DEST_MIN_FILE}.js "
  "${MODULES}/.bin/uglifyjs" "${DEST_FILE}.js" -o "${DEST_MIN_FILE}.js" &

  echo -ne "[CSS]\t"
  echo " ${DEST_FILE}.css => ${DEST_MIN_FILE}.css "
  "${MODULES}/.bin/cleancss" "${DEST_FILE}.css" -o "${DEST_MIN_FILE}.css" &
  wait

  echo ""

  cp -R ./demo/* "${BUILD_FOLDER}"
}
build
