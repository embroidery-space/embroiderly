### Global app translations.

-app-name = Embroiderly

app-credits = Розроблено з любовʼю в Україні

## Application menu.

app-menu-file = Файл
app-menu-file-open = Відкрити
app-menu-file-open-demo = Відкрити демосхему
app-menu-file-create = Створити
app-menu-file-save = Зберегти
app-menu-file-save-as = Зберегти як
app-menu-file-import = Імпортувати
app-menu-file-import-image = Зображення
app-menu-file-export = Експортувати
app-menu-file-close = Закрити схему
app-menu-file-quit = Закрити { -app-name }

app-menu-pattern = Схема

app-menu-tools = Інструменти
app-menu-manage = Керувати

app-menu-help = Допомога
app-menu-help-about = Про застосунок
app-menu-help-guide = Посібник
app-menu-help-license = Ліцензія

app-fullscreen-enter = Повноекранний режим
app-fullscreen-exit = Вийти з повноекранного режиму

## Demo patterns.

demo-pattern-piggies = Поросята
demo-pattern-festive-capy = Святковий капі
demo-pattern-pumpkin-cupcake = Гарбузовий кекс
demo-pattern-whisper-of-the-board = Шепіт дошки

## System info.

system-info =
  .title = Інформація про систему
  .description =
    Версія { -app-name }: { $appVersion } ({ $gitBranch }@{ $gitCommit }, { DATETIME($gitDate, dateStyle: "long") })
    Операційна система: { $os } { $osVersion }
    Бравзер: { $browser } { $browserVersion }

## Editor notifications and errors.

error = Помилка

pattern-open-unsupported-type = Цей тип схеми не підтримується.
puttern-save-unsupported-type =
  Цей тип схеми не підтримується для збереження.
  Будь ласка, збережіть схему, використовуючи опцію "{ app-menu-file-save-as }" або "{ app-menu-file-export }".

pattern-backup-file-exists =
  Для цієї схеми існує файл резервної копії.
  Чи хочете ви відновити прогрес з нього?

pattern-save-success = Схему збережено
pattern-save-failure = Схему не вдалося зберегти

pattern-export-success = Схему експортовано
pattern-export-failure = Схему не вдалося експортувати

startup-file-association-failure = Не вдалося відкрити цільову схему: { $filePath }.
startup-template-failure = Не вдалося завантажити власний шаблон схеми: { $filePath }.

unsaved-changes =
  .title = Незбережені зміни
  .description =
    Cхеми "{ $pattern }" має незбережені зміни.
    Чи хочете ви зберегти її перед закриттям?
