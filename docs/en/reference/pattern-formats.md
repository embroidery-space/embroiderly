---
description: Cross-stitch pattern file formats supported by Embroiderly.
---

# Supported Pattern File Formats

Embroiderly works with several cross-stitch pattern file formats to ensure compatibility with other applications:

- **EMBPROJ**: The native Embroiderly format.
  EMBPROJ is a regular ZIP archive containing the pattern file in the OXS format along with other files for the internal usage.
  While fully supported in Embroiderly, this format is not designed for interchanging with other applications.

- **OXS**: An open XML-based format created by [UrsaSoftware](https://ursasoftware.com/) as a universal interchange format in the embroidery world.
  Embroiderly provides full read and write support for OXS, making it ideal for sharing patterns with other embroidery software and people.

- **XSD**: A proprietary format of [Pattern Maker for Cross Stitch](https://web.archive.org/web/20191127080612/http://hobbyware.com/).
  Embroiderly can open and read XSD files, allowing you to import existing patterns from Pattern Maker, though it doesn't support saving to this format.
