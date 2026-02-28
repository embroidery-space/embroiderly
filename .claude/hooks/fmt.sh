#!/bin/bash

input=$(cat)
file=$(echo "$input" | jq -r '.tool_input.file_path')

if [ -z "$file" ] || [ "$file" == "null" ] || [ ! -f "$file" ]; then
  exit 0
fi

if [[ "$file" == *.rs ]]; then
  cargo +nightly fmt "$file"
else
  pnpm exec oxfmt "$file"
fi
