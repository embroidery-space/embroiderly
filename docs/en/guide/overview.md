---
description: Learn about Embroiderly, a free and open-source desktop application for designing cross-stitch patterns.
head:
  - - meta
    - name: keywords
      content: embroiderly, cross-stitch, pattern design, embroidery software
---

# Overview

**Embroiderly** is a free, open-source, cross-platform desktop application designed to help you create beautiful cross-stitch patterns.
Embroiderly is built with modern technologies and with performance and accessability in mind.

Whether you're a professional designer working on complex patterns or a hobbyist exploring the art of embroidery, Embroiderly provides an intuitive and powerful environment for bringing your creative visions to life.

<figure>
  <img src="/images/guide/overview/welcome-screen.jpg">
  <figcaption>Welcome screen.</figcaption>
</figure>

## Key Features

Embroiderly offers a comprehensive set of tools for pattern design:

- **Multiple File Format Support**: Work with EMBPROJ, OXS, and XSD formats
- **Image Import**: Convert photos and graphics into cross-stitch patterns
- **PDF Export**: Export finished patterns as professional PDF documents
- **Palette and Symbols Management**: Organize thread colors and customize stitch symbols
- **Intuitive Drawing Tools**: Easy and straightforward pattern creation with immediate visual feedback
- **Advanced Shortcuts System**: Speed up your workflow with keyboard shortcuts

## Supported Platforms

Embroiderly is available on the following operating systems:

- **Windows 10, 11**: Fully supported with a native Windows installer
- **Linux**: Available via `.deb` (Debian/Ubuntu) and `.rpm` (Fedora/RHEL) packages

> [!NOTE]
> macOS is not currently supported due to technical limitations.
> We hope to add macOS support in future releases.

Mobile platforms are a subject of consideration, but their support is not planned in the near future.

> [!IMPORTANT]
> None of the distributables are currently signed, so you may see alerts from your operating system or antivirus that the application is unsafe.
> We know about this issue, but we currently don't have the resources to sign them.
>
> You can safely ignore those warning.
> Please refer to your OS/AV documentation to find out how to proceed with the installation.

## Supported File Formats

Embroiderly works with several cross-stitch pattern file formats to ensure compatibility with other applications:

- **EMBPROJ**: The native Embroiderly format.
  EMBPROJ is a regular ZIP archive containing the pattern file in the OXS format along with other files for the internal usage.
  While fully supported in Embroiderly, this format is not designed for interchanging with other applications.

- **OXS**: An open XML-based format created by [UrsaSoftware](https://ursasoftware.com/) as a universal interchange format in the embroidery world.
  Embroiderly provides full read and write support for OXS, making it ideal for sharing patterns with other embroidery software and people.

- **XSD**: A proprietary format of [Pattern Maker for Cross Stitch](https://web.archive.org/web/20191127080612/http://hobbyware.com/).
  Embroiderly can open and read XSD files, allowing you to import existing patterns from Pattern Maker, though it doesn't support saving to this format.
