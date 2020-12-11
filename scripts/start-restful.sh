#!/usr/bin/env bash

DIR=.
# check if restful submodule has been pulled
if [ ! -f "$DIR"/packages/jasmine-restful/package.json ]; then
  git submodule update --init --recursive
fi

# install node.js dependency
yarn

if [ ! -f "$DIR"/restful.config.yml ]; then
  echo "RESTful service configuration file not found. It should be at PROJECT_ROOT/restful.config.yml"
  exit 1
fi

# copy restful.config
cp "$DIR"/restful.config.yml "$DIR"/packages/jasmine-restful/config.yml

yarn workspace jasmine-restful install
yarn workspace jasmine-restful start
