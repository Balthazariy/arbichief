# 🚀 ArbiChief - Шпаргалка

## Быстрые команды

### Запустить приложение
```powershell
.\release\win-unpacked\ArbiChief.exe
```

### Разработка
```bash
npm run electron:dev     # Electron с hot-reload
npm run dev              # Только веб-версия
```

### Сборка
```bash
npm run electron:build:win                                    # Быстро
powershell -ExecutionPolicy Bypass -File .\build-electron.ps1 # Полная сборка
```

### Очистка и пересборка
```bash
Remove-Item -Path ".\release",".\dist" -Recurse -Force; npm run electron:build:win
```

---

## Файлы для распространения

📦 **ZIP:** `release\ArbiChief-1.0.0-win.zip`
📁 **Портативная:** `release\ArbiChief-Portable\`
💻 **EXE:** `release\win-unpacked\ArbiChief.exe`

---

## Документация

- **README_ELECTRON.md** - Для пользователей
- **ELECTRON_QUICK_START.md** - Быстрый старт
- **BUILD_SUCCESS.md** - Инфо о сборке
- **ELECTRON_BUILD.md** - Техническая док

---

## Устранение проблем

**Не запускается?**
- Запустите от администратора
- Проверьте антивирус
- Разблокируйте файл (Свойства → Разблокировать)

**Ошибка сборки?**
```bash
Remove-Item .\node_modules -Recurse -Force
npm install
npm run electron:build:win
```

---

## Структура

```
release/
├── ArbiChief-1.0.0-win.zip    ← Отправить пользователям
├── win-unpacked/
│   └── ArbiChief.exe          ← Запустить
└── ArbiChief-Portable/        ← Скопировать куда угодно
```

---

**Готово! 🎉**

