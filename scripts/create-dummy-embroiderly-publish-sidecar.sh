#!/bin/bash

# This script is used to create dummy files for the Embroiderly Publish sidecar binaries.
# They are needed to successfully run check on the Rust code.

touch crates/embroiderly/binaries/embroiderly-publish-x86_64-pc-windows-msvc.exe
touch crates/embroiderly/binaries/embroiderly-publish-x86_64-unknown-linux-gnu
