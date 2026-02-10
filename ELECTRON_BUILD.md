# Сборка Electron приложения ArbiChief

## Предварительные требования
- Node.js (версия 18 или выше)
- npm

## Команды для работы с Electron

### Разработка
```bash
# Запуск веб-версии (только браузер)
npm run dev

# Запуск Electron-версии с hot-reload
npm run electron:dev
```

### Сборка в exe-файл

#### Сборка для Windows x64 (рекомендуется)
```bash
npm run electron:build:win
```

Эта команда создаст:
- ZIP архив (ArbiChief-1.0.0-win.zip)
- Распакованную версию в папке win-unpacked/

**Примечание:** Из-за проблемы с правами доступа для создания символических ссылок в Windows, 
установщик NSIS и portable версия недоступны. Используйте ZIP архив или распакованную версию.

Файлы будут находиться в папке `release/`

#### Создание портативной версии
После сборки вы можете создать портативную версию:
```bash
Copy-Item ".\release\win-unpacked" ".\release\ArbiChief-Portable" -Recurse -Force
```

Или используйте готовый скрипт:
```bash
powershell -ExecutionPolicy Bypass -File ".\create-portable.ps1"
```

## Структура проекта

```
arbichief/
├── electron/
│   ├── main.js         # Главный процесс Electron
│   └── preload.js      # Preload скрипт для безопасной связи
├── src/                # Исходный код React приложения
├── dist/               # Собранные файлы (создается автоматически)
├── release/            # Готовые exe-файлы (создается автоматически)
└── public/
    └── icon.ico        # Иконка приложения (нужно добавить)
```

## Настройка иконки

1. Создайте или найдите иконку в формате .ico (256x256 пикселей)
2. Поместите её в папку `public/icon.ico`
3. Иконка будет автоматически использована при сборке

Если иконки нет, приложение соберется с иконкой по умолчанию.

## Конфигурация сборки

Настройки electron-builder находятся в `package.json` в секции `"build"`:

- `appId` - уникальный идентификатор приложения
- `productName` - отображаемое имя приложения
- `win.target` - типы сборки для Windows (nsis, portable)
- `nsis` - настройки установщика

## Устранение проблем

### Ошибка: "Cannot find module 'electron'"
```bash
npm install
```

### Ошибка при сборке
Убедитесь, что:
1. Все зависимости установлены: `npm install`
2. Проект собирается корректно: `npm run build`
3. Нет ошибок TypeScript

### Приложение не запускается после сборки
Проверьте пути к файлам в `electron/main.js` и настройку `base: './'` в `vite.config.ts`

## Дополнительные ресурсы

- [Документация Electron](https://www.electronjs.org/docs)
- [Документация electron-builder](https://www.electron.build/)

