#!/usr/bin/env bash

path=$(jq -r '.tool_input.file_path // ""')

if [[ "$path" == *"assets/locales/"* && "$path" != *"en.ftl" ]]; then
  echo "Only app/src/assets/locales/en.ftl may be read. Other locale files are maintained by human translators."
  exit 2
fi
