# Tauri Sidecars

Place here binaries that you want to use include into the production bundle.

For development, Tauri will automatically build all the necessary sidecars when you run `npm run tauri dev`.

For production, these sidecars will be builded and placed here during bundling.

For testing, you can run `sh scripts/create-dummy-embroiderly-export-sidecar.sh` to create dummy `embroiderly-export` sidecar.
