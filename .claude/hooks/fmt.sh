#!/bin/bash

input=$(cat)
file=$(echo "$input" | jq -r '.tool_input.file_path')

if [ -z "$file" ] || [ "$file" == "null" ] || [ ! -f "$file" ]; then
  exit 0
fi

ext="${file##*.}"
case "$ext" in
  # Unsupported file extensions.
  ftl)
    exit 0
    ;;

  # Rust.
  rs)
    cargo +nightly fmt -- "$file"
    ;;

  # Oxc handles all other files.
  *)
    pnpm exec oxfmt -- "$file"
    ;;
esac
