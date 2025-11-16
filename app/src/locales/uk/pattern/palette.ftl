### Translations for the palette panel.

## Working palette.

palette-size = Палітра: { $size ->
  [0] порожня
  [one] { $size } колір
  [few] { $size } кольори
  *[many] { $size } кольорів
}
palette-empty = Палітра порожня

palette-edit = Редагувати палітру
palette-save = Зберегти палітру

## Palette toolbar.

palette-toolbar-cursor = Курсор

## Palette display options.

palette-display-options = Налаштування відображення

palette-columns-number = Кількість стовпців
palette-color-only = Тільки колір
palette-show-stitch-symbols = Відображати символи стібків
palette-contrast-stitch-symbols = Розмістити символи стібків на контрастному фоні
palette-show-brand = Відображати бренди ниток
palette-show-number = Відображати номери кольорів
palette-show-name = Відображати назви кольорів

## Working palette context menu.

palette-ctx-menu-sort-by = Сортувати за
palette-ctx-menu-sort-by-brand-and-number = Брендом і номером
palette-ctx-menu-delete-selected = { $selected ->
  [0] Видалити вибрані
  [one] Видалити { $selected } вибраний
  [few] Видалити { $selected } вибрані
  *[many] Видалити { $selected } вибраних
}
palette-ctx-menu-delete-all = Видалити всі

## Palette catalog.

palette-catalog = Кольори

palette-catalog-menu-import-palettes = Імпортувати палітри

label-palette-catalog-search =
  .placeholder = Пошук...

palette-catalog-import-success = Палітри успішно імпортовані
palette-catalog-import-failure = Не вдалося імпортувати палітри
palette-catalog-import-failed-files =
  .title = Невдалі файли палітр
  .description =
    Деякі файли палітри не вдалося імпортувати.
    Це може бути повʼязано з конфліктом назв палітр (вони повинні бути унікальними) або пошкодженням файлів палітр.

    { $failedFilesList }

palette-catalog-load-failure = Не вдалося завантажити палітру { $palette }

## Stitch symbols.

stitch-symbols = Символи

stitch-symbols-usage = { $total ->
  [0] Немає символів
  [one] { $total } символ ({ $used } використано)
  [few] { $total } символи ({ $used } використано)
  *[many] { $total } символів ({ $used } використано)
}
stitch-symbols-empty = Символи відсутні

stitch-symbols-menu-import-fonts = Імпортувати символьні шрифти

stitch-symbols-ctx-menu-set-symbol = Встановити символ
stitch-symbols-ctx-menu-unset-symbol = Прибрати символ

stitch-symbols-no-palitem-selected = Не вибрано жоден елемент палітри
stitch-symbols-already-assigned = Цей символ вже призначено іншому елементу палітри

stitch-symbols-import-success = Символьні шрифти успішно імпортовані
stitch-symbols-import-failure = Не вдалося імпортувати символьні шрифти
stitch-symbols-import-failed-files =
  .label = Невдалі файли шрифтів
  .description =
    Деякі файли шрифтів не вдалося імпортувати.
    Це може бути повʼязано з конфліктом назв сімейств шрифтів (вони повинні бути унікальними), відсутністю метаданих сімейства шрифтів або пошкодженням файлів шрифтів.

    { $failedFilesList }

stitch-symbols-load-failure = Не вдалося завантажити шрифт { $font }
