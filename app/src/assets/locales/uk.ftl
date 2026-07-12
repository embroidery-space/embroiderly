
## Terms.
-app-name = Embroiderly

## Application credits.

app-credits = Розроблено з любовʼю в Україні

## Application menu.

app-menu-open = Відкрити меню застосунку

app-menu-file = Файл
app-menu-file-open = Відкрити
app-menu-file-open-demo = Відкрити демо-схему
app-menu-file-create = Створити
app-menu-file-save = Зберегти
app-menu-file-save-as = Зберегти як
app-menu-file-import = Імпортувати
app-menu-file-import-image = Зображення
app-menu-file-export = Експортувати
app-menu-file-close = Закрити схему
app-menu-file-quit = Вийти з { -app-name }

app-menu-pattern = Схема

app-menu-help = Допомога
app-menu-help-about = Про застосунок
app-menu-help-guide = Посібник
app-menu-help-license = Ліцензія

app-menu-manage = Керувати

app-fullscreen-enter = Повноекранний режим
app-fullscreen-exit = Вийти з повноекранного режиму

## Window controls.

window-minimize = Згорнути
window-maximize = Розгорнути
window-restore = Відновити
window-close = Закрити

## Editing history.

history-undo = Скасувати
history-redo = Повторити

## Modal actions.

modal-create = Створити
modal-copy = Копіювати
modal-save = Зберегти

modal-cancel = Скасувати
modal-close = Закрити

## Confirmation dialog buttons.

confirm-ok = Гаразд
confirm-yes = Так
confirm-no = Ні

## Generic labels.

choose-file = Вибрати файл

files-group-system = Системні
files-group-custom = Власні

## Generic error label.

error = Помилка

## Demo patterns.

demo-pattern-piggies = Поросята
demo-pattern-festive-capy = Святковий капібара
demo-pattern-pumpkin-cupcake = Гарбузовий кекс
demo-pattern-whisper-of-the-board = Шепіт дошки

## System info.

system-info =
  .title = Інформація про систему
  .description =
    Версія { -app-name }: { $appVersion } ({ $gitBranch }@{ $gitCommit }, { DATETIME($gitDate, dateStyle: "long") })
    Операційна система: { $os } { $osVersion }
    Браузер: { $browser } { $browserVersion }

## Startup notifications.

startup-file-association-failure = Не вдалося відкрити файл схеми: { $filePath }.
startup-template-failure = Не вдалося завантажити власний шаблон схеми: { $filePath }.

## Unsaved changes dialog.

unsaved-changes =
  .title = Незбережені зміни
  .description =
    Схема "{ $pattern }" має незбережені зміни.
    Чи хочете ви зберегти її перед закриттям?

## Pattern save/export notifications.

pattern-open-unsupported-type = Цей тип схеми не підтримується.
pattern-save-unsupported-type =
  Цей тип схеми не підтримується для збереження.
  Будь ласка, збережіть схему, використовуючи опцію "{ app-menu-file-save-as }" або "{ app-menu-file-export }".

pattern-save-success = Схему збережено
pattern-save-failure = Схему не вдалося зберегти

pattern-export-success = Схему експортовано
pattern-export-failure = Схему не вдалося експортувати

## Guided tour.

tour-offer =
  .title = Ласкаво просимо до { -app-name }!
  .description =
    Хочете пройти інтерактивний тур щодо роботи в { -app-name }?
    Це не займе багато часу.

tour-edit-palette =
  .title = Крок 1 — Редагування палітри
  .description = Натисніть кнопку «Редагувати палітру», щоб перейти в режим редагування та відкрити каталог палітр.

tour-add-color =
  .title = Крок 2 — Виберіть колір
  .description = Двічі натисніть будь-який колір, щоб додати його до вашої робочої палітри.

tour-save-palette =
  .title = Крок 3 — Збереження палітри
  .description = Натисніть «Зберегти палітру», щоб завершити редагування і повернутися до полотна.

tour-toolbar =
  .title = Крок 4 — Інструменти стібків
  .description = Виберіть вид стібків тут. Кожен інструмент дозволяє малювати різний вид стібків на полотні.

tour-canvas =
  .title = Крок 5 — Полотно
  .description = Тут ви створюєте ваші схеми. Натисніть будь-де на полотні, щоб намалювати стібок вибраним інструментом та кольором.

tour-canvas-panel =
  .title = Крок 6 — Параметри полотна
  .description = У цій панелі ви можете перемикати режим відображення, сітку, лінійки, символи та керувати шарами.

tour-finish =
  .title = Все готово!
  .description = Тепер ви можете почати створювати чудові схеми в { -app-name }.

tour-skip = Пропустити
tour-start = Пройти тур
tour-next = Далі
tour-done = Готово

## Welcome screen.

welcome = Ласкаво просимо до { -app-name }!

welcome-get-started =
  { $button-open } або { $button-create }, щоб розпочати.
  .button-open-label = Відкрийте схему
  .button-create-label = створіть нову
welcome-get-started-dnd = Або перетягніть файли схем сюди.

welcome-section-starting = Розпочати
welcome-open-pattern = Відкрити схему
welcome-create-pattern = Створити схему

welcome-section-customization = Персоналізація
welcome-customization-settings-title = Налаштування
welcome-customization-settings-description = Налаштуйте { -app-name } відповідно до ваших уподобань.

welcome-section-info = Дізнатися більше
welcome-info-docs-title = Документація
welcome-info-docs-description = Дізнайтеся, як використовувати { -app-name }, прочитавши наш посібник.

welcome-section-help = Отримати допомогу
welcome-help-tg = Чат у Telegram
welcome-help-fb = Група у Facebook

## Application settings.

settings = Налаштування

settings-reset = Скинути до типових налаштувань
settings-reset-confirm =
  .title = Скидання налаштувань
  .description = Ви впевнені, що хочете скинути всі налаштування до їхніх типових значень?

settings-interface = Інтерфейс

settings-theme = Тема
settings-theme-dark = Темна
settings-theme-light = Світла
settings-theme-system = Системна

settings-scale = Масштаб
settings-scale-xx-small = Найменший
settings-scale-x-small = Менший
settings-scale-small = Маленький
settings-scale-medium = Середній
settings-scale-large = Великий
settings-scale-x-large = Більший
settings-scale-xx-large = Найбільший

settings-language = Мова

settings-startup = Запуск

settings-startup-action = Відкрити під час запуску
settings-startup-action-nothing = Нічого
settings-startup-action-new-pattern = Нова схема
settings-startup-action-custom-template = Власний шаблон

settings-startup-template-path = Файл шаблона

settings-workarea = Робоча область

settings-workarea-rendering-antialias =
  .label = Згладжування
  .description = Цей параметр потребує перезавантаження.

settings-workarea-viewport-wheel-action = Дія колеса миші
settings-workarea-viewport-wheel-action-zoom = Зум
settings-workarea-viewport-wheel-action-scroll = Прокрутка

settings-workarea-pattern-layer-layout = Розташування шарів
settings-workarea-pattern-layer-layout-stitch-type = За типом стібка
settings-workarea-pattern-layer-layout-layer-order = За порядком шарів

settings-updater = Оновлювач

settings-updater-auto-check =
  .label = Автоматично перевіряти наявність оновлень
  .description = Якщо увімкнено, { -app-name } автоматично перевірятиме наявність оновлень під час запуску. Потребує перезавантаження.

settings-telemetry = Телеметрія

settings-telemetry-diagnostics =
  .label = Дозволити збір діагностичних звітів
  .description = Допоможіть покращити стабільність { -app-name } автоматично відправляючи діагностичні звіти при виникненні помилок або збоях у роботі застосунку.

settings-telemetry-metrics =
  .label = Дозволити збір метрик
  .description = Допоможіть покращити { -app-name }, відправляючи анонімізовані дані про використання застосунку.

settings-other = Інше

settings-autosave-interval =
  .label = Інтервал автозбереження
  .description = Якщо встановлено 0, автозбереження вимкнено.

settings-show-open-demo-pattern-option = Показати опцію "Відкрити демо-схему" у меню "Файл"

settings-use-palitem-color-for-stitch-tools = Використовувати колір елементу палітри для інструментів стібків

## Telemetry prompt.

telemetry-prompt = Допоможіть покращити { -app-name }
telemetry-prompt-notice = * Ви можете змінити свій вибір у будь-який час у налаштуваннях.
telemetry-prompt-reject = Ні, дякую
telemetry-prompt-accept = Увімкнути

## Application updater.

updater-check-for-updates = Перевірити наявність оновлень
updater-update-now = Оновити зараз

updater-update-available-desktop =
  .title = Доступне оновлення
  .description =
    Доступна нова версія { -app-name }!
    Ваша поточна версія: { $currentVersion }. Остання версія: { $version } від { DATETIME($date, dateStyle: "long") }.
    Чи хочете ви завантажити та встановити його зараз?
updater-update-available-pwa =
  .title = Доступне оновлення
  .description = Нова версія { -app-name } готова до встановлення! Перезавантажити зараз, щоб застосувати оновлення?

updater-no-updates-available =
  .title = Оновлень немає
  .description = Наразі немає доступних оновлень.

updater-unsaved-changes =
  .title = Незбережені зміни
  .description = Оновлення не може бути встановлено, поки ви не збережете та закриєте всі відкриті схеми.

## Canvas panel.

canvas-panel = Панель полотна

canvas-panel-collapse = Згорнути панель полотна
canvas-panel-expand = Розгорнути панель полотна

## Canvas view options.

canvas-view-mix = Змішаний вигляд
canvas-view-solid = Суцільний вигляд
canvas-view-stitches = Вигляд стібків

canvas-symbols = Символи
canvas-grid = Сітка
canvas-rulers = Лінійки

## Canvas zoom controls.

canvas-zoom-in = Збільшити
canvas-zoom-out = Зменшити

canvas-zoom-fit = Вмістити
canvas-zoom-fit-width = Вмістити по ширині
canvas-zoom-fit-height = Вмістити по висоті

## Canvas layers.

canvas-layers = Шари
canvas-layers-reference-image = Зразкове зображення
canvas-layers-full-stitches = Хрести
canvas-layers-petite-stitches = Петіти
canvas-layers-half-stitches = Півхрести
canvas-layers-quarter-stitches = Чвертьхрести
canvas-layers-back-stitches = Зворотні стібки
canvas-layers-straight-stitches = Прямі стібки
canvas-layers-french-knots = Фр. вузлики
canvas-layers-beads = Бісер
canvas-layers-special-stitches = Спеціальні стібки

canvas-layers-placeholder = Шар { $index }

canvas-layers-add = Додати шар
canvas-layers-remove = Видалити шар "{ $name }"
canvas-layers-remove-confirm =
  .title = Видалити шар
  .description = Ви впевнені, що хочете видалити шар "{ $name }"? Цю дію можна скасувати.

## Canvas context menu.

canvas-ctx-menu-set-image = Встановити зразкове зображення
canvas-ctx-menu-remove-image = Вилучити зразкове зображення

## Canvas notifications.

canvas-symbol-fonts-load-failure =
  .title = Не вдалося завантажити символьні шрифти
  .description =
    Не вдалося завантажити символьні шрифти: { $fonts }.
    Деякі символи можуть відображатися некоректно.

## Pattern information.

pattern-info = Інформація про схему

pattern-info-title = Назва
pattern-info-author = Автор
pattern-info-copyright = Авторські права
pattern-info-description = Опис

## Fabric properties.

pattern-creation = Нова схема
fabric-properties = Параметри тканини

fabric-size = Розмір
fabric-width = Ширина
fabric-height = Висота

# Use non-breaking space (\u00A0) to prevent text from jumping when changing fabric size.
# Example: "Розмір (ШxВ): 100x100 стібків, 4.00x4.00 дюймів (100x100 мм)".
fabric-total-size =
  Розмір{"\u00A0"}(ШxВ): { $width }x{ $height }{"\u00A0"}стібків,
  { NUMBER($widthInches, maximumFractionDigits: 2) }x{ NUMBER($heightInches, maximumFractionDigits: 2) }{"\u00A0"}дюймів
  ({ NUMBER($widthMm, maximumFractionDigits: 0) }x{ NUMBER($heightMm, maximumFractionDigits: 0) }{"\u00A0"}мм)

unit-stitches = стібків
unit-inches = дюймів
unit-mm = мм

fabric-count = Каунт
fabric-count-and-kind = Каунт і тип

fabric-kind = Тип
fabric-kind-aida = Аїда
fabric-kind-evenweave = Рівномірне плетіння
fabric-kind-linen = Льон

fabric-color = Колір
fabric-selected-color = Вибраний колір: { $color }

## Grid properties.

grid-properties = Параметри сітки

grid-major-lines-interval =
  .label = Інтервал головних ліній
  .hint = У стібках

grid-major-lines = Головні лінії
grid-minor-lines = Малі лінії

grid-color = Колір
grid-thickness = Товщина
grid-pixel-line =
  .label = Піксельна лінія
  .description = Якщо увімкнено, лінія сітки завжди буде малюватися товщиною 1px незалежно від вказаної товщини або масштабу канвасу.

## Palette panel.

palette-panel = Панель палітри

palette-panel-collapse = Згорнути панель палітри
palette-panel-expand = Розгорнути панель палітри

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
palette-panel-menu = Меню палітри

## Palette toolbar.

palette-toolbar-eraser = Гумка
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

palette-catalog-menu = Опції палітри
palette-catalog-menu-import-palettes = Імпортувати палітри

palette-catalog-search =
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

## Stitch symbols panel.

stitch-symbols = Символи

stitch-symbols-usage = { $total ->
  [0] Немає символів
  [one] { $total } символ ({ $used } використано)
  [few] { $total } символи ({ $used } використано)
  *[many] { $total } символів ({ $used } використано)
}
stitch-symbols-empty = Символи відсутні

stitch-symbols-menu = Опції символів
stitch-symbols-menu-import-fonts = Імпортувати шрифти

stitch-symbols-ctx-menu-set-symbol = Встановити символ
stitch-symbols-ctx-menu-unset-symbol = Прибрати символ

stitch-symbols-no-palitem-selected = Не вибрано жоден елемент палітри
stitch-symbols-already-assigned = Цей символ вже призначено іншому елементу палітри

stitch-symbols-import-success = Символьні шрифти успішно імпортовані
stitch-symbols-import-failure = Не вдалося імпортувати символьні шрифти
stitch-symbols-import-failed-files =
  .title = Невдалі файли шрифтів
  .description =
    Деякі файли шрифтів не вдалося імпортувати.
    Це може бути повʼязано з конфліктом назв сімейств шрифтів (вони повинні бути унікальними), відсутністю метаданих сімейства шрифтів або пошкодженням файлів шрифтів.

    { $failedFilesList }

stitch-symbols-load-failure = Не вдалося завантажити шрифт { $font }

## Stitch names.

stitch-full = Хрест

stitch-petite = Петіт
stitch-petite-tl = Петіт зверху ліворуч
stitch-petite-tr = Петіт зверху праворуч
stitch-petite-br = Петіт знизу праворуч
stitch-petite-bl = Петіт знизу ліворуч

stitch-half = Півхрест
stitch-half-forward = Прямий півхрест
stitch-half-backward = Зворотний півхрест

stitch-quarter = Чвертьхрест
stitch-quarter-tl = Чвертьхрест зверху ліворуч
stitch-quarter-tr = Чвертьхрест зверху праворуч
stitch-quarter-br = Чвертьхрест знизу праворуч
stitch-quarter-bl = Чвертьхрест знизу ліворуч

stitch-back = Зворотний стібок
stitch-straight = Прямий стібок

stitch-french-knot = Фр. вузелок
stitch-bead = Бісер

## Image importing.

image-import = Імпорт зображення

image-import-import-image = Імпортувати зображення

image-import-palette = Палітра
image-import-palette-size = Макс. розмір палітри

image-import-quant = Зменшення кольорів
image-import-quant-sampling = Точність вибірки

image-import-dither = Дизеринг
image-import-dither-enable = Застосувати дизеринг
image-import-dither-error = Сила дизерингу

image-import-pattern-properties = Розмір палітри: { $paletteSize }. Всього стібків: { $totalStitches }.

## PDF export.

pdf-export = Експорт PDF

pdf-export-variant-monochrome = Експортувати чорно-біле документ
pdf-export-variant-color = Експортувати кольоровий документ

pdf-export-save-settings = Зберегти налаштування
pdf-export-export-document = Експортувати документ

## Publish settings.

publish-settings = Налаштування публікації

publish-settings-print-options = Налаштування друку
publish-settings-print-center-frames = Центрувати фрейми
publish-settings-print-enumerate-frames = Нумерувати фрейми

publish-settings-frame-options = Параметри фрейма
publish-settings-frame-definition =
  Фрейм — це частина схеми.
  Великі схеми можуть бути розділені на кілька фреймів. Кожен фрейм розміщується на окремій сторінці.

publish-settings-frame-width = Ширина фрейма
publish-settings-frame-height = Висота фрейма

publish-settings-frame-preserved-overlap =
  .label = Збережене перекриття
  .description = Розмір перекриття між фреймами у стібках.

publish-settings-frame-show-grid-line-numbers = Показати номери ліній сітки
publish-settings-frame-show-centering-marks = Показати центрувальні мітки
