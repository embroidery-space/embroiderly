---
layout: home
hero:
  name: Embroiderly
  tagline: A free and open-source application for designing cross-stitch patterns
  actions:
    - theme: brand
      text: Open in Browser
      link: https://embroiderly.niusia.me
    - theme: alt
      text: Download
      link: ./download
    - theme: alt
      text: Get Started
      link: ./guide/
features:
  - title: Cross-Platform
    details: Use Embroiderly in any modern browser, access it offline, install it as a PWA, or download a native installer for Windows and Linux
    link: ./download
  - title: Multiple File Format Support
    details: Work with EMBPROJ, OXS, and XSD formats
    link: ./reference/pattern-formats
  - title: Image Import
    details: Convert photos and graphics into cross-stitch patterns
    link: ./guide/importing-images
  - title: PDF Export
    details: Export your patterns as professional PDF documents
    link: ./guide/publishing-patterns
  - title: Palette and Symbols Management
    details: Organize thread colors and customize stitch symbols
    link: ./guide/palette-and-symbols
  - title: Custom Layers
    details: Organize your pattern into isolated drawing layers to experiment freely without affecting the rest of your work
    link: ./guide/working-with-patterns#layers
  - title: Intuitive Drawing Tools
    details: Easy and straightforward pattern creation with immediate visual feedback
    link: ./guide/working-with-patterns#stitch-tools
  - title: Advanced Shortcuts System
    details: Speed up your workflow with keyboard shortcuts
    link: ./reference/shortcuts
---

<hr>

<VPSwiper
  :slides="[
    '/images/en/overview/welcome-screen.png',
    '/images/en/overview/pattern-editor.png',
    '/images/en/overview/palette-editing.png',
    '/images/en/overview/pattern-info.png',
    '/images/en/overview/fabric-properties.png',
    '/images/en/overview/grid-properties.png',
    '/images/en/overview/pdf-export.png',
  ]"
  :no-fullscreen="true"
/>
