# Скрипт для создания портативной версии ArbiChief

Write-Host "🚀 Создание портативной версии ArbiChief..." -ForegroundColor Cyan

# Путь к исходной папке
$sourcePath = ".\release\win-unpacked"
$zipPath = ".\release\ArbiChief-Portable-1.0.0.zip"
$portablePath = ".\release\ArbiChief-Portable"

# Проверка существования исходной папки
if (-not (Test-Path $sourcePath)) {
    Write-Host "❌ Ошибка: папка win-unpacked не найдена. Сначала выполните: npm run electron:build:win" -ForegroundColor Red
    exit 1
}

# Создание портативной версии
Write-Host "📦 Копирование файлов..." -ForegroundColor Yellow
if (Test-Path $portablePath) {
    Remove-Item $portablePath -Recurse -Force
}
Copy-Item $sourcePath $portablePath -Recurse

# Создание README для портативной версии
$readmeContent = @"
# ArbiChief - Портативная версия

Это портативная версия ArbiChief. Для запуска просто откройте файл ArbiChief.exe

## Особенности портативной версии:
- ✅ Не требует установки
- ✅ Можно запускать с USB-накопителя
- ✅ Все данные хранятся локально
- ✅ Полная функциональность приложения

## Системные требования:
- Windows 10 или выше (x64)
- 4 ГБ RAM (рекомендуется)
- 500 МБ свободного места на диске

## Запуск:
Дважды кликните на ArbiChief.exe

---
ArbiChief v1.0.0
"@

Set-Content -Path "$portablePath\README.txt" -Value $readmeContent -Encoding UTF8

Write-Host "✅ Портативная версия создана: $portablePath" -ForegroundColor Green
Write-Host ""
Write-Host "📁 Вы можете найти файлы здесь:" -ForegroundColor Cyan
Write-Host "   - Распакованная: .\release\win-unpacked\" -ForegroundColor White
Write-Host "   - ZIP архив: .\release\ArbiChief-1.0.0-win.zip" -ForegroundColor White
Write-Host "   - Портативная: .\release\ArbiChief-Portable\" -ForegroundColor White
Write-Host ""
Write-Host "🎉 Готово! Приложение можно распространять." -ForegroundColor Green

