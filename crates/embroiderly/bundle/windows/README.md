# Custom NSIS Installer

This folder contains a custom NSIS intaller.

It differs from [the original one](https://github.com/tauri-apps/tauri/tree/dev/crates/tauri-bundler/src/bundle/windows/nsis) in the following ways:

- A new page _File Associations_ created after the installation page.
  On this page, users can select which file types they want to associate with Embroiderly.
- This installer has custom language files.
  They are mainly extended with additional message needed for custom pages.

Every customization is identified with the `CUSTOM` comment.
