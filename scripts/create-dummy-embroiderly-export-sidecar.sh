#!/bin/bash

# This script is used to create dummy files for the Embroiderly export sidecar binaries.
# They are needed to successfully run check on the Rus`t code.

touch crates/embroiderly/binaries/embroiderly-export-x86_64-pc-windows-msvc.exe
touch crates/embroiderly/binaries/embroiderly-export-x86_64-unknown-linux-gnu
