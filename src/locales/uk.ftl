-app-name = Embroiderly

## Common labels usually used in the menu items, buttons and their tooltips.

label-file = Файл
label-pattern = Схема

label-tools = Інструменти

label-help = Допомога
label-license = Ліцензія
label-about = Про застосунок

label-manage = Керувати

label-open = Відкрити
label-create = Створити
label-save = Зберегти
label-save-as = Зберегти як
label-save-changes = Зберегти зміни
label-close = Закрити
label-export = Експортувати
label-cancel = Скасувати
label-copy = Скопіювати

label-minimize = Згорнути
label-maximize = Розгорнути
label-restore = Відновити

label-undo = Скасувати
label-redo = Повторити

label-ok = Гаразд
label-yes = Так
label-no = Ні

## Names of the stitches and other instruments.

label-stitch-full = Хрест
label-stitch-petite = Петіт
label-stitch-half = Півхрест
label-stitch-quarter = Чвертьхрест
label-stitch-back = Зворотний стібок
label-stitch-straight = Прямий стібок
label-stitch-french-knot = Фр. вузелок
label-stitch-bead = Бісер

## Titles, labels and messages related to the updater.

label-updater = Оновлювач

label-check-for-updates = Перевірити наявність оновлень
label-update-now = Оновити зараз

label-auto-check-for-updates = Автоматично перевіряти наявність оновлень
message-auto-check-for-updates-hint = Якщо увімкнено, { -app-name } автоматично перевірятиме наявність оновлень під час запуску. Потребує перезавантаження.

title-update-available = Доступне оновлення
message-update-available =
  Доступна нова версія { -app-name }!
  Ваша поточна версія: { $currentVersion }. Остання версія: { $version } від { DATETIME($date, dateStyle: "long") }.
  Чи хочете ви завантажити та встановити його зараз?
  Будь ласка, збережіть свої схеми перед продовженням, оскільки застосунок буде перезапущено.

title-no-updates-available = Оновлень немає
message-no-updates-available = Наразі немає доступних оновлень.

## Titles, labels and messages related to the welcome page.

title-welcome = { -app-name }

message-get-started =
  { $button-open } або { $button-create }, щоб розпочати.
  .button-open-label = Відкрийте схему
  .button-create-label = створіть нову
message-get-started-drag-and-drop = Або перетягніть файли схем сюди.

label-start = Розпочати
label-start-open = Відкрити схему
label-start-create = Створити схему

label-customize = Персоналізація
label-customize-settings = Налаштування
message-customize-settings = Налаштуйте { -app-name } відповідно до ваших уподобань.

label-learn-more = Дізнатися більше
label-learn-more-documentation = Документація
message-learn-more-documentation = Дізнайтеся, як використовувати { -app-name }, прочитавши наш посібник.

label-get-help = Отримати допомогу
label-get-help-telegram = Чат у Telegram

message-credits = Розроблено з любовʼю в Україні

## Titles, labels and messages related to the palette panel.

label-palette-size = Палітра: { $size ->
  [0] порожня
  [one] { $size } колір
  [few] { $size } кольори
  *[many] { $size } кольорів
}
message-palette-empty = Палітра порожня

label-palette-edit = Редагувати палітру

label-palette-colors = Кольори
label-palette-display-options = Налаштування відображення
label-palette-delete-selected = { $selected ->
  [0] Видалити вибрані
  [one] Видалити { $selected } вибраний
  [few] Видалити { $selected } вибрані
  *[many] Видалити { $selected } вибраних
}
label-palette-select-all = Виділити всі

label-display-options-columns-number = Кількість стовпців
label-display-options-color-only = Тільки колір
label-display-options-show-brand = Відображати бренди ниток
label-display-options-show-number = Відображати номери кольорів
label-display-options-show-name = Відображати назви кольорів

## Titles, labels and messages related to the canvas panel and its settings.

label-view-as-mix = Відображати як мікс суцільного і стібків
label-view-as-solid = Відображати як суцільне
label-view-as-stitches = Відображати як стібки

label-show-symbols = Показати символи
label-hide-symbols = Сховати символи

## Titles, labels and messages related to the settings dialog.

title-settings = Налаштування

label-interface = Інтерфейс

label-theme = Тема
label-theme-dark = Темна
label-theme-light = Світла
label-theme-system = Системна

label-scale = Масштаб
label-scale-xx-small = Найменший
label-scale-x-small = Менший
label-scale-small = Маленький
label-scale-medium = Середній
label-scale-large = Великий
label-scale-x-large = Більший
label-scale-xx-large = Найбільший

label-language = Мова

label-viewport = Область перегляду
message-viewport-hint = Ці налаштування вимагають перезавантаження.

label-viewport-antialias = Згладжування

label-viewport-wheel-action = Дія колеса миші
label-viewport-wheel-action-zoom = Зум
label-viewport-wheel-action-scroll = Прокрутка

label-other = Інше

label-autosave-interval = Інтервал автозбереження
message-autosave-interval-description = Якщо встановлено 0, автозбереження вимкнено.

label-use-palitem-color-for-stitch-tools = Використовувати колір елементу палітри для інструментів стібків

## Titles, labels and messages related to the pattern information dialog.

title-pattern-info = Інформація про схему

label-pattern-title = Назва
label-pattern-author = Автор
label-pattern-copyright = Авторські права
label-pattern-description = Опис

## Titles, labels and messages related to the fabric properties dialog.

title-fabric-properties = Параметри тканини

label-size = Розмір
label-width = Ширина
label-height = Висота

label-unit-stitches = стібків
label-unit-inches = дюймів
label-unit-mm = мм

label-count = Каунт
label-count-and-kind = Каунт і тип

label-kind = Тип
label-kind-aida = Аїда
label-kind-evenweave = Рівномірне плетіння
label-kind-linen = Льон

message-selected-color = Вибраний колір: { $color }

message-total-size = Розмір (ШxВ): { $width }x{ $height } стібків, { $widthInches }x{ $heightInches } дюймів ({ $widthMm }x{ $heightMm } мм)

## Titles, labels and messages related to the grid properties dialog.

title-grid-properties = Параметри сітки

label-major-lines-interval = Інтервал головних ліній
message-major-lines-interval-hint = У стібках

label-major-lines = Головні лінії
label-minor-lines = Малі лінії

label-color = Колір
label-thickness = Товщина

message-thickness-hint = У пунктах

## Titles, labels and messages related to notification and error messages.
message-pattern-saved = Схему збережено
message-pattern-exported = Схему експортовано

title-unsaved-changes = Незбережені зміни
message-unsaved-changes =
  У схеми є незбережені зміни.
  Чи хочете ви зберегти її перед закриттям?
message-unsaved-patterns =
  У вас є схеми із незбереженими змінами:
  { $patterns }
  Чи хочете ви зберегти їх перед закриттям застосунку?

title-system-info = Інформація про систему
message-system-info =
  Операційна система: { $osType } { $osVersion } { $osArch }
  Версія { -app-name }: { $appVersion }
  Версія WebView: { $webviewVersion }

title-error = Помилка

message-error-unsupported-pattern-type = Цей тип схеми не підтримується.
message-error-unsupported-pattern-type-for-saving =
  Цей тип схеми не підтримується для збереження.
  Будь ласка, збережіть схему, використовуючи опцію "{ label-save-as }" або "{ label-export }".

message-error-backup-file-exists =
  Для цієї схеми існує файл резервної копії.
  Чи хочете ви відновити прогрес з нього?
