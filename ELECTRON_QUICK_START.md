# 🚀 ArbiChief - Быстрый старт Electron

## ✅ Сборка завершена успешно!

Ваше приложение ArbiChief собрано в настольное приложение Windows.

---

## 📦 Готовые файлы (в папке `release/`):

1. **ArbiChief-1.0.0-win.zip** - ZIP архив приложения
2. **win-unpacked/** - Распакованная версия (готова к запуску)
3. **ArbiChief-Portable/** - Портативная версия с инструкциями

---

## 🎯 Быстрый запуск:

### Запустить приложение прямо сейчас:
```powershell
.\release\win-unpacked\ArbiChief.exe
```

### Или двойной клик:
Откройте проводник → `D:\UnityProjects\arbichief\release\win-unpacked\` → Запустите `ArbiChief.exe`

---

## 🔄 Команды для работы:

### Запуск в режиме разработки (с hot-reload):
```bash
npm run electron:dev
```

### Пересборка приложения:
```bash
npm run electron:build:win
```

### Запуск веб-версии (только браузер):
```bash
npm run dev
```

---

## 📤 Как распространять:

### Вариант 1: ZIP архив
- Отправьте файл `ArbiChief-1.0.0-win.zip`
- Пользователь распаковывает и запускает `ArbiChief.exe`

### Вариант 2: Портативная папка
- Скопируйте папку `ArbiChief-Portable/`
- Отправьте пользователю (можно на USB, облако и т.д.)
- Внутри есть README с инструкциями

---

## 🛠️ Устранение проблем:

### Приложение не запускается?
1. Убедитесь, что у вас Windows 10/11 (64-bit)
2. Проверьте, не блокирует ли антивирус
3. Попробуйте запустить от имени администратора

### Нужно пересобрать?
```bash
# Очистка
Remove-Item -Path ".\release" -Recurse -Force
Remove-Item -Path ".\dist" -Recurse -Force

# Новая сборка
npm run electron:build:win
```

### Ошибки при сборке?
```bash
# Переустановка зависимостей
Remove-Item -Path ".\node_modules" -Recurse -Force
npm install
npm run electron:build:win
```

---

## 🎨 Добавление иконки:

1. Поместите файл `icon.ico` в папку `public/`
2. Размер: 256x256 пикселей
3. Пересоберите: `npm run electron:build:win`

**Конвертеры PNG→ICO:**
- https://www.icoconverter.com/
- https://convertio.co/ru/png-ico/

---

## 📋 Что дальше?

- ✅ Протестируйте приложение
- ✅ Добавьте иконку (опционально)
- ✅ Распространяйте пользователям
- ✅ Создайте релиз на GitHub (опционально)

---

## 📚 Подробная документация:

- **BUILD_SUCCESS.md** - Полная инструкция по сборке
- **ELECTRON_BUILD.md** - Техническая документация
- **create-portable.ps1** - Скрипт для портативной версии

---

## ✨ Готово!

Ваше приложение работает и готово к использованию! 🎉

**Путь к exe:** `D:\UnityProjects\arbichief\release\win-unpacked\ArbiChief.exe`

Удачи! 🚀

