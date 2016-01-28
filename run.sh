#!/bin/bash

source build.sh
"${MODULES}/http-server/bin/http-server" "${BUILD_FOLDER}" -p 8000 --cors
