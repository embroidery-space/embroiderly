---
layout: home
hero:
  name: Embroiderly
  tagline: Безкоштовний, відкритий і кросплатформний компʼютерний застосунок для створення схем вишивок хрестиком
  actions:
    - theme: brand
      text: Завантажити
      link: ./download
    - theme: alt
      text: Розпочати
      link: ./guide/
features:
  - title: Підтримка різних форматів файлів
    details: Працюйте з форматами EMBPROJ, OXS та XSD
    link: ./reference/pattern-formats
  - title: Імпортування зображень
    details: Перетворюйте фотографії та малюнки у схеми вишивок хрестиком
    link: ./guide/importing-images
  - title: Експорт PDF
    details: Експортуйте свої схеми у професійні документи PDF
    link: ./guide/publishing-patterns
  - title: Керування палітрою та символами
    details: Упорядковуйте кольори ниток та налаштовуйте символи стібків
    link: ./guide/palette-and-symbols
  - title: Інтуїтивні інструменти для малювання
    details: Просте і зрозуміле створення схем із миттєвим візуальним відгуком
    link: ./guide/working-with-patterns
  - title: Просунута система сполучень клавіш
    details: Пришвидшіть свій робочий процес за допомогою сполучень клавіш
    link: ./reference/shortcuts
---

<hr>

<VPSwiper
  :slides="[
    '/images/overview/welcome-screen.png',
    '/images/overview/pattern-editor.png',
    '/images/overview/palette-editing.png',
    '/images/overview/pattern-info.png',
    '/images/overview/fabric-properties.png',
    '/images/overview/grid-properties.png',
    '/images/overview/pdf-export.png',
    '/images/overview/image-import.png',
  ]"
  :no-fullscreen="true"
/>
